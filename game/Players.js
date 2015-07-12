var Player = require('./Player').Player;
var _ = require('underscore');

exports.Players = function Players() {
    this.game = null;
    this.players = [0,0,0,0,0,0,0,0,0,0];
    this.dealer = null;
    this.smallBlind = null;
    this.bigBlind = null;
    this.current = null;

};

exports.Players.prototype = {
    addPlayer: function(socket){
        //this.removeDisconnectedPlayers();
        var player = new Player(socket);
        player.setParents(this, this.game);
        player.isFolded = this.game.isStarted ? true : false;
        player.socket.emit('myId', player.socket.id);

        this.players[this.getRandomSeat()] = player;
        this.updatePlayersList();
    },

    removeDisconnectedPlayers: function(){
        for(var i = 0; i < 10; i++){
            if(typeof this.players[i] == 'number'){
                this.players[i] = 0;
            }else if(this.players[i].socket.disconnected){
                this.players[i] = 0;
            }
        }
        this.updatePlayersList();
    },
    removePlayer: function(player){
        console.log(player);
    },

    updatePlayersList: function(){

        var action = '';
        var playerListUpdate = [];
        for(var i = 0; i < 10; i++){
            if(this.players[i] === 0){
                playerListUpdate.push(0)
            }else{
                if(this.players[i].isFolded){
                    action = 'FOLDED'
                }else if(this.players[i].sittingOut){
                    action = 'SITTING OUT'
                }else if(this.players[i].isAllIn){
                    action = 'ALL IN'
                }else if(this.current === this.players[i]){
                    action = 'Current'
                }else if(this.players[i].action === ''){
                    action = 'Waiting'
                }else{
                    if(this.players[i].action == 'bet'){
                        action = "Bet $" + this.players[i].betAmount;
                    }else if(this.players[i].action == 'raise'){
                        action = "Raised $" + this.players[i].raiseAmount;
                    }else if(this.players[i].action == 'check'){
                        action = "Check";
                    }else if(this.players[i].action == 'call'){
                        action = "Call";
                    }
                }
                playerListUpdate.push({
                    playerId: this.players[i].socket.id,
                    money: this.players[i].money,
                    dealer: (this.dealer) ? (this.dealer === this.players[i]) : false,
                    smallBlind: (this.smallBlind) ? (this.smallBlind === this.players[i]) : false,
                    bigBlind: (this.bigBlind) ? (this.bigBlind === this.players[i]) : false,
                    action: action,
                    cards: false
                })
            }
        }
        this.emitToPlayers('playerListUpdate', playerListUpdate);
    },
    moveDealer: function(){
        this.dealer = this.getNextPlayer(this.dealer);
        this.setSmallBlind();
        this.setBigBlind();
    },

    emitToPlayers: function(event, message){
        for(var i = 0; i < 10; i++){
            if(this.players[i] === 0) continue;
            this.players[i].socket.emit(event, message);
        }
    },

    setDealer: function(){
        this.dealer = this.players[this.getRandomPlayer()];
        //console.log('dealer index: ', this.players.indexOf(this.dealer));
        this.setSmallBlind();
        this.setBigBlind();
    },

    setSmallBlind: function(){
        this.smallBlind = this.getNextPlayer(this.dealer);
        //console.log('small index: ', this.players.indexOf(this.smallBlind));
    },

    setBigBlind: function(){
        this.bigBlind = this.getNextPlayer(this.smallBlind);
        //console.log('big index: ', this.players.indexOf(this.bigBlind));
    },

    getNextPlayer: function(player) {
        var index = this.players.indexOf(player);
        //console.log('start count');
        do{
            index++;
            index = (index > 9) ? 0 : index;
            //console.log(index);
        }while(typeof this.players[index] === 'number' || this.players[index].isFolded || this.players[index].isAllIn || this.players[index].sittingOut);
        //console.log('end count');
        return this.players[index];
    },

    getRandomSeat: function(){
        var randomNum = Math.floor(Math.random() * 10);
        if(typeof this.players[randomNum] === 'object'){
            do{
                randomNum++;
                randomNum = (randomNum > 9) ? 0 : randomNum;
            }while(typeof this.players[randomNum] === 'object');
        }
        return randomNum;
    },

    getRandomPlayer: function() {
        var randomNum = Math.floor(Math.random() * 10);
        if(typeof this.players[randomNum] === 'number'){
            do{
                randomNum++;
                randomNum = (randomNum > 9) ? 0 : randomNum;
            }while(typeof this.players[randomNum] === 'number');
        }
        return randomNum;
    },

    requestCurrentPlayerToAct: function(){
        //this.current = this.current || this.getNextPlayer(this.bigBlind);
        this.current.socket.emit('act', this.getAvailableActions(this.current));
    },

    getAvailableActions: function(_player){
        var actions = [];
        var currentBet = this.game.currentBet;
        var isRoundOpened = currentBet > 0;
        var isEqualBets = true;
        var currentPay = _player.payed;
        var currentMoney = _player.money;
        var isEnoughMoneyToRaise;

        this.players.forEach(function(player){
            if(typeof player === 'number') return;
            if(player.isFolded || player.sittingOut) return;

            //if(self.smallBlind === player && !isRoundOpened){ //find out if small blind started the round
            //    isRoundOpened = (currentPay > self.game.smallBlindFee);
            //}
            //if(player.payed != 0){ //find out if some one has started the round
            //    isRoundOpened = true;
            //}



            //if(!currentBet) currentBet = player.payed;

            if(currentBet != player.payed){ //when current bet is unequal
                isEqualBets = false;
            }

            //if(currentBet < player.payed){ //get the highest bet
            //    currentBet = player.payed;
            //}
        });

        isEnoughMoneyToRaise = (currentBet - currentPay < currentMoney);


        if(!(currentBet > 0)) actions.push('bet');
        if(currentBet > currentPay) actions.push('call');
        if(isRoundOpened && isEnoughMoneyToRaise) actions.push('raise');
        if((isEqualBets && isRoundOpened && isEnoughMoneyToRaise) ||
            (isEqualBets && !(currentBet > 0) && isEnoughMoneyToRaise)) actions.push('check');
        if(currentMoney > 0) actions.push('allIn');
        actions.push('fold');

        _player.updatePlayer(actions);
        //console.log(actions)
    },

    isAllPlayersChecked: function(){
        var isCheck = true;

        this.forEachAvailable(function(player){
            if(player.action != 'check') isCheck = false;
        });

        return isCheck;
    },

    resetActions: function(){
        this.players.forEach(function(player){
            player.action = '';
            player.payed = 0;
        })
    },

    forEachAvailable: function(callback){
        this.players.forEach(function(player){
            if(typeof player === 'number') return;
            if(player.sittingOut) return;
            if(player.isFolded) return;
            if(player.isAllIn) return;
            callback(player);
        });
    },

    resetPlayers: function(){
        for(var i = 0; i < 10; i++){
            if(typeof this.players[i] === 'number') continue;
            this.players[i].reset();
        }

        //setUp Dealer
        if(this.dealer === null) this.setDealer();
        else this.moveDealer();

        //don't remember...
        this.current = this.bigBlind;

        this.smallBlind.pay(this.game.smallBlindFee);
        this.bigBlind.pay(this.game.bigBlindFee);
    }

};