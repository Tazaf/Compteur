const fs = require('fs')
const path = require('path')
const url = require('url')
const _ = require('lodash')
const electron = require('electron')
const ipc = electron.ipcRenderer
const BrowserWindow = electron.BrowserWindow
const Menu = electron.remote.Menu
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))
const playerCard = require(path.join(__dirname, '..', 'player-card', 'player-card.module.js'))
const getMenuItem = require(path.join(__dirname, '..', 'lib', 'get-menu-item.js'))

const holdDelay = 500
const autoIncrementDelay = 100
const maxNbPlayer = 10
const $gameZone = $("#game")
let holdPending
let holdActive
let activePlayers = []

/* ----- INTERNAL EVENTS ----- */

ipc.on(events.nbPlayerSelected, createNewGame)

ipc.on(events.addNewPlayer, createNewPlayer)

/* ----- TEMPLATE EVENTS ----- */

$("a#new-counter").click(() => ipc.send(events.nbPlayerModal))

$gameZone.on({
  'mousedown': initiateAutoIncrement,
  'mouseup': resolveModifier
}, 'button')

$gameZone.on('keydown', 'input', _.debounce(toggleModifierButtons, 250))

/* ----- FUNCTION DECLARATIONS ----- */

/**
 * Hide or show the modifier buttons depending on the value of their related input.
 * If the player name's input has a value, then the buttons are enabled.
 * If it has no value, the buttons are disabled.
 */
function toggleModifierButtons() {
  const value = $(this).val()
  const $buttons = $("button", $(this).closest('div.player-card'))
  value !== "" ? $buttons.removeClass('disabled') : $buttons.addClass('disabled')
}

/**
 * Resolves the correct action when the mouseup event is fired on a modifier button.
 * The action can either be a simple click or a hold click.
 * In the first case, the score is change one time.
 * In the second case, the autoIncrement function is called.
 */
function resolveModifier() {
  if (holdPending) {
    clearTimeout(holdPending)
    const modifier = getModifierFromButton($(this))
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
  $gameZone.empty()
  playerCard.getTemplate()
    .then(template => {
      for (let i = 1; i <= nbPlayer; i++) {
        addNewPlayerCard(template, i)
      }
      $('#no-game').addClass('hide')
      $gameZone.removeClass('hide')
      $("input", activePlayers[0]).focus()
      ipc.send(events.enableNewPlayerMenuItem)
    })
}

/**
 * Adds a new HTML Player Card in the page, and stores a reference to this card in the activePlayers array.
 * The new Player Card will be compiled with the number of the player.
 * @param {*} template The template for a Player Card
 * @param {*} playerNb The number of the Player to add
 */
function addNewPlayerCard(template, playerNb) {
  const $player = $(template)
  $("input", $player).attr('id', `player${playerNb}`)
  $("label", $player).attr('for', `player${playerNb}`).text(`Joueur ${playerNb}`)
  activePlayers.push($player)
  $gameZone.append($player)
}

/**
 * If possible, creates a new player in the current game.
 * This action will do nothing if there is no current game
 * or that the maximum number of players is reached.
 */
function createNewPlayer() {
  const newPlayerNb = activePlayers.length + 1
  if (newPlayerNb === 1 || newPlayerNb > maxNbPlayer) return
  playerCard.getTemplate()
    .then((template) => {
      addNewPlayerCard(template, newPlayerNb)
      $("input", activePlayers[newPlayerNb]).focus()
    })
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
  const $player = $ele.closest('div.player-card')
  const $score = $("h1.value", $player)
  let score = parseInt($score.text())
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
  const modifier = getModifierFromButton($ele)
  holdActive = setInterval(() => changeScore($ele, modifier), autoIncrementDelay)
}