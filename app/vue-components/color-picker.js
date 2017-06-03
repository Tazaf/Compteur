const path = require('path')
const ipc = require('electron').ipcRenderer
const Settings = require(path.join(__dirname, '..', 'lib', 'settings-constants.js'))
const Logger = require(path.join(__dirname, '..', 'lib', 'logger.js'))
const events = require(path.join(__dirname, '..', 'lib', 'event-service.js'))

const component = Vue.component('color-picker', {
    props: ['player'],
    data() {
        return {
            colors: [
                [
                    Settings.DEFAULT_THEME,
                    Settings.THEME_1,
                    Settings.THEME_2,
                    Settings.THEME_3,
                    Settings.THEME_4
                ], [
                    Settings.THEME_5,
                    Settings.THEME_6,
                    Settings.THEME_7,
                    Settings.THEME_8,
                    Settings.THEME_9,
                ]]
        }
    },
    methods: {
        isActive(color) {
            return this.player.theme === color ? 'active' : ''
        },
        sendColorTheme(color) {
            ipc.send(events.colorTheme, {
                id: this.player.id,
                theme: color
            })
        },
        selectColorTheme(color) {
            this.$emit('selected', color)
        },
        restoreDefaultTheme() {
            this.sendColorTheme(this.player.theme)
        }
    },
    template: `
        <div class="color-picker">
            <div class="color-row" v-for="colorRow in colors">
                <div class="color-choice" v-for="color in colorRow" :class="[color, isActive(color)]" @mouseout="restoreDefaultTheme" @mouseover="sendColorTheme(color)" @click="selectColorTheme(color)">
                    <i class="material-icons checkmark">check</i>
                </div>
            </div>
        </div>
    `
})

module.exports = component