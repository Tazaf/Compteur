const path = require('path')
const electron = require('electron')
const _ = require('lodash')
const ipc = electron.ipcRenderer
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))
const playerResult = require(path.join(__dirname, '..', 'player-result', 'player-result.module.js'))

const $resultZone = $("#results")

let $activePlayers = []
let playerScores = []

/* ----- INTERNAL EVENTS ----- */

ipc.on(events.nbPlayerSelected, reflectNewGame)

ipc.on(events.updatePlayerName, updatePlayerName)

ipc.on(events.updatePlayerScore, updatePlayerScore)

ipc.on(events.addNewPlayer, () => console.log('new player'))

/* ----- FUNCTION DECLARATIONS ----- */

function reflectNewGame(event, nbPlayer) {
  $resultZone.empty()
  $activePlayers = []
  playerScores = []
  playerResult.getTemplate()
    .then(template => {
      for (let i = 1; i <= nbPlayer; i++) {
        addNewPlayerResultComponent(template, i)
      }
      $('#no-results').addClass('hide')
      $resultZone.removeClass('hide')
    })
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

function updateScores() {
  const max = getMaxScore()
  $activePlayers.forEach($player => {
    const playerNb = $player.attr('id')
    const $bar = $("div.inner-score", $player)
    const $score = $("span.score-display", $player)
    $score.text(playerScores[playerNb])
    const ratio = playerScores[playerNb] * 100 /max
    console.log(playerNb, $bar, $score, playerScores[playerNb], ratio)
    if (!isNaN(ratio)) {
      $bar.animate({width: `${ratio}%`}, 150)
      $score.animate({'margin-left': `${ratio}%`}, 150)
    }
  })
}

function updatePlayerScore(event, data) {
  playerScores[data.playerNb] = data.score
  console.log(playerScores)
  updateScores()
}

// function updateMaxScore() {
//   const max = getMaxScore()
//   $activePlayers.forEach($player => $("progress", $player).attr("max", max))
// }

/**
 * Returns the greater current score among all active players
 */
function getMaxScore() {
  return _.max(playerScores)
}