const path = require('path')
const url = require('url')
const electron = require('electron')
const ipc = electron.ipcRenderer
const BrowserWindow = electron.remote.BrowserWindow

$("a#new-counter").click(() => ipc.send('nb-player-modal'))

ipc.on('nb-player-selected', (event, nbPlayer) => {
  $('#no-game').addClass('hide')
})

$("button.plus-one").click(function () {
  changeScore($(this), 1)
})

$("button.minus-one").click(function () {
  changeScore($(this), -1)
})

ipc.on('add-new-player', addNewPlayer)

function addNewPlayer() {
  console.log('nouveau joueur')
  $('#game').append($('<p>').text('Nouveau Joueur'))
}

function changeScore($ele, modifier) {
  let $player = $ele.closest('div.player-card')
  console.log($ele, $player)
  let $score = $("div.score", $player)
  $score.text(parseInt($score.text()) + modifier)
}
