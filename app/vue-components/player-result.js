const component = Vue.component('player-result', {
  props: ['player'],
  template: `
    <div class="player-result">
      <div class="player-score" :class="[player.theme]">{{ player.score }}</div>
      <div class="wrapper">
        <div class="player-name">{{ player.name || 'Joueur ' + player.id }}</div>
        <div class="outer-bar lighten-5" :class="[player.theme]">
          <div class="inner-bar" :style="{width: player.percent}" :class="[player.theme]"></div>
        </div>
      </div>
    </div>
  `
})