const fs = require('fs')
const path = require('path')

exports.getTemplate = getTemplate

/**
 * Gets the HTML template for a playerCard, asynchronously.
 * The playerCard is located in the app/player-card/player-card.template.html file.
 */
function getTemplate() {
  return new Promise((resolve, reject) => {
    const templateUrl = path.join(__dirname, 'player-card.template.html')
    fs.readFile(templateUrl, 'utf8', (err, data) => {
      err ? reject(err) : resolve(data);
    });
  })
}