const fs = require('fs')
const path = require('path')

exports.getTemplate = getTemplate

/**
 * Gets the HTML template for a player result component, asynchronously.
 * The player result component is located in the app/player-result/player-result.html file.
 */
function getTemplate() {
  return new Promise((resolve, reject) => {
    const templateUrl = path.join(__dirname, 'player-result.html')
    fs.readFile(templateUrl, 'utf8', (err, data) => {
      err ? reject(err) : resolve(data);
    });
  })
}