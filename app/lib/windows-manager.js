const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')
const AppMenuItems = require(path.join(__dirname, 'get-menu-item.js'))

// Global references to the windows created
const wins = {}

// Exports statement
exports.repository = wins
exports.createGameMasterView = createGameMasterView
exports.createSpectatorView = createSpectatorView
exports.showNbPlayersModal = showNbPlayersModal
exports.toggleSpectatorViewFullScreen = toggleSpectatorViewFullScreen
exports.toggleSpectatorView = toggleSpectatorView

/* ----- EXPORTED FUNCTION ----- */

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
  // wins.gmView.webContents.openDevTools()
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
function createSpectatorView() {
  wins.spectator = new BrowserWindow({
    parent: wins.gmView,
    show: false,
    width: 800,
    height: 600,
    skipTaskbar: false,
    backgroundColor: '#546e7a',
    title: "Vue spectateur"
  })
  wins.spectator.setMenu(null)
  // wins.spectator.webContents.openDevTools()
  wins.spectator.on('close', (e) => {
    toggleSpectatorView()
    e.preventDefault()
  })
  wins.spectator.loadURL(url.format({
    pathname: path.join(__dirname, '..', 'spectator-view', 'spectator-view.html'),
    protocol: 'file:',
    slashes: true
  }))
}

/**
 * Show the modal that asks the user to input the number of player he/she wants for the new game
 */
function showNbPlayersModal() {
  if ('undefined' !== typeof wins.nbPlayer) return
  createNbPlayersModal()
}

/**
 * Either activate or deactivate full screen display for the Spectator View.
 * Change the menu items accordingly.
 */
function toggleSpectatorViewFullScreen() {
  if (wins.spectator.isVisible()) {
    wins.spectator.isFullScreen() ? spectatorViewFullScreen(false) : spectatorViewFullScreen(true)
  }
}

/**
 * Either show (if hidden) or hide (if visible) the Spectator View.
 * Hidding a full screened spectator view will deactivate the full screen.
 */
function toggleSpectatorView() {
  if (wins.spectator.isVisible()) {
    wins.spectator.isFullScreen() && spectatorViewFullScreen(false)
    wins.spectator.hide()
    AppMenuItems.switchSpectatorView(false)
    AppMenuItems.enableSpectatorViewItems(false)
  } else {
    wins.spectator.show()
    AppMenuItems.switchSpectatorView(true)
    AppMenuItems.enableSpectatorViewItems(true)
  }
}

/* ----- PRIVATE FUNCTION ----- */

/**
 * Activates or deactivates the full screen (and the corresponding menu items)
 * for the Spectator View, based on the value of state.
 * True for activation, False for deactivation
 * @param {Boolean} state
 */
function spectatorViewFullScreen(state) {
  wins.spectator.setFullScreen(state)
  AppMenuItems.switchFullScreen(state)
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