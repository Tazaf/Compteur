const path = require('path')
const Logger = require(path.join(__dirname, 'logger.js'))

module.exports = function Player(values) {
  if (!values.hasOwnProperty('id')) throw new SyntaxError(`The Player constructor expecte at least an 'id' property on its values param object.`)
  this.id = values.id
  this.name = values.name || null
  this.score = values.score || 0
  this.focus = values.focus || false
}