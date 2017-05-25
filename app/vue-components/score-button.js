const path = require('path')
const settings = require(path.join(__dirname, '..', 'lib', 'settings-constants.js'))
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))
const Logger = require(path.join(__dirname, '..', 'lib', 'logger.js'))

// Global variable to store the reference to the setTimeout that will trigger the click-hold event
let holdPending
// Global variable to store the reference to the setInterval responsible for the autoincrementation of the score
let holdActive

const component = Vue.component('score-button', {
  props: ['player', 'modifier'],
  computed: {
    label: labelFn
  },
  created: function() {
    this.private = {
      holdPending: null,
      holdActive: null
    }
  },
  methods: {
    initiateAutoIncrement: initiateAutoIncrementFn,
    resolveModifier: resolveModifierFn,
    autoIncrement: autoIncrementFn,
    changeScore: changeScoreFn
  },
  template: '<button :disabled="!player.name" @mousedown="initiateAutoIncrement(player, modifier)" @mouseup="resolveModifier(player, modifier)" class="btn waves-effect" tabindex="-1">{{ label }}</button>'
})

module.exports = component

/* ----- FUNCTION DECLARATION ----- */

/**
 * Compute the correct label to be displayed on the current button instance, according to the value of its modifier
 */
function labelFn() {
  return this.modifier > 0 ? `+${this.modifier}` : this.modifier
}

/**
 * Initiates the call to autoIncrement.
 * It will be triggered after a delay whose value is stored in the HOLD_DELAY setting constant.
 * The holdPending global variable will store the reference to the created timeout.
 */
function initiateAutoIncrementFn(player, modifier) {
  this.private.holdPending = setTimeout(() => this.autoIncrement(player, modifier), settings.HOLD_DELAY)
}

/**
 * Resolves the correct action when the mouseup event is fired on a modifier button.
 * The action can either be a simple click or a hold click.
 * In the first case, the score is change one time.
 * In the second case, the autoIncrement function is called.
 */
function resolveModifierFn(player, modifier) {
  if (this.private.holdActive) {
    clearInterval(this.private.holdActive)
    this.private.holdActive = undefined
  } else if (this.private.holdPending) {
    clearTimeout(this.private.holdPending)
    this.private.holdPending = undefined
    this.changeScore(player, modifier)
  }
}

/**
 * Creates an automatic incrementation of a player's score.
 * The score change will be done by the changeScore function.
 * A reference to this automatic incrementation will be stored in the private.holdActive variable of the button instance.
 * The interval from which the score will be incremented is based on the AUTO_INCREMENT_DELAY setting variable.
 * @param {Player} player An object representing the player whose score should be modified
 * @param {Number} modifier A number representing the modifier to apply to the score
 */
function autoIncrementFn(player, modifier) {
  this.private.holdActive = setInterval(() => this.changeScore(player, modifier), settings.AUTO_INCREMENT_DELAY)
}

/**
 * Changes the score of a player, applying it the given modifier.
 * The score can not be negative.
 * @param {Player} player An object representing the player whose score should be modified
 * @param {*} modifier The modifier to apply to the new score
 */
function changeScoreFn(player, modifier) {
  let score = player.score
  score += modifier

  score < 0 && (score = 0)
  score > 999 && (score = 999)

  this.$emit('score', score)
}
