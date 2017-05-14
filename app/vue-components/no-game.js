const path = require('path')
const electron = require('electron')
const ipc = electron.ipcRenderer
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))

const component = Vue.component('no-game', {
  methods: {
    newGame: () => ipc.send(events.nbPlayerModal)
  },
  template: `
    <div class="no-game blue-grey-text">
      <div>
        <i class="material-icons deep-orange-text text-accent-2">info_outline</i>
        <h5>Aucune partie en cours...</h5>
        <p><a class="deep-orange accent-2 btn waves-effect" @click="newGame">Nouvelle partie</a></p>
        <p><kbd>[Ctrl + N]</kbd></p>
      </div>
    </div>`
})

module.exports = component