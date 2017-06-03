/* ----- SYSTEM IMPORTS ----- */

const path = require('path')
const electron = require('electron')
const _ = require('lodash')
const ipc = electron.ipcRenderer

/* ----- CUSTOM IMPORTS ----- */

const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))
const Components = require(path.join(__dirname, '..', 'components', 'components-module.js'))
const Settings = require(path.join(__dirname, '..', 'lib', 'settings-constants.js'))
const Logger = require(path.join(__dirname, '..', 'lib', 'logger.js'))
const Player = require(path.join(__dirname, '..', 'lib', 'player-class.js'))

/* ----- VUE COMPONENTS ----- */

const noGame = require(path.join(__dirname, '..', 'vue-components', 'no-game.js'))
const playerResult = require(path.join(__dirname, '..', 'vue-components', 'player-result.js'))

const spectator = new Vue({
  el: '#spectator',
  data: {
    state: Settings.NO_GAME_STATE,
    players: [],
    viewType: Settings.HORIZONTAL_VIEW_TYPE,
  },
  computed: {
    highScore
  },
  methods: {
    reflectNewGame: reflectNewGameFn,
    addNewPlayer: addNewPlayerFn,
    updatePlayerName: updatePlayerNameFn,
    updatePlayerScore: updatePlayerScoreFn,
    setDisplayType: setDisplayTypeFn,
    updateAllPlayerResults: updateAllPlayerResultsFn
  }
})

/* ----- INTERNAL EVENTS ----- */

ipc.on(events.nbPlayerSelected, spectator.reflectNewGame)

ipc.on(events.addNewPlayer, spectator.addNewPlayer)

ipc.on(events.updatePlayerName, spectator.updatePlayerName)

ipc.on(events.changeDisplayType, spectator.setDisplayType)

ipc.on(events.updatePlayerScore, spectator.updatePlayerScore)

/* ----- FUNCTIONS DECLARATIONS ----- */

/**
 * Create as many new Players in the players data than the given number of players.
 * Then changes the state of the spectator view from 'no-game' to 'game'.
 * @param {*} event 
 * @param {*} nbPlayer 
 */
function reflectNewGameFn(event, nbPlayer) {
  this.players = []
  for (let i = 1; i <= nbPlayer; i++) {
    this.players.push(new Player({ id: i }))
  }
  this.state = Settings.GAME_STATE
}

/**
 * Adds a new player in the game, whose id is actual number of players, plus one.
 */
function addNewPlayerFn() {
  const newPlayerId = this.players.length + 1
  if (newPlayerId <= Settings.NB_PLAYERS_MAX) {
    this.players.push(new Player({ id: newPlayerId }))
  }
}

/**
 * Updates the name of a specific player, based on the values received in updatedPlayer argument.
 * This argument should be an object with at least id and name properties.
 * A player with the equivalent id will be searched through the players array and, if found, its name will be updated.
 * @param {*} event 
 * @param {*} updatedPlayer
 */
function updatePlayerNameFn(event, updatedPlayer) {
  const player = _.find(this.players, {id: updatedPlayer.id})
  player && (player.name = updatedPlayer.name)
}

/**
 * Updates the score of a specfici player, based on the values received in updatePlayer argument.
 * This argument should be an object with at least id and score properties.
 * A player with the equivalent id will be searched through the player array and, if found, its score will be updated.
 * @param {*} event 
 * @param {*} updatedPlayer 
 */
function updatePlayerScoreFn(event, updatedPlayer) {
  const player = _.find(this.players, {id: updatedPlayer.id})
  player && (player.score = updatedPlayer.score)
  this.updateAllPlayerResults()
}

/**
 * Changes the view type of the spectator view for the value of args.displayType
 * @param {*} event 
 * @param {*} args 
 */
function setDisplayTypeFn(event, args) {
  if (this.viewType !== args.displayType) {
    this.viewType = args.displayType
  }
}

/**
 * Returns the highest score among all the players' scores.
 */
function highScore() {
  return _.max(_.map(this.players, (player) => player.score))
}

/**
 * Updates all the progress bar percentage for all the players.
 * This is achieve by calculating the value proportionnaly to the player's score and the high score.
 */
function updateAllPlayerResultsFn() {
  this.players.forEach(player => player.percent = `${player.score * 100 / this.highScore}%`)
}
