const electron = require('electron')
const ipc = electron.ipcRenderer

ipc.on('new-counter', () => console.log('Nouveau compteur'))