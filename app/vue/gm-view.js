const fs = require('fs')
const path = require('path')
const url = require('url')
const _ = require('lodash')
const ipc = require('electron').ipcRenderer
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))
const components = require(path.join(__dirname, '..', 'components', 'components-module.js'))
const settings = require(path.join(__dirname, '..', 'lib', 'settings-constants.js'))
const Player = require(path.join(__dirname, '..', 'lib', 'player-class.js'))
const scoreButton = require(path.join(__dirname, '..', 'components', 'score-button.js'))

// Cache for the jQuery objects representing each Player Cards
let $activePlayers = []


/* ----- INTERNAL EVENTS ----- */

ipc.on(events.nbPlayerSelected, createNewGame)

ipc.on(events.addNewPlayer, createNewPlayer)

/* ----- TEMPLATE EVENTS ----- */

Vue.directive('focus', {
  inserted: el => el.focus()
})

Vue.directive('first-focus', {
  inserted: (el, binding) => binding.value === 1 && el.focus()
})

const noGame = new Vue({
  el: '#no-game',
  data: {
    visible: true
  },
  methods: {
    newGame: () => ipc.send(events.nbPlayerModal)
  }
})

const game = new Vue({
  el: '#game',
  data: {
    visible: false,
    players: []
  },
  computed: {
    maxPlayers: function () {
      return this.players.length >= settings.NB_PLAYERS_MAX
    }
  },
  methods: {
    updatePlayerName: _.debounce(updatePlayerName, 150),
    updateScore: function (player, score) {
      player.score = score
      ipc.send(events.updatePlayerScore, {
        playerNb: player.id,
        score: player.score,
      })
    }
  },
  components: {
    'score-button': scoreButton
  }
})

/* ----- FUNCTION DECLARATIONS ----- */

function updatePlayerName() {
  const value = $(this).val()
  const playerNb = $(this).attr('id')
  ipc.send(events.updatePlayerName, {
    playerNb,
    value
  })
  toggleModifierButtons(value, $(this))
}

/**
 * Hide or show the modifier buttons depending on the value of their related input.
 * If the player name's input has a value, then the buttons are enabled.
 * If it has no value, the buttons are disabled.
 */
function toggleModifierButtons(value, $ele) {
  const $buttons = $("button", $ele.closest('div.player-card'))
  value !== "" ? $buttons.removeClass('disabled') : $buttons.addClass('disabled')
}

/**
 * Resolves the correct action when the mouseup event is fired on a modifier button.
 * The action can either be a simple click or a hold click.
 * In the first case, the score is change one time.
 * In the second case, the autoIncrement function is called.
 */
function resolveModifier(player, modifier) {
  if (holdPending) {
    clearTimeout(holdPending)
    changeScore(player, modifier)
  }
  !!holdActive && clearInterval(holdActive)
}

/**
 * Initiates the call to autoIncrement.
 * It will be triggered after a delay which value is stored in the holdDelay global variable.
 * The holdPending global variable will store the reference to the created timeout.
 */
function initiateAutoIncrement(player, modifier) {
  holdPending = setTimeout(() => autoIncrement(player, modifier), settings.HOLD_DELAY)
}

/**
 * Creates a new game, creating as many new payers as indicated by the nbPlayer argument.
 * When doing so, the #game HTML element is emptied, as is the activePlayers array.
 * @param {*} event The event that triggers the call to this function.
 * @param {*} nbPlayer The number of players to create on this new game.
 */
function createNewGame(event, nbPlayer) {
  noGame.visible = false
  nbPlayer = parseInt(nbPlayer)
  game.players = []
  for (let i = 1; i <= nbPlayer; i++) {
    game.players.push(new Player(i))
  }
  game.visible = true
  console.log(game)
}

/**
 * Adds a new HTML Player Card in the page, and stores a reference to this card in the activePlayers array.
 * The new Player Card will be compiled with the number of the player.
 * @param {*} template The template for a Player Card
 * @param {*} playerNb The number of the Player to add
 */
function addNewPlayerCard(template, playerNb) {
  const $player = $(template)
  $("input", $player).attr('id', playerNb)
  $("label", $player).attr('for', playerNb).text(`Joueur ${playerNb}`)
  $activePlayers[playerNb] = $player
  $playersZone.append($player)
}

/**
 * If possible, creates a new player in the current game.
 * This action will do nothing if there is no current game
 * or that the maximum number of players is reached.
 * When adding the last possible player, the corresponding menu item will be disabled.
 */
function createNewPlayer() {
  const newPlayerNb = $activePlayers.length
  if (newPlayerNb === 1 || newPlayerNb > settings.NB_PLAYERS_MAX) return
  components.getPlayerCard()
    .then((template) => {
      addNewPlayerCard(template, newPlayerNb)
      $("input", $activePlayers[newPlayerNb]).focus()
    })
  if (newPlayerNb === settings.NB_PLAYERS_MAX) {
    ipc.send(events.disableNewPlayerMenuItem)
    $addNewPlayerBtn.addClass('hide')
  }
}

/**s
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
function changeScore(player, modifier) {
  let score = player.score
  score += modifier

  score < 0 && (score = 0)
  score > 999 && (score = 999)

  player.score = score
  ipc.send(events.updatePlayerScore, {
    playerNb: player.id,
    score: player.score,
  })
}

/**
 * Creates an automatic incrementation of a player's score.
 * The score change will be done by the changeScore function.
 * A reference to this automatic incrementation will be stored in the holdActive global variable
 * The interval from which the score will be incremented is based on the autoIncrementDelay global variable
 * @param {*} $ele The button from which the autoIncrement will be based on
 */
function autoIncrement(player, modifier) {
  holdActive = setInterval(() => changeScore(player, modifier), settings.AUTO_INCREMENT_DELAY)
}
