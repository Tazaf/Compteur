const path = require('path')
const url = require('url')
const electron = require('electron')
const ipc = electron.ipcRenderer
const BrowserWindow = electron.BrowserWindow
const events = require(path.join(__dirname, 'lib', 'event-service.js'))

const holdDelay = 500
const autoIncrementDelay = 100

const $gameZone = $("#game")
let holdPending
let holdActive

$("a#new-counter").click(() => ipc.send(events.nbPlayerModal))

$gameZone.on('mousedown', 'button', initiateAutoIncrement)

$gameZone.on('mouseup', 'button', resolveModifier)

ipc.on(events.nbPlayerSelected, createNewGame)

ipc.on(events.addNewPlayer, addNewPlayer)

/**
 * Resolves the correct action when the mouseup event is fired on a modifier button.
 * The action can either be a simple click or a hold click.
 * In the first case, the score is change one time.
 * In the second case, the autoIncrement function is called.
 */
function resolveModifier() {
  if (holdPending) {
    clearTimeout(holdPending)
    let modifier = getModifierFromButton($(this))
    changeScore($(this), modifier)
  }
  !!holdActive && clearInterval(holdActive)
}

/**
 * Initiates the call to autoIncrement.
 * It will be triggered after a delay which value is stored in the holdDelay global variable.
 * The holdPending global variable will store the reference to the created timeout.
 */
function initiateAutoIncrement() {
  holdPending = setTimeout(() => autoIncrement($(this)), holdDelay)
}

/**
 * Creates a new game, creating as many new payers as indicated by the nbPlayer argument.
 * @param {*} event The event that triggers the call to this function.
 * @param {*} nbPlayer The number of players to create on this new game.
 */
function createNewGame(event, nbPlayer) {
  // TODO : Create all player templates
  $('#no-game').addClass('hide')
}

/**
 * Adds a new player in the current game.
 */
function addNewPlayer() {
  // TODO : Create a new player template
  $('#game').append($('<p>').text('Nouveau Joueur'))
}

/**
 * Retrieves the correct modifiers to apply to a player's score, based on the given $ele.
 * $ele should be a button with either the .plus or .minus class and either the .one or .two classes.
 * The modifier will be generated based on the combination of these classes
 * @param {*} $ele The button element from which the modifier must be retrieved
 */
function getModifierFromButton($ele) {
  let modifier
  if ($ele.hasClass('plus')) {
    modifier = $ele.hasClass('one') ? 1 : 2
  } else {
    modifier = $ele.hasClass('one') ? -1 : -2
  }
  return modifier
}

/**
 * Changes the score on a player's card, applying it the given modifier.
 * The score to change will be retrieve from the given button, that should be a button inside a player's card.
 * The score can not be negative.
 * @param {*} $ele The button that is responsible for the score change 
 * @param {*} modifier The modifier to apply to the new score
 */
function changeScore($ele, modifier) {
  console.log(modifier)
  let $player = $ele.closest('div.player-card')
  let $score = $("h1.value", $player)
  let score = parseInt($score.text())
  console.log(score)
  score += modifier
  score < 0 && (score = 0)
  score > 999 && (score = 999)
  $score.text(score)
}

/**
 * Creates an automatic incrementation of a player's score.
 * The score change will be done by the changeScore function.
 * A reference to this automatic incrementation will be stored in the holdActive global variable
 * The interval from which the score will be incremented is based on the autoIncrementDelay global variable
 * @param {*} $ele The button from which the autoIncrement will be based on
 */
function autoIncrement($ele) {
  let modifier = getModifierFromButton($ele)
  holdActive = setInterval(() => changeScore($ele, modifier), autoIncrementDelay)
}
