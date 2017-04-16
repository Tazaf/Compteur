const fs = require('fs')
const path = require('path')

exports.getTemplate = getTemplate

let cache

/**
 * Gets the HTML template for a playerCard, asynchronously.
 * The playerCard is located in the app/player-card/player-card.template.html file.
 */
function getTemplate() {
  return new Promise((resolve, reject) => {
    if (cache) {
      resolve(cache)
    } else {
      const templateUrl = path.join(__dirname, 'player-card.html')
      fs.readFile(templateUrl, 'utf8', (err, data) => {
        cache = data
        err ? reject(err) : resolve(data);
      });
    }
  })
}