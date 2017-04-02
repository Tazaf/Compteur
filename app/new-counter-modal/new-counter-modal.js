const electron = require('electron')
const $ = require('../jquery/jquery.min.js')
const BrowserWindows = electron.remote.BrowserWindow

const selfWin = BrowserWindows.getFocusedWindow()

$('#close').click(() => selfWin.close())