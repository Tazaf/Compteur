const path = require('path')
const electron = require('electron')
const ipc = electron.ipcRenderer
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))
const playerResult = require(path.join(__dirname, '..', 'player-result', 'player-result.module.js'))

const $resultZone = $("#results")

let $activePlayers = []

/* ----- INTERNAL EVENTS ----- */

ipc.on(events.nbPlayerSelected, reflectNewGame)

ipc.on(events.updatePlayerName, updatePlayerName)

ipc.on(events.updatePlayerScore, updatePlayerScore)

ipc.on(events.addNewPlayer, () => console.log('new player'))

/* ----- FUNCTION DECLARATIONS ----- */

function reflectNewGame(event, nbPlayer) {
  $resultZone.empty()
  $activePlayers = []
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

function updatePlayerScore(event, data) {
  const $playerResult = $activePlayers[data.playerNb]
  const $playerScore = $("progress", $playerResult)
  updateMaxScore(data.maxScore)
  $playerScore.attr('value', data.score)
}

function updateMaxScore(value) {
  $activePlayers.forEach($player => $("progress", $player).attr("max", value))
}