const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
const globalShortcut = electron.globalShortcut
const dialog = electron.dialog
const ipc = electron.ipcMain
const NativeImage = electron.nativeImage
const path = require('path')
const url = require('url')
const events = require(path.join(__dirname, 'lib', 'event-service.js'))
const getMenuItem = require(path.join(__dirname, 'lib', 'get-menu-item.js'))
const WindowsManager = require(path.join(__dirname, 'lib', 'windows-manager.js'))

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let wins = WindowsManager.repository

// Cache for Menu Item
let CacheMenuItems = {
  spectatorView: undefined,
  newPlayer: undefined
}

/* ----- APP EVENTS ----- */

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  Menu.setApplicationMenu(AppMenu())
  registerShortcuts()
  WindowsManager.createGameMasterView()
  WindowsManager.createSpectatorView(closeSpectatorView)
  toggleSpectatorView()
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
    WindowsManager.createSpectatorView(closeSpectatorView)
  }
})

/* ----- INTERNAL EVENTS ----- */

ipc.on(events.nbPlayerModal, showNbPlayersModal)

ipc.on(events.nbPlayerModalClose, () => wins.nbPlayer.close())

ipc.on(events.nbPlayerSelected, (event, args) => {
  wins.nbPlayer.close()
  wins.gmView.webContents.send(events.nbPlayerSelected, args)
  wins.spectator.webContents.send(events.nbPlayerSelected, args)
})

ipc.on(events.enableNewPlayerMenuItem, () => {
  getNewPlayerMenuItem().enabled = true
})

ipc.on(events.disableNewPlayerMenuItem, () => {
  getNewPlayerMenuItem().enabled = false
})

ipc.on(events.updatePlayerName, (event, args) => wins.spectator.webContents.send(events.updatePlayerName, args))
ipc.on(events.updatePlayerScore, (event, args) => wins.spectator.webContents.send(events.updatePlayerScore, args))

ipc.on(events.addNewPlayer, addNewPlayer)

/* ----- FUNCTIONS DECLARATIONS ----- */

/**
 * Register the shortcutes for this app
 */
function registerShortcuts() {
  globalShortcut.register('CmdOrCtrl+N', showNbPlayersModal)
  globalShortcut.register('CmdOrCtrl+J', addNewPlayer)
  globalShortcut.register('Alt+S', toggleSpectatorView)
}

/**
 * Defines the menu for the application
 */
function AppMenu() {
  const menuTemplate = [
    {
      label: 'Partie',
      submenu: [
        {
          label: 'Nouvelle partie',
          icon: path.join(__dirname, 'assets', 'material-icons-font', 'icons', 'ic_add_black_18dp_1x.png'),
          accelerator: 'CmdOrCtrl+N',
          click: showNbPlayersModal
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
          id: 'spectator-view',
          type: 'checkbox',
          accelerator: 'Alt+S',
          click: toggleSpectatorView
        }, { type: 'separator' }, {
          label: 'Trier les joueurs...',
          icon: path.join(__dirname, 'assets', 'material-icons-font', 'icons', 'ic_sort_black_18dp_1x.png'),
          submenu: [
            {
              label: "Par ordre alphabétique ascendant",
              type: 'radio'
            }, {
              label: "Par ordre alphabétique desendant",
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
    }, {
      role: 'quit',
      label: 'Fermer'
    }, {
      label: 'Debug',
      submenu: [
        { role: 'toggledevtools' },
        { role: 'reload' }
      ]
    }
  ]
  const AppMenu = Menu.buildFromTemplate(menuTemplate)
  return AppMenu
}

/**
 * Show the modal that asks the user to input the number of player he/she wants for the new game
 */
function showNbPlayersModal() {
  if ('undefined' !== typeof wins.nbPlayer) return
  WindowsManager.createNbPlayersModal()
}

/**
 * Sends an event to the Game Master Window, for it to add a new Player Card to the Players List
 */
function addNewPlayer() {
  wins.gmView.webContents.send(events.addNewPlayer)
  wins.spectator.webContents.send(events.addNewPlayer)
}

/**
 * Either show (if hidden) or hide (if visible) the Spectator View
 */
function toggleSpectatorView() {
  if (wins.spectator.isVisible()) {
    wins.spectator.hide()
    getSpectatorViewMenuItem().checked = false
  } else {
    wins.spectator.show()
    getSpectatorViewMenuItem().checked = true
  }
}

/**
 * Returns the menu item related to showing the Spectator View.
 * The function caches the reference to the Menu Item object, for subsequent calls.
 */
function getSpectatorViewMenuItem() {
  if (!CacheMenuItems.spectatorView) {
    const AppMenu = Menu.getApplicationMenu()
    CacheMenuItems.spectatorView = getMenuItem.byId('spectator-view', AppMenu)
  }
  return CacheMenuItems.spectatorView
}

/**
 * Returns the menu item related to adding a new player in the current game.
 * The function caches the reference to the Menu Item object, for subsequent calls.
 */
function getNewPlayerMenuItem() {
  if (!CacheMenuItems.newPlayer) {
    const AppMenu = Menu.getApplicationMenu()
    CacheMenuItems.newPlayer = getMenuItem.byId('add-new-player', AppMenu)
  }
  return CacheMenuItems.newPlayer
}

/**
 * This is the callback that is passed to the Spectator View on creation.
 * It will be triggered by the 'close' event of the window.
 * It unchecks the menu item for the spectator view and hide the window.
 * @param {*} e The closing event
 */
function closeSpectatorView(e) {
  getSpectatorViewMenuItem().checked = false
  wins.spectator.hide()
  e.preventDefault()
}