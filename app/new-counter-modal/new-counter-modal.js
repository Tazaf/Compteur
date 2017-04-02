const electron = require('electron')
const ipc = electron.ipcRenderer
const BrowserWindows = electron.remote.BrowserWindow

const selfWin = BrowserWindows.getFocusedWindow()
const choiceList = $('#choice-list')
const okBtn = $('#ok')

$('#cancel').click(() => selfWin.close())

$('li', choiceList).click(function() {
  $('li.active', choiceList).removeClass('active')
  $(this).addClass('active')
  okBtn.hasClass('disabled') && okBtn.removeClass('disabled')
})