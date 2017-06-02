const path = require('path')
const _ = require('lodash')
const ipc = require('electron').ipcRenderer
const scoreButton = require(path.join(__dirname, '..', 'vue-components', 'score-button.js'))
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))
const Logger = require(path.join(__dirname, '..', 'lib', 'logger.js'))

const component = Vue.component('player-card', {
  props: ['player'],
  methods: {
    sendPlayerName: _.debounce(sendPlayerNameFn, 150),
    sendPlayerScore: sendPlayerScoreFn
  },
  template: `
    <div class="col m12 l6" :id="player.id">
      <div class="card-panel blue-grey-text text-darken-3 player">
        <div class="player-name">
          <div class="input-field">
            <input v-model="player.name" v-player-focus="player.focus" @keydown="sendPlayerName($event)" type="text" maxlength="25">
            <label>Joueur {{ player.id }}</label>
          </div>
        </div>
        <div class="score">
          <h1 class="value">{{ player.score }}</h1>
        </div>
        <div class="modifiers">
          <div class="plus-modifiers">
            <score-button :player="player" :modifier="1" @score="sendPlayerScore(player, $event)" class="green accent-1 green-text text-darken-4"></score-button>
            <score-button :player="player" :modifier="2" @score="sendPlayerScore(player, $event)" class="green accent-2 green-text text-darken-4"></score-button>
          </div>
          <div class="minus-modifiers">
            <score-button :player="player" :modifier="-1" @score="sendPlayerScore(player, $event)" class="red accent-1"></score-button>
            <score-button :player="player" :modifier="-2" @score="sendPlayerScore(player, $event)" class="red accent-2"></score-button>
          </div>
        </div>
      </div>
    </div>`
})

module.exports = component

/* ----- FUNCTION DECLARATION ----- */

/**
 * Updates the player's score with the received score value,
 * and send the new score to the Spectator View
 * @param {Player} player
 * @param {Number} score 
 */
function sendPlayerScoreFn(player, score) {
  player.score = score
  ipc.send(events.updatePlayerScore, {
    id: player.id,
    score: player.score,
  })
}

/**
 * Sends the new player's name to the Spectator View
 * @param {*} event 
 */
function sendPlayerNameFn(event) {
  if (!event.ctrlKey) {
    ipc.send(events.updatePlayerName, {
      id: this.player.id,
      name: this.player.name
    })
  }
}
