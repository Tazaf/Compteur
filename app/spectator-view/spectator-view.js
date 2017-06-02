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
    state: 'no-game',
    players: [],
    viewType: 'horizontal'
  },
  methods: {
    reflectNewGame: reflectNewGameFn,
    addNewPlayer: addNewPlayerFn,
    updatePlayerName: updatePlayerNameFn,
    updatePlayerScore: updatePlayerScoreFn,
    setViewType: setViewTypeFn
  }
})

/* ----- INTERNAL EVENTS ----- */

ipc.on(events.nbPlayerSelected, spectator.reflectNewGame)

ipc.on(events.addNewPlayer, spectator.addNewPlayer)

ipc.on(events.updatePlayerName, spectator.updatePlayerName)

ipc.on(events.changeDisplayType, spectator.setViewType)

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
  this.state = 'game'
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
 * A player with the equivalent id will be searched in the players array and, if found, its name will be updated.
 * @param {*} event 
 * @param {*} updatedPlayer
 */
function updatePlayerNameFn(event, updatedPlayer) {
  const player = _.find(this.players, {id: updatedPlayer.id})
  player && (player.name = updatedPlayer.name)
}

function setViewTypeFn(event, args) {
  if (this.viewType !== args.displayType) {
    this.viewType = args.displayType
  }
}

/* ----- LEGACY ----- */

const $resultZone = $("#results")
const $main = $("main")

let viewType = Settings.HORIZONTAL_VIEW_TYPE
let $activePlayers = []
let playerScores = []
let maxScore

let animateScore = {}
animateScore[Settings.VERTICAL_VIEW_TYPE] = animateVerticalScore
animateScore[Settings.HORIZONTAL_VIEW_TYPE] = animateHorizontalScore

/* ----- INTERNAL EVENTS ----- */


ipc.on(events.updatePlayerScore, updatePlayerScoreFn)


$main.addClass(viewType)

/* ----- FUNCTION DECLARATIONS ----- */

function addNewPlayerResultComponent(template, nbPlayer) {
  const $result = $(template)
  $result.attr('id', nbPlayer)
  $("span.player-name", $result).text(`Joueur ${nbPlayer}`)
  $activePlayers[nbPlayer] = $result
  $resultZone.append($result)
}

function updateAllPlayerResults() {
  $activePlayers.forEach(updatePlayerResult)
}

function updatePlayerResult($player) {
  const playerNb = $player.attr('id')
  $("span.score-display", $player).text(playerScores[playerNb])
  const ratio = playerScores[playerNb] === 0 ? 0 : playerScores[playerNb] * 100 / maxScore
  !isNaN(ratio) && animateScore[viewType]($player, ratio)
}

function animateVerticalScore($player, ratio) {
  $("div.inner-score", $player).animate({ height: `${ratio}%` }, Settings.SCORE_ANIMATION_SPEED)
  $("div.score-wrapper", $player).animate({ bottom: `${ratio}%` }, Settings.SCORE_ANIMATION_SPEED)
}

function animateHorizontalScore($player, ratio) {
  $("div.inner-score", $player).animate({ width: `${ratio}%` }, Settings.SCORE_ANIMATION_SPEED)
  $("div.score-wrapper", $player).animate({ left: `${ratio}%` }, Settings.SCORE_ANIMATION_SPEED)
}

function updatePlayerScoreFn(event, data) {
  playerScores[data.playerNb] = data.score
  updateMaxScore()
  updateAllPlayerResults()
}

function switchDisplay() {
  $activePlayers.forEach($player => {
    $("div.inner-score", $player).removeAttr('style')
    $("div.score-wrapper", $player).removeAttr('style')
    updatePlayerResult($player)
  })
}

/**
 * Returns the greater current score among all active players
 */
function updateMaxScore() {
  maxScore = _.max(playerScores)
}

function setViewType(displayType) {
  if (viewType === displayType) return
  viewType = displayType
  $main.attr('class', viewType)
  switchDisplay()
}