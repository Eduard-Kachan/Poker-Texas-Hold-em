jQuery(function($) {

    // Global Variables
    var socket = io();
    var myID;
    var numOfPeople;
    var users;
    var myCards = [];
    var comunityCards = [];
    var minPay;

    // ------------------------------------
    // Game Function
    // ------------------------------------

    var updateUsers = function(){
        var i = 0;
        var selector;
        for( i = 0; i <= 9; i++ ){
            selector = 'ul.players li:nth-child(' + (i + 1) + ')';
            $(selector).empty();
        }
        var l = users.length-1;
        for( i = 0; i <= l; i++ ){
            selector = 'ul.players li:nth-child(' + (i + 1) + ')';
            var cardOne = $('<div>').addClass('card back');
            var cardTwo = $('<div>').addClass('card cardTwo back');
            var money = $('<div>').addClass('money').text(users[i].money);
            $(selector).append(cardOne, cardTwo, money);
            //console.log(users[i]);
            if(users[i].socketID == myID){
                var identifier = $('<div>').addClass('you').text('you');
                $(selector).append(identifier);
                if(myCards.length > 0){
                    cardOne.removeClass('back').addClass(myCards[0]);
                    cardTwo.removeClass('back').addClass(myCards[1]);
                }
            }
        }
    };

    var updateComunityCards = function(){
        $('ul.communityCards').empty();

        var i = 0;
        var l = comunityCards.length-1;

        for(i;i<=l;i++){
            var card = $('<li>').addClass('communityCard ' + comunityCards[i]);
            $('ul.communityCards').append(card);
        }
    };

    var decodeCard = function(cardNum){
        //Card Suit
        var suit = '';
        if(cardNum >= 1 && cardNum <= 13){
            suit = 'Clubs';
        }else if(cardNum >= 14 && cardNum <= 26){
            suit = 'Diamonds';
        }else if(cardNum >= 27 && cardNum <= 39){
            suit = 'Hearts';
        }else if(cardNum >= 27 && cardNum <= 52){
            suit = 'Spades';
        }

        //Card Order
        var card = cardNum;

        while(card > 13){
            card = card - 13;
        }

        if(card == 1){
            card ='two';
        }else if(card == 2){
            card = 'three';
        }else if(card == 3){
            card = 'four';
        }else if(card == 4){
            card = 'five';
        }else if(card == 5){
            card = 'six';
        }else if(card == 6){
            card = 'seven';
        }else if(card == 7){
            card = 'eight';
        }else if(card == 8){
            card = 'nine';
        }else if(card == 9){
            card = 'ten';
        }else if(card == 10){
            card = 'jack';
        }else if(card == 11){
            card = 'queen';
        }else if(card == 12){
            card = 'king';
        }else if(card == 13){
            card = 'ace';
        }

        return card + 'Of' + suit
    };

    var disableButtons = function(){
        $('input.moneyBet').attr("disabled", true).val('');
        $('button.check').attr("disabled", true);
        $('button.raise-call').attr("disabled", true);
        $('button.fold').attr("disabled", true);
    };

    // ------------------------------------
    // Socket Emitters
    // ------------------------------------

    socket.emit('join');

    $('button.startGame').on('click', function(){
        socket.emit('start');
    });

    //
    $('button.raise-call').on('click', function(){
        socket.emit('raise-call', $('input.moneyBet').val());
        disableButtons();
    });

    //
    $('button.check').on('click', function(){
        socket.emit('check');
        disableButtons();
    });

    //
    $('button.fold').on('click', function(){
        socket.emit('fold');
        disableButtons();
    });

    // ------------------------------------
    // Socket connections
    // ------------------------------------

    //users personal id, user can find him self
    socket.on('socketID', function(socketID){
        myID = socketID;
        $('li.userID').text('You are = ' + socketID);
    });

    //socket.on('peopleInGame', function(peopel){
    //    numOfPeople = peopel;
    //    $('li.usersInGame').text('People connected = ' + peopel);
    //});

    //game started
    socket.on('started', function(){
        $('li.game').text('Game Started');
    });

    //a list of all users in the game
    socket.on('users', function(userList){
        users = userList;
        $('li.usersInGame').text('People connected = ' + users.length);
        updateUsers();
    });

    //new user has joined
    socket.on('newUser', function(userNew){
        users.push(userNew);
        updateUsers();
    });

    //user left from the room
    socket.on('userLeft', function(userLeftID){
        var i = users.length - 1;

        for(i; i >= 0; i--){
            if(users[i].socketID == userLeftID){
                users.splice(i,1);
            }
        }

        updateUsers();
    });

    //the users hand
    socket.on('userCards', function(cards){
        myCards[0] = decodeCard(cards[0]);
        myCards[1] = decodeCard(cards[1]);
        updateUsers();
    });

    //the flop came in, so show it on the table
    socket.on('comunityCards', function(cards){
        for(var i = 0; i <= cards.length-1; i++){
            comunityCards.push(decodeCard(cards[i]));
        }
        updateComunityCards();
    });

    //telling the user to play their hand
    socket.on('playHand', function(blind){
        minPay = blind.minPay;
        if(blind.blind == 'small') {
            $('.moneyBet').prop("disabled", false).val(minPay);
            $('.raise-call').prop("disabled", false);
        }else if(blind.blind == 'big'){
            $('.moneyBet').prop("disabled", false).val(minPay);
            $('.raise-call').prop("disabled", false);
        }else{
            $('input.moneyBet').attr("disabled", false).val(minPay);
            $('button.check').attr("disabled", false);
            $('button.raise-call').attr("disabled", false);
            $('button.fold').attr("disabled", false);
        }
        ////////////////////////////////////
        //if(blind.blind != 'small')
        //    socket.emit('raise-call', minPay);
        ////////////////////////////////////
    });

    //the user won the hand
    socket.on('wonHand', function(){
        //alert('you won the hand')
    });

    //hand ended clear table
    socket.on('newHand', function(){
        comunityCards = [];
        myCards = []
    });

    //edit money pile
    socket.on('moneyPile', function(money){
        $('.moneyPile').text('$' + money);
    });

});