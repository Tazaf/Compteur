const path = require('path')
const electron = require('electron')
const _ = require('lodash')
const ipc = electron.ipcRenderer
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))
const Components = require(path.join(__dirname, '..', 'components', 'components-module.js'))
const Settings = require(path.join(__dirname, '..', 'lib', 'settings-constants.js'))

const $resultZone = $("#results")
const $noGame = $("#no-game")
const $main = $("main")

let viewType = Settings.HORIZONTAL_VIEW_TYPE
let $activePlayers = []
let playerScores = []

/* ----- INTERNAL EVENTS ----- */

$noGame.on('click', '#new-counter', () => ipc.send(events.nbPlayerModal))

ipc.on(events.nbPlayerSelected, reflectNewGame)

ipc.on(events.updatePlayerName, updatePlayerName)

ipc.on(events.updatePlayerScore, updatePlayerScore)

ipc.on(events.addNewPlayer, addNewPlayer)

ipc.on(events.changeDisplayType, (event, args) => setViewType(args.displayType))

Components.getNoGameMessage().then(template => $noGame.append(template))

$main.addClass(viewType)

/* ----- FUNCTION DECLARATIONS ----- */

function reflectNewGame(event, nbPlayer) {
  $resultZone.empty()
  $activePlayers = []
  playerScores = []
  Components.getPlayerResult()
    .then(template => {
      for (let i = 1; i <= nbPlayer; i++) {
        addNewPlayerResultComponent(template, i)
      }
      $noGame.addClass('hide')
      $resultZone.removeClass('hide')
    })
}

function addNewPlayer() {
  const nbPlayer = $activePlayers.length
  if (nbPlayer <= Settings.NB_PLAYERS_MAX) {
    Components.getPlayerResult()
      .then(template => {
        addNewPlayerResultComponent(template, nbPlayer)
      })
  }
}

function addNewPlayerResultComponent(template, nbPlayer) {
  const $result = $(template)
  $result.attr('id', nbPlayer)
  $("span.player-name", $result).text(`Joueur ${nbPlayer}`)
  $activePlayers[nbPlayer] = $result
  $resultZone.append($result)
}

function updatePlayerName(event, data) {
  const $playerResult = $activePlayers[data.playerNb]
  const $playerName = $("span.player-name", $playerResult)
  $playerName.text(data.value || `Joueur ${data.playerNb}`)
}

function updateAllScores() {
  const max = getMaxScore()
  $activePlayers.forEach($player => {
    const playerNb = $player.attr('id')
    $("span.score-display", $player).text(playerScores[playerNb])
    const ratio = playerScores[playerNb] * 100 / max
    !isNaN(ratio && animateScore($player, ratio))
  })
}

function animateScore($player, ratio) {
  if (viewType === Settings.HORIZONTAL_VIEW_TYPE) {
    $("div.inner-score", $player).animate({ width: `${ratio}%` }, Settings.SCORE_ANIMATION_SPEED)
    $("div.score-wrapper", $player).animate({ left: `${ratio}%` }, Settings.SCORE_ANIMATION_SPEED)
  } else if (viewType === Settings.VERTICAL_VIEW_TYPE) {
    $("div.inner-score", $player).animate({ height: `${ratio}%` }, Settings.SCORE_ANIMATION_SPEED)
    $("div.score-wrapper", $player).animate({ bottom: `${ratio}%` }, Settings.SCORE_ANIMATION_SPEED)
  }
}

function updatePlayerScore(event, data) {
  playerScores[data.playerNb] = data.score
  updateAllScores()
}

/**
 * Returns the greater current score among all active players
 */
function getMaxScore() {
  return _.max(playerScores)
}

function setViewType(displayType) {
  if (viewType === displayType) return
  viewType = displayType
  $main.attr('class', viewType)
}