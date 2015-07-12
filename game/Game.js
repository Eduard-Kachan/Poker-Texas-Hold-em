var _ = require('underscore');

exports.Game = function () {
    this.isStarted = false;
    this.players = null;
    this.cardDeck = [];
    this.moneyPots = [];

    this.communityCards = [];
    this.dealingRound = 0;
    //this.drawCards = [];

    this.smallBlindFee = 10;
    this.bigBlindFee = this.smallBlindFee * 2;
    this.currentBet = 0;
};

exports.Game.prototype = {
    startGame: function(){
        this.resetGame();
        this.players.resetPlayers();
        this.drawRound();
    },

    updateGameForPlayers: function(){
        var self = this;

        // update player seats
        this.players.updatePlayersList();

        // update players actions
        for(var i = 0; i < 10; i++){
            var player = this.players.players[i];
            if(typeof player === 'number') continue;
            player.updatePlayer();
        }

        // update the table to players
        this.players.emitToPlayers('updateGame', {
            moneyPot: self.getCurrentMoneyFromPots(),
            communityCards: self.getCurrentCommunityCards()
        });
    },

    getCurrentMoneyFromPots: function(){
        var money = 0;

        for(var i = 0; i < this.moneyPots.length; i++){
            money += this.moneyPots[i].money;
        }

        return money;
    },

    getCurrentCommunityCards: function(){
        var cards = [];
        var amountOfCards = 0;

        if(this.dealingRound > 0)
            amountOfCards = this.dealingRound + 2;

        for(var i = 0; i < amountOfCards; i++){
            cards.push(this.communityCards[i]);
        }
        return cards;
    },

    resetGame: function(){
        this.isStarted = true;

        this.dealingRound = 0;

        // new card deck
        this.newCardDeck();

        // get community cards
        this.newCommunityCards();

        // make new pot
        this.moneyPots = [];
        this.makeNewPot();

        this.currentBet = this.bigBlindFee;
    },

    drawRound: function(){

        this.updatePotsMoney();

        if(this.players.isAllPlayersChecked()) {
            //next draw
            if (this.dealingRound === 0) {
                //turn
                this.updatePots();
                this.dealingRound = 1;
                // Set the player who is staring the round to be the dealer.
                // This gets pushed later on to the next person.
                this.players.current = this.players.dealer;
                this.currentBet = 0;
                this.players.resetActions();

            } else if (this.dealingRound == 1) {
                //turn
                this.dealingRound = 2;
                // Set the player who is staring the round to be the dealer.
                // This gets pushed later on to the next person.
                this.players.current = this.players.dealer;
                this.currentBet = 0;
                this.players.resetActions();
            } else if (this.dealingRound == 2) {
                //river
                this.updatePots();
                this.dealingRound = 3;
                // Set the player who is staring the round to be the dealer.
                // This gets pushed later on to the next person.
                this.players.current = this.players.dealer;
                this.currentBet = 0;
                this.players.resetActions();
            } else if (this.dealingRound == 3) {
                console.log('get winner:');
                this.updatePots();
                for(var i = 0; i < this.moneyPots.length; i++){
                    this.getWinner(this.moneyPots[i].players, this.moneyPots[i].money);
                }
                this.currentBet = 0;
                this.players.resetActions();
                this.startGame();
            }
        }

        console.log('get next player from current');
        this.players.current = this.players.getNextPlayer(this.players.current);
        this.updateGameForPlayers();
        this.players.requestCurrentPlayerToAct();
    },
    
    updatePotsMoney: function(){
        var money = 0;

        var lastPot = 0;
        if(this.moneyPots.length > 0){
            lastPot = this.moneyPots.length - 1;
        }
        
        this.moneyPots[lastPot].players.forEach(function(player){
            money += player.moneyInPot;
        });

        this.moneyPots[lastPot].money = money;
    },

    updatePots: function(){
        var self = this;
        var isNoPlayersToExclude = false;
        // players with the same lowest pay
        var playersToExclude = [];

        // get player(s) that payed the lowest
        while(!isNoPlayersToExclude){

            this.moneyPots[this.moneyPots.length - 1].players.forEach(function(player){
                if(player.isAllIn && self.currentBet > player.moneyInPot){
                    if(playersToExclude.length === 0){
                        playersToExclude.push(player);
                    }else if(playersToExclude[0].moneyInPot === player.moneyInPot){
                        playersToExclude.push(player);
                    }else if(playersToExclude[0].moneyInPot > player.moneyInPot){
                        playersToExclude = [player];
                    }
                }

                if(playersToExclude.length === 0){
                    console.log('nobody to exclude');
                    isNoPlayersToExclude = true;
                }
            });

            if(playersToExclude.length === 0) return;

            // Create new pot and remove players from it
            // Players not yet removed
            this.moneyPots.push({
                money: 0,
                players: this.moneyPots[this.moneyPots.length - 1].players
            });

            // Removing players from the new pot
            var indexOfPlayer;
            for(var i = 0; i < playersToExclude.length; i++){
                indexOfPlayer = this.moneyPots[this.moneyPots.length - 1].players.indexOf(playersToExclude[i]);
                this.moneyPots[this.moneyPots.length - 1].players.splice(indexOfPlayer, 1);
            }

            // Separate the pots for each player
            var moneyPerPlayer = playersToExclude[0].moneyInPot;
            this.moneyPots[this.moneyPots.length - 2].players.forEach(function(player){
                player.moneyInPot -= moneyPerPlayer;
                player.moneyInPots.push(moneyPerPlayer);
            });

            // Calculate the value of the pre-last pot
            this.moneyPots[this.moneyPots.length - 2].money = moneyPerPlayer * this.moneyPots.length;
        }

        this.updatePotsMoney();
    },
    
    newCardDeck: function(){
        this.cardDeck = _.range(1, 53);
    },

    newCommunityCards: function(){
        for(var i = 0; i < 5; i++){
            this.communityCards[i] = this.getRandomCard();
        }
    },

    getRandomCard: function(){
        var deckLength = this.cardDeck.length;
        var cardNumber = Math.floor(Math.random() * (deckLength - 1)) + 1;
        return this.cardDeck.splice(cardNumber , 1)[0];
    },

    //addToMoneyPot: function(){
    //    for(var i = 0; i < this.moneyPots.length; i++){
    //        if(!this.moneyPots.open) continue;
    //        var totalMoneyAmount = 0;
    //        for(var j = 0; j < this.moneyPots.players; j++)
    //            totalMoneyAmount += this.moneyPots.players[j].payed;
    //        this.moneyPots.money = totalMoneyAmount;
    //    }
    //    //this.moneyPots += amount;
    //},

    getWinner: function(players, money){
        // hand types in the game
        var topHandStrength = [];
        for(var i = 0; i < players.length; i++)
            topHandStrength.push(players[i].handStrengh);
        topHandStrength.sort(function (a, b) {return b - a});
        topHandStrength = topHandStrength[0];

        // players that have the highest hand
        var topPlayersByHand = [];
        for(i = 0; i < players.length; i++)
            if(players[i].handStrengh == topHandStrength)
                topPlayersByHand.push(players[i]);

        // only one person one
        if(topPlayersByHand.length === 1){
            topPlayersByHand.money += this.moneyPots;
            console.log('player Won >> hand:', topPlayersByHand[0].hand);
            topPlayersByHand[0].receiveMoney(money);
        }else{
            // The is more then one person who has the largest hand
            var highestCard = topPlayersByHand;
            var tempArray = [];
            var count = 0;
            var highestNumber = [];

            while (highestCard.length > 1) {
                if (count === 5) break;

                for (i = highestCard.length - 1; i >= 0; i--)
                    if (highestCard[i].hand[count] > highestNumber)
                        highestNumber = highestCard[i].hand[count];

                for (i = 0; i < highestCard.length; i++)
                    if (highestCard[i].hand[count] === highestNumber)
                        tempArray.push(highestCard[i]);

                highestCard = tempArray;
                tempArray = [];

                count++;
                highestNumber = 0;
            }

            if (highestCard.length === 1) {
                // only one person one
                console.log('player Won >> hand:', highestCard[0].hand);
                topPlayersByHand[0].receiveMoney(money);
            } else {
                // split the pot
                for (i = 0; i < highestCard.length; i++){
                    console.log('player Won >> hand:', highestCard[i].hand);
                    topPlayersByHand[0].receiveMoney(Math.floor(money / highestCard.length));
                }
            }
        }
    },

    makeNewPot: function(){
        var self = this;
        this.moneyPots.push({
            money: 0,
            players: []
        });

        // add players to the pot
        this.players.forEachAvailable(function(player){
            self.moneyPots[self.moneyPots.length - 1].players.push(player);
        });
    },

    removeFoldedFromPot: function(){
        this.moneyPots.forEach(function(moneyPot){
            moneyPot.players.forEach(function(player){
                if(player.isFolded){
                    var playerIndex = moneyPot.players.indexOf(player);
                    moneyPot.players.splice(playerIndex,1);
                }
            });
        });
    }
};