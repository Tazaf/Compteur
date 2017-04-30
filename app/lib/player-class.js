module.exports = function Player(id, name, score) {
  this.id = id;
  this.name = name;
  this.score = score || 0;
}