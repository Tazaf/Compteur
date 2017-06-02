const component = Vue.component('player-result', {
  props: ['player'],
  template: `
    <div class="card">
      <div class="card-content">
        <div class="player-info">
          <span class="player-name">{{ player.name || 'Joueur ' + player.id }}</span>
          <span class="player-score">{{ player.score }}</span>
        </div>
        <div class="bar-wrapper">
          <div class="outer-bar"></div>
          <div class="inner-bar deep-orange accent-2"></div>
        </div>
      </div>
    </div>
  `
})