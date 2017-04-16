const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')

// Global references to the windows created
const wins = {}

// Exports statement
exports.repository = wins
exports.createGameMasterView = createGameMasterView
exports.createSpectatorView = createSpectatorView
exports.createNbPlayersModal = createNbPlayersModal

/**
 * Create the Game Master View, which is the main view of the app.
 * Closing this window should result in quitting the app, except on Mac OS.
 */
function createGameMasterView() {
  wins.gmView = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#cfd8dc'
  })
  wins.gmView.webContents.openDevTools()
  wins.gmView.on('closed', () => {
    wins.gmView = null
  })
  wins.gmView.loadURL(url.format({
    pathname: path.join(__dirname, '..', 'gm-view', 'gm-view.html'),
    protocol: 'file:',
    slashes: true
  }))
}

/**
 * Creates the Spectator View window as a child of the Game Master View window.
 * This window is designed to always be present in memory, and only hidden or shown when needed
 */
function createSpectatorView(closeCallback) {
  wins.spectator = new BrowserWindow({
    parent: wins.gmView,
    show: false,
    width: 800,
    height: 600,
    skipTaskbar: true,
    backgroundColor: '#cfd8dc',
    title: "Vue spectateur"
  })
  // wins.spectator.setMenu(null)
  wins.spectator.webContents.openDevTools()
  wins.spectator.on('close', closeCallback)
  wins.spectator.loadURL(url.format({
    pathname: path.join(__dirname, '..', 'spectator-view', 'spectator-view.html'),
    protocol: 'file:',
    slashes: true
  }))
}

/**
 * Show the modal that asks the user to input the number of player he/she wants for the new game
 */
function createNbPlayersModal() {
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
  // wins.nbPlayer.webContents.openDevTools()
  wins.nbPlayer.on('close', () => delete wins.nbPlayer)
  wins.nbPlayer.loadURL(url.format({
    pathname: path.join(__dirname, '..', 'new-counter-modal', 'new-counter-modal.html'),
    protocol: 'file:',
    slashes: true
  }))
  wins.nbPlayer.once('ready-to-show', () => {
    wins.nbPlayer.show()
  })
}