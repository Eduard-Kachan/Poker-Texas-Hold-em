var Game = require('./Game').Game;
var Players = require('./Players').Players;



exports.Room = function() {
    this.game = new Game();
    this.players = new Players();
    this.players.game = this.game;
    this.game.players = this.players;
};

exports.Room.prototype = {
    getPlayerCount: function(){
        var count = 0;
        for(var i = 0; i < 10; i++){
            if(typeof this.players.players[i] === 'object'){
                count ++;
            }
        }
        return count;
    }
};