const component = Vue.component('player-result', {
  props: ['player'],
  template: `
    <div id="results">
      <div class="player-result">
        <div class="player-score">{{ player.score }}</div>
        <div class="wrapper">
          <div class="player-name">{{ player.name || 'Joueur ' + player.id }}</div>
          <div class="outer-bar">
            <div class="inner-bar"></div>
          </div>
        </div>
      </div>
    </div>
  `
})