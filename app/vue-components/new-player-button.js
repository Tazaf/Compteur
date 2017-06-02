const electron = require('electron')
const ipc = electron.ipcRenderer
const path = require('path')
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))

const component = Vue.component('new-player-button', {
  template: `
    <div class="col m12 l6 s12">
      <div id="new-player-button" @click="sendNewPlayerEvent">
        <i class="material-icons">person_add</i>
        <h5>Ajouter un joueur</h5>
      </div>
    </div>`,
  methods: {
    sendNewPlayerEvent: function() {
      ipc.send(events.addNewPlayer)
    }
  }
})

module.exports = component