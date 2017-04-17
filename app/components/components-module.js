const fs = require('fs')
const path = require('path')

exports.getPlayerCard = playerCard
exports.getPlayerResult = playerResult
exports.getNoGameMessage = noGameMessage

let cache = {}

/**
 * Gets the HTML template for a playerCard, asynchronously.
 * The playerCard is located in the app/player-card/player-card.template.html file.
 */
function playerCard() {
  return new Promise((resolve, reject) => {
    if (cache.playerCard) {
      resolve(cache.playerCard)
    } else {
      const templateUrl = path.join(__dirname, 'player-card.html')
      fs.readFile(templateUrl, 'utf8', (err, data) => {
        cache.playerCard = data
        err ? reject(err) : resolve(data);
      });
    }
  })
}

/**
 * Gets the HTML template for a player result component, asynchronously.
 * The player result component is located in the app/player-result/player-result.html file.
 */
function playerResult() {
  return new Promise((resolve, reject) => {
    if (cache.playerResult) {
      resolve(cache.playerResult)
    } else {
      const templateUrl = path.join(__dirname, 'player-result.html')
      fs.readFile(templateUrl, 'utf8', (err, data) => {
        cache.playerResult = data
        err ? reject(err) : resolve(data);
      });
    }
  })
}

/**
 * Gets the HTML template for a player result component, asynchronously.
 * The player result component is located in the app/player-result/player-result.html file.
 */
function noGameMessage() {
  return new Promise((resolve, reject) => {
    if (cache.noGameMessage) {
      resolve(cache.noGameMessage)
    } else {
      const templateUrl = path.join(__dirname, 'no-game-message.html')
      fs.readFile(templateUrl, 'utf8', (err, data) => {
        cache.noGameMessage = data
        err ? reject(err) : resolve(data);
      });
    }
  })
}