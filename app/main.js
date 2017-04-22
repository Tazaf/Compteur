const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
const MenuItem = electron.MenuItem
const globalShortcut = electron.globalShortcut
const ipc = electron.ipcMain
const path = require('path')
const url = require('url')
const events = require(path.join(__dirname, 'lib', 'event-service.js'))
const AppMenuItems = require(path.join(__dirname, 'lib', 'get-menu-item.js'))
const WindowsManager = require(path.join(__dirname, 'lib', 'windows-manager.js'))
const Settings = require(path.join(__dirname, 'lib', 'settings-constants.js'))

const DEBUG = false

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let wins = WindowsManager.repository

/* ----- APP EVENTS ----- */

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  Menu.setApplicationMenu(AppMenu())
  registerShortcuts()
  WindowsManager.createGameMasterView()
  WindowsManager.createSpectatorView()
  // WindowsManager.toggleSpectatorView()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (wins.gmView === null) {
    WindowsManager.createGameMasterView()
    WindowsManager.createSpectatorView()
  }
})

/* ----- INTERNAL EVENTS ----- */

ipc.on(events.nbPlayerModal, WindowsManager.showNbPlayersModal)

ipc.on(events.nbPlayerModalClose, () => wins.nbPlayer.close())

ipc.on(events.nbPlayerSelected, (event, args) => {
  wins.nbPlayer.close()
  wins.gmView.webContents.send(events.nbPlayerSelected, args)
  wins.spectator.webContents.send(events.nbPlayerSelected, args)
})

ipc.on(events.enableNewPlayerMenuItem, () => AppMenuItems.addNewPlayer().enabled = true)

ipc.on(events.disableNewPlayerMenuItem, () => AppMenuItems.addNewPlayer().enabled = false)

ipc.on(events.updatePlayerName, (event, args) => wins.spectator.webContents.send(events.updatePlayerName, args))
ipc.on(events.updatePlayerScore, (event, args) => wins.spectator.webContents.send(events.updatePlayerScore, args))

ipc.on(events.addNewPlayer, addNewPlayer)

/* ----- FUNCTIONS DECLARATIONS ----- */

/**
 * Register the shortcutes for this app
 */
function registerShortcuts() {
  globalShortcut.register('CmdOrCtrl+N', WindowsManager.showNbPlayersModal)
  globalShortcut.register('CmdOrCtrl+J', addNewPlayer)
  globalShortcut.register('Alt+S', WindowsManager.toggleSpectatorView)
  globalShortcut.register('Alt+F11', WindowsManager.toggleSpectatorViewFullScreen)
  globalShortcut.register('Alt+V', setVerticalDisplay)
  globalShortcut.register('Alt+H', setHorizontalDisplay)
}

/**
 * Defines the menu for the application
 */
function AppMenu() {
  const menuTemplate = [
    {
      label: 'Partie',
      id: 'game',
      submenu: [
        {
          label: 'Nouvelle partie',
          icon: path.join(__dirname, 'assets', 'material-icons-font', 'icons', 'ic_add_black_18dp_1x.png'),
          accelerator: 'CmdOrCtrl+N',
          click: WindowsManager.showNbPlayersModal
        }, { type: 'separator' }, {
          label: 'Ajouter un joueur',
          icon: path.join(__dirname, 'assets', 'material-icons-font', 'icons', 'ic_person_add_black_18dp.png'),
          id: 'add-new-player',
          accelerator: 'CmdOrCtrl+J',
          enabled: false,
          click: addNewPlayer
        }
      ]
    }, {
      label: "Vue Spectateur",
      submenu: [
        {
          label: 'Afficher',
          id: 'spectator-view-on',
          icon: path.join(__dirname, 'assets', 'material-icons-font', 'icons', 'ic_visibility_black_18dp_1x.png'),
          accelerator: 'Alt+S',
          click: WindowsManager.toggleSpectatorView
        }, {
          label: 'Cacher',
          id: 'spectator-view-off',
          icon: path.join(__dirname, 'assets', 'material-icons-font', 'icons', 'ic_visibility_off_black_18dp_1x.png'),
          accelerator: 'Alt+S',
          click: WindowsManager.toggleSpectatorView,
          visible: false
        }, {
          label: 'Plein écran',
          id: 'full-screen-on',
          icon: path.join(__dirname, 'assets', 'material-icons-font', 'icons', 'ic_fullscreen_black_18dp_1x.png'),
          accelerator: 'Alt+F11',
          enabled: false,
          click: WindowsManager.toggleSpectatorViewFullScreen
        }, {
          label: 'Plein écran',
          id: 'full-screen-off',
          icon: path.join(__dirname, 'assets', 'material-icons-font', 'icons', 'ic_fullscreen_exit_black_18dp_1x.png'),
          accelerator: 'Alt+F11',
          click: WindowsManager.toggleSpectatorViewFullScreen,
          visible: false
        }, { type: 'separator' }, {
          label: 'Affichage...',
          id: 'display',
          enabled: false,
          submenu: [
            {
              label: 'Horizontal',
              id: 'horizontal-display',
              type: 'radio',
              accelerator: 'Alt+H',
              click: setHorizontalDisplay,
              checked: true
            }, {
              label: 'Vertical',
              id: 'vertical-display',
              type: 'radio',
              accelerator: 'Alt+V',
              click: setVerticalDisplay
            }
          ]
        }, { type: 'separator' }, {
          label: 'Trier les joueurs...',
          id: 'player-sort',
          enabled: false,
          icon: path.join(__dirname, 'assets', 'material-icons-font', 'icons', 'ic_sort_black_18dp_1x.png'),
          submenu: [
            {
              label: "Par ordre alphabétique ascendant",
              type: 'radio'
            }, {
              label: "Par ordre alphabétique descendant",
              type: 'radio'
            }, {
              label: "Par nombre de points croissant",
              type: 'radio'
            }, {
              label: "Par nombre de points décroissant",
              type: 'radio'
            }
          ]
        }
      ]
    }
  ]
  const AppMenu = Menu.buildFromTemplate(menuTemplate)
  if (DEBUG) {
    const debugMenuItem = new MenuItem({
      label: 'Debug',
      submenu: [
        { role: 'toggledevtools' },
        { role: 'reload' }
      ]
    })

    AppMenu.append(debugMenuItem)
  }
  return AppMenu
}

/**
 * Sends an event to the Game Master Window, for it to add a new Player Card to the Players List
 */
function addNewPlayer() {
  wins.gmView.webContents.send(events.addNewPlayer)
  wins.spectator.webContents.send(events.addNewPlayer)
}

function setVerticalDisplay() {
  if (wins.spectator.isVisible()) {
    changeDisplayType(Settings.VERTICAL_VIEW_TYPE)
    AppMenuItems.verticalDisplay().checked = true
  }
}

function setHorizontalDisplay() {
  if (wins.spectator.isVisible()) {
    changeDisplayType(Settings.HORIZONTAL_VIEW_TYPE)
    AppMenuItems.horizontalDisplay().checked = true
  }
}

/**
 * Tells the Spectator View how it should display its information
 * @param {*} type The display type to set
 */
function changeDisplayType(type) {
  wins.spectator.webContents.send(events.changeDisplayType, { displayType: type })
}