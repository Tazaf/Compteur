const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
const globalShortcut = electron.globalShortcut
const dialog = electron.dialog
const ipc = electron.ipcMain
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let wins = {}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  // Menu.setApplicationMenu(AppMenu())
  registerShortcuts()
  createMainWindow()
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
  if (wins.main === null) {
    createMainWindow()
  }
})

ipc.on('nb-player-modal', showNbPlayersModal)

ipc.on('nb-player-modal-close', () => wins.nbPlayer.close())

ipc.on('nb-player-selected', (event, args) => {
  wins.nbPlayer.close()
  wins.main.webContents.send('nb-player-selected', args)
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function createMainWindow() {
  // Create the browser window.
  wins.main = new BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  wins.main.loadURL(url.format({
    pathname: path.join(__dirname, 'app', 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  wins.main.webContents.openDevTools()

  // Emitted when the window is closed.
  wins.main.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    wins.main = null
  })
}

function registerShortcuts() {
  globalShortcut.register('CmdOrCtrl+N', showNbPlayersModal)
}

function AppMenu() {
  const menuTemplate = [
    {
      label: 'Partie',
      submenu: [
        {
          label: 'Nouvelle',
          accelerator: 'CmdOrCtrl+N',
          click: showNbPlayersModal
        }
      ]
    }, {
      role: 'quit',
      label: 'Fermer'
    }
  ]
  const AppMenu = Menu.buildFromTemplate(menuTemplate)
  return AppMenu
}

function showNbPlayersModal() {
  wins.nbPlayer = new BrowserWindow({
    parent: wins.main,
    modal: true,
    movable: false,
    show: false,
    frame: false,
    width: 500,
    height: 260,
    title: "Nombre de joueurs"
  })
  wins.nbPlayer.on('close', () => wins.nbPlayer = null)
  wins.nbPlayer.loadURL(url.format({
    pathname: path.join(__dirname, 'app', 'new-counter-modal', 'new-counter-modal.template.html'),
    protocol: 'file:',
    slashes: true
  }))
  wins.nbPlayer.once('ready-to-show', () => {
    wins.nbPlayer.show()
    wins.nbPlayer.webContents.openDevTools()

  })
}