const ipc = require('electron').ipcRenderer
const path = require('path')
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))

// A jQuery object representing the list of possible numner of players
const $choiceList = $('#choice-list')
// A jQuery object representing the OK button
const $okBtn = $('#ok')

// The number of players to create for the new game
let nbPlayers
// A cache that stores a reference to the setTimeout that will trigger the end of keyboard selection
let keyBuffer
// The final value selected with the keyboard
let keyBufferValue = ''

/* ----- TEMPLATE EVENTS ----- */

$(document).keypress(startKeyBuffer)

$('#cancel').click(() => ipc.send(events.nbPlayerModalClose))

$('#ok').click(() => ipc.send(events.nbPlayerSelected, nbPlayers))

$('li', $choiceList).click(selectChoice)

$("li", $choiceList).hover(addSurrounders, removeSurrounders)

/* ----- FUNCTIONS DECLARATIONS ----- */

/**
 * Activate the selected number of player.
 * Doing so, it also enables the OK button
 */
function selectChoice() {
  nbPlayers = $(this).text()
  $('li.active', $choiceList).removeClass('active')
  $(this).addClass('active')
  $okBtn.hasClass('disabled') && $okBtn.removeClass('disabled')
}

/**
 * Removes the zoom effect on the number surrounding the number previously hovered
 */
function removeSurrounders() {
  $("li.surrounder", $choiceList).removeClass('surrounder')
}

/**
 * Adds the zoom effect on the number surrouding the number currently hovered
 */
function addSurrounders() {
  $(this).prev().addClass('surrounder')
  $(this).next().addClass('surrounder')
}

/**
 * Activate the number depending on the keyboard selection.
 * The activation is done only if the typed value is valid
 * i.e. is a number and is in the correct range
 */
function selectNbPlayerWithKeyboard() {
  const value = parseInt(keyBufferValue)
  console.log(value)
  if (!isNaN(value) && value > 0 && value <= 10) {
    $("li.active", $choiceList).removeClass('active')
    $(`#${value}`, $choiceList).click()
  }
  keyBufferValue = ''
}

/**
 * Starts listening to keystrokes and catching them if they match the excpected key.
 * This means that the buffer is only started if the user press numbered keys.
 * @param {*} event The event fired
 */
function startKeyBuffer(event) {
  if ((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105)) {
    keyBufferValue += String.fromCharCode(event.keyCode)
    console.log(keyBufferValue)
    keyBuffer && clearTimeout(keyBuffer)
    keyBuffer = setTimeout(selectNbPlayerWithKeyboard, 250)
  }
}