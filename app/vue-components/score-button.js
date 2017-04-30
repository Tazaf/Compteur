const path = require('path')
const settings = require(path.join(__dirname, '..', 'lib', 'settings-constants.js'))
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))

// Global variable to store the reference to the setTimeout that will trigger the click-hold event
let holdPending
// Global variable to store the reference to the setInterval responsible for the autoincrementation of the score
let holdActive

const component = {
  props: ['player', 'modifier'],
  computed: {
    label: function () {
      return this.modifier > 0 ? `+${this.modifier}` : this.modifier
    },
  },
  methods: {
    /**
     * Initiates the call to autoIncrement.
     * It will be triggered after a delay which value is stored in the holdDelay global variable.
     * The holdPending global variable will store the reference to the created timeout.
     */
    initiateAutoIncrement: function (player, modifier) {
      holdPending = setTimeout(() => this.autoIncrement(player, modifier), settings.HOLD_DELAY)
    },
    /**
     * Resolves the correct action when the mouseup event is fired on a modifier button.
     * The action can either be a simple click or a hold click.
     * In the first case, the score is change one time.
     * In the second case, the autoIncrement function is called.
     */
    resolveModifier: function (player, modifier) {
      if (holdActive) {
        clearInterval(holdActive)
        holdActive = undefined
      } else if (holdPending) {
        clearTimeout(holdPending)
        holdPending = undefined
        this.changeScore(player, modifier)
      }
    },
    /**
     * Creates an automatic incrementation of a player's score.
     * The score change will be done by the changeScore function.
     * A reference to this automatic incrementation will be stored in the holdActive global variable
     * The interval from which the score will be incremented is based on the autoIncrementDelay global variable
     * @param {Player} player An object representing the player whose score should be modified
     * @param {Number} modifier A number representing the modifier to apply to the score
     */
    autoIncrement: function (player, modifier) {
      holdActive = setInterval(() => this.changeScore(player, modifier), settings.AUTO_INCREMENT_DELAY)
    },
    /**
     * Changes the score on a player's card, applying it the given modifier.
     * The score to change will be retrieve from the given button, that should be a button inside a player's card.
     * The score can not be negative.
     * @param {*} $ele The button that is responsible for the score change 
     * @param {*} modifier The modifier to apply to the new score
     */
    changeScore: function (player, modifier) {
      let score = player.score
      score += modifier

      score < 0 && (score = 0)
      score > 999 && (score = 999)

      this.$emit('score', score)
    }
  },
  template: '<button @mousedown="initiateAutoIncrement(player, modifier)" @mouseup="resolveModifier(player, modifier)" class="btn waves-effect" tabindex="-1">{{ label }}</button>'
}

module.exports = component
