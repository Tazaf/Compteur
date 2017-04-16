const ipc = require('electron').ipcRenderer
const path = require('path')
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))

const $choiceList = $('#choice-list')
const $okBtn = $('#ok')

let nbPlayers
let keyBuffer
let keyBufferValue = ''

$(document).keypress(startKeyBuffer)

$('#cancel').click(() => ipc.send(events.nbPlayerModalClose))

$('#ok').click(() => ipc.send(events.nbPlayerSelected, nbPlayers))

$('li', $choiceList).click(selectChoice)

$("li", $choiceList).hover(addSurrounders, removeSurrounders)

function selectChoice() {
  nbPlayers = $(this).text()
  $('li.active', $choiceList).removeClass('active')
  $(this).addClass('active')
  $okBtn.hasClass('disabled') && $okBtn.removeClass('disabled')
}

function removeSurrounders() {
  $("li.surrounder", $choiceList).removeClass('surrounder')
}

function addSurrounders() {
  $(this).prev().addClass('surrounder')
  $(this).next().addClass('surrounder')
}

function selectNbPlayerWithKeyboard() {
  const value = parseInt(keyBufferValue)
  console.log(value)
  if (!isNaN(value) && value > 0 && value <= 10) {
    $("li.active", $choiceList).removeClass('active')
    $(`#${value}`, $choiceList).click()
  }
  keyBufferValue = ''
}

function startKeyBuffer(event) {
  if ((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105)) {
    keyBufferValue += String.fromCharCode(event.keyCode)
    console.log(keyBufferValue)
    keyBuffer && clearTimeout(keyBuffer)
    keyBuffer = setTimeout(selectNbPlayerWithKeyboard, 250)
  }
}