const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
const globalShortcut = electron.globalShortcut
const dialog = electron.dialog
const ipc = electron.ipcMain
const path = require('path')
const url = require('url')
const events = require(path.join(__dirname, 'lib', 'event-service.js'))
const getMenuItem = require(path.join(__dirname, 'lib', 'get-menu-item.js'))

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let wins = {}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  Menu.setApplicationMenu(AppMenu())
  registerShortcuts()
  createGameMasterView()
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
    createGameMasterView()
  }
})

ipc.on(events.nbPlayerModal, showNbPlayersModal)

ipc.on(events.nbPlayerModalClose, () => wins.nbPlayer.close())

ipc.on(events.nbPlayerSelected, (event, args) => {
  wins.nbPlayer.close()
  wins.gmView.webContents.send(events.nbPlayerSelected, args)
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function createGameMasterView() {
  // Create the browser window.
  wins.gmView = new BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  wins.gmView.loadURL(url.format({
    pathname: path.join(__dirname, 'gm-view', 'gm-view.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  wins.gmView.webContents.openDevTools()

  // Emitted when the window is closed.
  wins.gmView.on('closed', () => {
    wins.gmView = null
  })

  // Create the view for the spectators. This view is hidden by default.
  // All events in the GameMaster View will be mirrored in the Spectator View
  createSpectatorView()
}

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
          accelerator: 'CmdOrCtrl+N',
          click: showNbPlayersModal
        }, { type: 'separator' }, {
          label: 'Ajouter un joueur',
          id: 'add-new-player',
          accelerator: 'CmdOrCtrl+J',
          enabled: false,
          click: addNewPlayer
        }
      ]
    }, {
      label: "Vue",
      submenu: [
        {
          label: 'Vue spectateur',
          id: 'spectator-view',
          type: 'checkbox',
          accelerator: 'Alt+S',
          click: toggleSpectatorView
        }
      ]
    }, {
      role: 'quit',
      label: 'Fermer'
    }, {
      label: 'Debug',
      submenu: [
        { role: 'toggledevtools' },
        { role: 'forcereload' }
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
  wins.nbPlayer = new BrowserWindow({
    parent: wins.gmView,
    modal: true,
    movable: false,
    show: false,
    frame: false,
    width: 500,
    height: 260,
    title: "Nombre de joueurs"
  })
  wins.nbPlayer.on('close', () => delete wins.nbPlayer)
  wins.nbPlayer.loadURL(url.format({
    pathname: path.join(__dirname, 'new-counter-modal', 'new-counter-modal.html'),
    protocol: 'file:',
    slashes: true
  }))
  wins.nbPlayer.once('ready-to-show', () => {
    wins.nbPlayer.show()
  })
}

/**
 * Sends an event to the Main Windows, for it to add a new Player Card to the Players List
 */
function addNewPlayer() {
  wins.gmView.webContents.send(events.addNewPlayer)
}

/**
 * Either show or hide
 */
function toggleSpectatorView() {
  wins.spectator.isVisible() ? wins.spectator.hide() : wins.spectator.show()
}

function createSpectatorView() {
  wins.spectator = new BrowserWindow({
    parent: wins.gmView,
    show: false,
    width: 500,
    height: 260,
    title: "Vue spectateur"
  })
  wins.spectator.setMenu(null)
  wins.spectator.on('close', e => {
    uncheckSpectatorViewMenuItem()
    wins.spectator.hide()
    e.preventDefault()
  })
  wins.spectator.loadURL(url.format({
    pathname: path.join(__dirname, 'spectator-view', 'spectator-view.template.html'),
    protocol: 'file:',
    slashes: true
  }))
}

function checkSpectatorViewMenuItem() {
  const AppMenu = Menu.getApplicationMenu()
  const MenuItem = getMenuItem('spectator-view', AppMenu)
  MenuItem.checked = true;
}

function uncheckSpectatorViewMenuItem() {
  const AppMenu = Menu.getApplicationMenu()
  const MenuItem = getMenuItem('spectator-view2', AppMenu)
  MenuItem.checked = false;
}