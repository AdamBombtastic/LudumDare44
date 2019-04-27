//TODO set resolution to the max window bounds and create a game state to detect if the phone is sideways or not. 

const CANVAS_WIDTH = 640, CANVAS_HEIGHT = 480;
var game = new Phaser.Game(CANVAS_WIDTH, CANVAS_HEIGHT, Phaser.AUTO, '');
 
//var clientWidth = function () {  return Math.max(window.innerWidth, document.documentElement.clientWidth);};
//var clientHeight = function () {  return Math.max(window.innerHeight, document.documentElement.clientHeight);};

var clientWidth = function() {return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);}
var clientHeight = function() {return Math.max(document.documentElement.clientHeight, window.innerHeight || 0)};

game.state.add("load",loadState);
game.state.add("game",gameState);

game.state.start("load");
