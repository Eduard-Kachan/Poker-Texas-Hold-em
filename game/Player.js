var handCalculator = require('./HandCalculator');

exports.Player = function(socket){
    this.players = null;
    this.game = null;
    var self = this;

    this.socket = socket;
    this.socket.on('disconnect', function(){ self.disconnect() });
    this.socket.on('bet', function(amount){ self.bet(amount) });
    this.socket.on('raise', function(amount){ self.raise(amount) });
    this.socket.on('allIn', function(){ self.allIn() });
    this.socket.on('call', function(){ self.call() });
    this.socket.on('check', function(){ self.check() });
    this.socket.on('fold', function(){ self.fold() });

    this.cards = [];
    this.handStrengh = 0;
    this.hand = [];

    this.money = Math.floor(Math.random()*200)+200;
    this.moneyInPot = 0;
    this.moneyInPots = [];
    this.payed = 0;

    this.sittingOut = false;
    this.isFolded = false;
    this.isAllIn = false;
    this.action = '';

    var betAmount = 0;
    var raiseAmount = 0;
};

exports.Player.prototype = {
    disconnect: function(){
        //player.sittingOut = true;
        //if(!self.game.isStarted){//if game is not started remove all players
        //    self.removeDisconnectedPlayers();
        //}
    },

    bet: function(amount){
        this.action = 'bet';
        this.betAmount = amount;
        this.pay(amount);
        if(this.game.currentBet < this.payed)
            this.game.currentBet = this.payed;
        this.game.drawRound();
    },

    raise: function(amount){
        this.action = 'raise';
        this.raiseAmount = amount;
        var payAmount = this.game.currentBet + amount  - this.payed;
        this.pay(payAmount);
        if(this.game.currentBet < this.payed)
            this.game.currentBet = this.payed;
        this.game.drawRound();
    },

    call: function(){
        this.action = 'call';
        var payAmount = this.game.currentBet - this.payed;
        this.pay(payAmount);
        //self.game.addToMoneyPot(player.pay(payAmount));
        ////console.log('call, payed: ', payAmount, ' money left: ', player.money);
        if(this.game.currentBet < this.payed)
            this.game.currentBet = this.payed;
        this.game.drawRound();
    },

    allIn: function(){
        this.isAllIn = true;
        this.action = 'allIn';
        this.pay(this.money);
        if(this.game.currentBet < this.payed)
            this.game.currentBet = this.payed;
        this.game.drawRound();
    },

    check: function () {
        this.action = 'check';
        this.game.drawRound();
    },

    fold: function(){
        this.action = 'fold';
        this.isFolded = true;
        this.game.removeFoldedFromPot();
        this.game.drawRound();
    },

    calculateHand: function(communityCards){
        var hand = handCalculator.calculateHand(this.cards, communityCards);
        this.hand = hand[0];
        this.handStrengh = hand[1];
        console.log('player handType:', this.handStrengh, ' hand:', this.hand);
    },
    pay: function(amount){
        this.money -= amount;
        this.payed += amount;
        this.moneyInPot += amount;
    },
    updatePlayer: function(actions){
        actions = actions || 'wait';
        this.socket.emit('updatePlayer', {
            cards: this.cards,
            actions: actions
        })
    },
    receiveMoney: function(amount){
        this.money += amount;
    },

    setParents: function(players, game){
        this.players = players;
        this.game = game;
    },

    reset: function(){
        this.cards[0] = this.game.getRandomCard();
        this.cards[1] = this.game.getRandomCard();
        this.calculateHand(this.game.communityCards);

        this.payed = 0;
        this.moneyInPot = 0;
        this.isFolded = false;
        this.isAllIn = false;
        this.action = '';
    }
};
