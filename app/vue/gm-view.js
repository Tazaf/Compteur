/* ----- SYSTEM IMPORTS ----- */

const fs = require('fs')
const path = require('path')
const url = require('url')
const _ = require('lodash')
const ipc = require('electron').ipcRenderer

/* ----- CUSOMT IMPORTS ----- */

const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))
const settings = require(path.join(__dirname, '..', 'lib', 'settings-constants.js'))
const Player = require(path.join(__dirname, '..', 'lib', 'player-class.js'))
const Logger = require(path.join(__dirname, '..', 'lib', 'logger.js'))

/* ----- VUE COMPONENTS ----- */

const noGame = require(path.join(__dirname, '..', 'vue-components', 'no-game.js'))
const newPlayerBtn = require(path.join(__dirname, '..', 'vue-components', 'new-player-button.js'))
const playerCard = require(path.join(__dirname, '..', 'vue-components', 'player-card.js'))

Vue.directive('focus', {
  inserted: el => el.focus()
})

Vue.directive('first-focus', {
  inserted: (el, binding) => binding.value === 1 && el.focus()
})

/* ----- VUE INITIALIZATION ----- */

const app = new Vue({
  el: '#app',
  data: {
    state: 'no-game',
    players: []
  },
  computed: {
    hasMaxPlayers: () => this.players.length >= settings.NB_PLAYERS_MAX
  },
  methods: {
    createNewGame: createNewGameFn,
    createNewPlayer: createNewPlayerFn
  }
})

/* ----- INTERNAL EVENTS ----- */

ipc.on(events.nbPlayerSelected, app.createNewGame)

ipc.on(events.addNewPlayer, app.createNewPlayer)


/* ----- FUNCTION DECLARATIONS ----- */

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
 * Creates a new game, creating as many new payers as indicated by the nbPlayer argument.
 * When doing so, the #game HTML element is emptied, as is the activePlayers array.
 * @param {*} event The event that triggers the call to this function.
 * @param {*} nbPlayer The number of players to create on this new game.
 */
function createNewGameFn(event, nbPlayer) {
  this.state = 'game'
  this.players = []
  nbPlayer = parseInt(nbPlayer)
  for (let i = 1; i <= nbPlayer; i++) {
    this.players.push(new Player(i))
  }
  Logger.log(events)
  ipc.send(events.enableNewPlayerMenuItem)
  console.log(app)
}

/**
 * If possible, creates a new player in the current game.
 * This action will do nothing if there is no current game
 * or if the maximum number of players is reached.
 * When adding the last possible player, the corresponding menu item will be disabled.
 */
function createNewPlayerFn() {
  const newPlayerNb = this.players.length + 1
  if (newPlayerNb === 1 || newPlayerNb > settings.NB_PLAYERS_MAX) return
  this.players.push(new Player(newPlayerNb))
  if (newPlayerNb >= settings.NB_PLAYERS_MAX) ipc.send(events.disableNewPlayerMenuItem)
}
