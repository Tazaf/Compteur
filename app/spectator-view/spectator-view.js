const path = require('path')
const electron = require('electron')
const _ = require('lodash')
const ipc = electron.ipcRenderer
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))
const Components = require(path.join(__dirname, '..', 'components', 'components-module.js'))
const Settings = require(path.join(__dirname, '..', 'lib', 'settings-constants.js'))

const $resultZone = $("#results")
const $noGame = $("#no-game")

let $activePlayers = []
let playerScores = []

/* ----- INTERNAL EVENTS ----- */

$noGame.on('click', '#new-counter', () => ipc.send(events.nbPlayerModal))

ipc.on(events.nbPlayerSelected, reflectNewGame)

ipc.on(events.updatePlayerName, updatePlayerName)

ipc.on(events.updatePlayerScore, updatePlayerScore)

ipc.on(events.addNewPlayer, addNewPlayer)

Components.getNoGameMessage().then(template => $noGame.append(template))

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
    const $bar = $("div.inner-score", $player)
    const $score = $("span.score-display", $player)
    $score.text(playerScores[playerNb])
    const ratio = playerScores[playerNb] * 100 / max
    console.log(playerNb, $bar, $score, playerScores[playerNb], ratio)
    if (!isNaN(ratio)) {
      $bar.animate({ width: `${ratio}%` }, 150)
      $score.animate({ 'margin-left': `${ratio}%` }, 150)
    }
  })
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