const path = require('path')
const url = require('url')
const electron = require('electron')
const ipc = electron.ipcRenderer
const BrowserWindow = electron.remote.BrowserWindow

$("a#new-counter").click(() => ipc.send('nb-player-modal'))

ipc.on('nb-player-selected', (event, nbPlayer) => {
  $('#no-game').addClass('hide')
})
