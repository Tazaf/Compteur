const electron = require('electron')
const path = require('path')
const ipc = electron.ipcRenderer
const BrowserWindows = electron.remote.BrowserWindow
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))
console.log(events)

const selfWin = BrowserWindows.getFocusedWindow()
const choiceList = $('#choice-list')
const okBtn = $('#ok')

var nbPlayers;

$('#cancel').click(() => ipc.send(events.nbPlayerModalClose))

$('#ok').click(() => ipc.send(events.nbPlayerSelected, nbPlayers))

$('li', choiceList).click(selectChoice)

$("li", choiceList).hover(addSurrounders, removeSurrounders)

function selectChoice() {
  nbPlayers = $(this).text()
  console.log(nbPlayers)
  $('li.active', choiceList).removeClass('active')
  $(this).addClass('active')
  okBtn.hasClass('disabled') && okBtn.removeClass('disabled')
}

function removeSurrounders() {
  $("li.surrounder", choiceList).removeClass('surrounder')
}

function addSurrounders() {
  $(this).prev().addClass('surrounder')
  $(this).next().addClass('surrounder')
}