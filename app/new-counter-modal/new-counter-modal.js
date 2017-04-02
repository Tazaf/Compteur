const electron = require('electron')
const ipc = electron.ipcRenderer
const BrowserWindows = electron.remote.BrowserWindow

const selfWin = BrowserWindows.getFocusedWindow()

$('#cancel').click(() => selfWin.close())