const path = require('path')
const _ = require('lodash')
const ipc = require('electron').ipcRenderer
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))
const Logger = require(path.join(__dirname, '..', 'lib', 'logger.js'))
const Settings = require(path.join(__dirname, '..', 'lib', 'settings-constants.js'))
// Key constant used to detect key strokes
const KEYS = {
  PRESS: {
    NUM_1: 48,
    NUM_9: 57,
  },
  DOWN: {
    ENTER: 13,
    ESC: 27
  }
}

const mewCounter = new Vue({
  el: '#new-counter',
  data: {
    choices: [
      { value: 1, selected: false, surrounder: false },
      { value: 2, selected: false, surrounder: false },
      { value: 3, selected: false, surrounder: false },
      { value: 4, selected: false, surrounder: false },
      { value: 5, selected: false, surrounder: false },
      { value: 6, selected: false, surrounder: false },
      { value: 7, selected: false, surrounder: false },
      { value: 8, selected: false, surrounder: false },
      { value: 9, selected: false, surrounder: false },
      { value: 10, selected: false, surrounder: false },
    ],
    okBtnDisabled: true
  },
  methods: {
    startKeyBuffer: startKeyBufferFn,
    detectActionKey: detectActionKeyFn,
    selectNbPlayerWithKeyboard: selectNbPlayerWithKeyboardFn,
    cancelAction: cancelActionFn,
    okAction: okActionFn,
    selectNbPlayer: selectNbPlayerFn,
    enter: enterFn,
    exit: exitFn
  },
  created() {
    this.private = {
      nbPlayers: null,
      keyBuffer: null,
      keyBufferValue: '',
      prev: null,
      next: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      document.addEventListener('keypress', this.startKeyBuffer)
      document.addEventListener('keydown', this.detectActionKey)
    })
  }
})

/* ----- FUNCTION DECLARATIONS ----- */

/**
 * Starts listening to keystrokes and catching them if they match the excpected key.
 * This means that the buffer is only started if the user press numbered keys.
 * @param {*} event The event fired
 */
function startKeyBufferFn(event) {
  // Logger.log(event.which, event.keyCode)
  if (event.which >= KEYS.PRESS.NUM_1 && event.which <= KEYS.PRESS.NUM_9) {
    this.private.keyBufferValue += String.fromCharCode(event.keyCode)
    this.private.keyBuffer && clearTimeout(this.private.keyBuffer)
    this.private.keyBuffer = setTimeout(this.selectNbPlayerWithKeyboard, 150)
  }
}

/**
 * Activate the number depending on the keyboard selection.
 * The activation is done only if the typed value is valid
 * i.e. is a number and is in the correct range
 */
function selectNbPlayerWithKeyboardFn() {
  const value = parseInt(this.private.keyBufferValue)
  Logger.log(value)
  if (!isNaN(value) && value > 0 && value <= Settings.NB_PLAYERS_MAX) {
    this.selectNbPlayer(value)
  }
  this.private.keyBufferValue = ''
}

/**
 * Change the state of the modal so that the selected number of player is highlighted
 * @param {Number} value The selected number of player for the game
 */
function selectNbPlayerFn(value) {
  this.private.nbPlayers = value
  var activeChoice = _.find(this.choices, { selected: true })
  var selectedChoice = _.find(this.choices, { value: value })
  if (selectedChoice) {
    if (activeChoice) {
      if (activeChoice.selected === selectedChoice.selected) {
        selectedChoice.selected = false
        this.okBtnDisabled = true
      } else {
        selectedChoice.selected = true
        activeChoice.selected = false
      }
    } else {
      selectedChoice.selected = true
      this.okBtnDisabled = false
    }
  }
}

/**
 * Detects ESC or ENTER strokes and act accordingly
 * @param {*} event The event fired
 */
function detectActionKeyFn(event) {
  Logger.log(event.which, event.keyCode)
  if (event.which === KEYS.DOWN.ESC) {
    this.cancelAction()
  } else if (event.which === KEYS.DOWN.ENTER) {
    !this.okBtnDisabled && this.okAction()
  }
}

/**
 * Triggers to dismiss the modal
 */
function cancelActionFn() {
  ipc.send(events.nbPlayerModalClose)
}

/**
 * Triggers when the number of players have been selected
 */
function okActionFn() {
  ipc.send(events.nbPlayerSelected, this.private.nbPlayers)
}

/**
 * Apply CSS classes to prev and next number of player, depending on the one currently overed
 * @param {Number} value The number of player over whom the mouse is
 */
function enterFn(value) {
  this.private.prev = _.find(this.choices, { value: value - 1 })
  this.private.next = _.find(this.choices, { value: value + 1 })
  this.private.prev && (this.private.prev.surrounder = true)
  this.private.next && (this.private.next.surrounder = true)
}

/**
 * Removes CSS classes to prev and next number of players, depending on the one currently exited
 * @param {Number} value The number of player that the mouse exited
 */
function exitFn(value) {
  this.private.prev && (this.private.prev.surrounder = false)
  this.private.next && (this.private.next.surrounder = false)
}