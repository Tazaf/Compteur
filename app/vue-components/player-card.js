const path = require('path')
const _ = require('lodash')
const ipc = require('electron').ipcRenderer
const scoreButton = require(path.join(__dirname, '..', 'vue-components', 'score-button.js'))
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))

const component = Vue.component('player-card', {
  props: ['player'],
  methods: {
    updatePlayerName: _.debounce(updatePlayerNameFn, 150),
    updateScore: updateScoreFn
  },
  template: `
    <div class="col m12 l6 player-card" :id="player.id">
      <div class="card-panel blue-grey-text text-darken-3 player">
        <div class="player-name">
          <div class="input-field">
            <input v-model="player.name" v-first-focus="player.id" type="text" maxlength="25">
            <label>Joueur {{ player.id }}</label>
          </div>
        </div>
        <div class="score">
          <h1 class="value">{{ player.score }}</h1>
        </div>
        <div class="modifiers">
          <div class="plus-modifiers">
            <score-button :player="player" :modifier="1" @score="updateScore(player, $event)" class="green accent-1 green-text text-darken-4"></score-button>
            <score-button :player="player" :modifier="2" @score="updateScore(player, $event)" class="green accent-2 green-text text-darken-4"></score-button>
          </div>
          <div class="minus-modifiers">
            <score-button :player="player" :modifier="-1" @score="updateScore(player, $event)" class="red accent-1"></score-button>
            <score-button :player="player" :modifier="-2" @score="updateScore(player, $event)" class="red accent-2"></score-button>
          </div>
        </div>
      </div>
    </div>`
})

module.exports = component

/* ----- FUNCTION DECLARATION ----- */

/**
 * Updates the score of the player and send the data to the Spectator View
 */
function updateScoreFn(player, score) {
  player.score = score
  ipc.send(events.updatePlayerScore, {
    playerNb: player.id,
    score: player.score,
  })
}

// TODO : send an event when the name of the player changes
function updatePlayerNameFn() {
  const value = $(this).val()
  const playerNb = $(this).attr('id')
  ipc.send(events.updatePlayerName, {
    playerNb,
    value
  })
  toggleModifierButtons(value, $(this))
}
