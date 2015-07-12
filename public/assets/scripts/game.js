var Game = function(){
    this.width = 900;
    this.height = 718;


    this.renderer = PIXI.autoDetectRenderer(this.width, this.height, {backgroundColor : 0x95E6E0});
    this.stage = new PIXI.Container();

    this.chairsContainer = new PIXI.Container();
    this.tableContainer = new PIXI.Container();
    this.chipsContainer = new PIXI.Container();
    this.cardsContainer = new PIXI.Container();
    this.bodiesContainer = new PIXI.Container();
    this.headsContainer = new PIXI.Container();

    this.chairsContainer.zIndex = 5;
    this.tableContainer.zIndex = 10;
    this.chipsContainer.zIndex = 15;
    this.cardsContainer.zIndex = 20;
    this.bodiesContainer.zIndex = 25;
    this.headsContainer.zIndex = 30;

    this.stage.addChild(this.chairsContainer);
    this.stage.addChild(this.tableContainer);
    this.stage.addChild(this.chipsContainer);
    this.stage.addChild(this.cardsContainer);
    this.stage.addChild(this.bodiesContainer);
    this.stage.addChild(this.headsContainer);

    this.seats = [];
    this.players = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    this.communityCards = [];

    this.dealerChip = new PIXI.Sprite(PIXI.Texture.fromImage('assets/images/game/dealerChip.png'));
    this.dealerChip.anchor.x = 0.5;
    this.dealerChip.anchor.y = 0.5;
    this.chipsContainer.addChild(this.dealerChip);

    this.smallBlindChip = new PIXI.Sprite(PIXI.Texture.fromImage('assets/images/game/smallBlindChip.png'));
    this.smallBlindChip.anchor.x = 0.5;
    this.smallBlindChip.anchor.y = 0.5;
    this.chipsContainer.addChild(this.smallBlindChip);

    this.bigBlindChip = new PIXI.Sprite(PIXI.Texture.fromImage('assets/images/game/bigBlindChip.png'));
    this.bigBlindChip.anchor.x = 0.5;
    this.bigBlindChip.anchor.y = 0.5;
    this.chipsContainer.addChild(this.bigBlindChip);

    this.moneyPot = new PIXI.Text('$ 0', { font: '33px Lora', fill: '#104710'});
    this.moneyPot.anchor.x = 0;
    this.moneyPot.anchor.y = 1;
    this.moneyPot.position.x = this.width/2 - 117;
    this.moneyPot.position.y = this.height/2 - 28;
    this.stage.addChild(this.moneyPot);


    var self = this;
    animate();
    function animate() {
        requestAnimationFrame(animate);
        self.renderer.render(self.stage)
    }
};

Game.prototype = {
    updateLayersOrder: function(){
        var self = this;
        /* call this function whenever you added a new layer/container */
        this.stage.updateLayersOrder = function () {
            self.stage.children.sort(function(a,b) {
                a.zIndex = a.zIndex || 0;
                b.zIndex = b.zIndex || 0;
                return b.zIndex - a.zIndex
            });
        };
    },
    radialAlign: function(object, degrees, distance, referance, keepObjectRotation){
        var degreesOfAQuarter = 0;
        var xNormal = 1;
        var yNormal = 1;

        if(degrees <= 90){
            degreesOfAQuarter = degrees;
        }else if(degrees <= 180){
            degreesOfAQuarter = degrees - 90;
            degreesOfAQuarter = 90 - degreesOfAQuarter;
            yNormal = -1;
        }else if(degrees <= 270){
            degreesOfAQuarter = degrees - 180;
            xNormal = -1;
            yNormal = -1;
        }else if(degrees <= 360){
            degreesOfAQuarter = degrees - 270;
            degreesOfAQuarter = 90 - degreesOfAQuarter;
            xNormal = -1;
        }

        var radiant  = Math.PI /180 * degreesOfAQuarter;

        var AdditionalX = distance * Math.sin(radiant);
        var AdditionalY = Math.sqrt(Math.pow(distance, 2) - Math.pow(AdditionalX, 2));

        object.x = referance.x + AdditionalX * xNormal;
        object.y = referance.y - AdditionalY * yNormal;

        if(!keepObjectRotation){
            object.rotation = Math.PI /180 * degrees;
        }

    },
    addTable: function(){
        var table = new PIXI.Sprite(PIXI.Texture.fromImage('assets/images/game/table.png'));
        table.anchor.x = 0.5;
        table.anchor.y = 0.5;
        table.position.x = this.width/2;
        table.position.y = this.height/2;
        this.tableContainer.addChild(table);
    },
    addPlayer: function(seatNumber){

        this.players[seatNumber] = {
            body: this.createBody(seatNumber),
            head: this.createHead(seatNumber),
            cards: this.createHandCards(seatNumber),
            name: this.createNameTag('default', seatNumber),
            money: this.createMoneyTag('0', seatNumber)
        };

        if(seatNumber == 10){
            this.disableSeat(this.seats[0]);
        }else{
            this.disableSeat(this.seats[seatNumber]);
        }


    },
    createNameTag: function(name, seatNumber){
        var nameTag = new PIXI.Text(name, { font: '20px Slabo', fill: '#0C4F7D'});
        nameTag.anchor.x = 0.5;
        nameTag.anchor.y = 0.5;
        this.radialAlign(nameTag, 36 * seatNumber, 327, {x:this.width/2, y:this.height/2}, true);
        nameTag.position.y -= 10;
        this.stage.addChild(nameTag);
        return nameTag;
    },
    createMoneyTag: function(money, seatNumber){
        var moneyTag = new PIXI.Text('$ ' + money, { font: '18px Lora', fill: '#0C4F7D'});
        moneyTag.anchor.x = 0.5;
        moneyTag.anchor.y = 0.5;
        this.radialAlign(moneyTag, 36 * seatNumber, 327, {x:this.width/2, y:this.height/2}, true);
        moneyTag.position.y += 10;
        this.stage.addChild(moneyTag);
        return moneyTag;
    },
    createBody: function(seatNumber){
        var randomColor = Math.floor(Math.random()*3)+1;
        if(randomColor == 1){
            randomColor = 'orange_';
        }else if(randomColor == 2){
            randomColor = 'blue_';
        }else{
            randomColor = 'yellow_';
        }
        var randomNumber = Math.floor(Math.random()*2)+1;
        var body = new PIXI.Sprite(PIXI.Texture.fromImage('assets/images/game/body/' + randomColor + randomNumber +  '.png'));
        body.anchor.x = 0.5;
        body.anchor.y = 0.5;
        this.radialAlign(body, 36 * seatNumber, 209-23, {x:this.width/2, y:this.height/2});
        this.bodiesContainer.addChild(body);
        return body;
    },
    createHead: function(seatNumber){
        var randomNumber = Math.floor(Math.random()*5)+1;
        var head = new PIXI.Sprite(PIXI.Texture.fromImage('assets/images/game/head/' + randomNumber +  '.png'));
        head.anchor.x = 0.5;
        head.anchor.y = 0.5;
        this.radialAlign(head, 36 * seatNumber, 288-34, {x:this.width/2, y:this.height/2});
        this.headsContainer.addChild(head);
        return head;
    },
    createHandCards: function(seatNumber){
        var hand = new PIXI.Sprite(PIXI.Texture.fromImage('assets/images/game/handCards.png'));
        hand.anchor.x = 0.5;
        hand.anchor.y = 0.5;
        this.radialAlign(hand, 36 * seatNumber, 154, {x:this.width/2, y:this.height/2});
        this.cardsContainer.addChild(hand);
        return hand;
    },
    addSeats: function(){
        for(var i = 0; i < 10; i++){
            this.seats[i] = new PIXI.Sprite(PIXI.Texture.fromImage('assets/images/game/seatTuckedIn.png'));
            this.seats[i].anchor.x = 0.5;
            this.seats[i].anchor.y = 0.5;
            this.seats[i].interactive = true;
            this.seats[i].buttonMode = true;
            this.radialAlign(this.seats[i], 36 * i, 221, {x:this.width/2, y:this.height/2});
            this.chairsContainer.addChild(this.seats[i]);

            this.seats[i]
                .on('mouseover', this.seatMouseOver)
                .on('mouseout', this.seatMouseOut)
                .on('mousedown', this.seatMouseDown);

        }
    },
    seatMouseOver: function(){
        this.texture = PIXI.Texture.fromImage('assets/images/game/seat.png');
    },
    seatMouseOut: function(){
        this.texture = PIXI.Texture.fromImage('assets/images/game/seatTuckedIn.png');
    },
    seatMouseDown: function(){
        this.disableSeat(this);
    },
    disableSeat: function(seat){
        seat.texture = PIXI.Texture.fromImage('assets/images/game/seat.png');
        seat.interactive = false;
        seat.buttonMode = false;
    },
    moveDealerChip: function(seatNumber){
        this.radialAlign(this.dealerChip, 36 * seatNumber, 127, {x:this.width/2, y:this.height/2}, true);
    },
    moveSmallBlindChip: function(seatNumber){
        this.radialAlign(this.smallBlindChip, 36 * seatNumber, 127, {x:this.width/2, y:this.height/2}, true);
    },
    moveBigBlindChip: function(seatNumber){
        this.radialAlign(this.bigBlindChip, 36 * seatNumber, 127, {x:this.width/2, y:this.height/2}, true);
    },
    addCommunityCards: function(cardName){
        var card = new PIXI.Sprite(PIXI.Texture.fromImage('assets/images/game/cards/' + cardName + '.png'));
        card.anchor.x = 0.5;
        card.anchor.y = 0.5;
        card.position.y = this.height / 2 + 12;
        card.position.x = this.width/2 - 97;

        card.position.x += 49 * this.communityCards.length;

        this.communityCards.push(card);

        this.cardsContainer.addChild(card);
    },
    removeCommunityCards: function(){
        for(var i = 0; i < 5; i++){
            this.cardsContainer.removeChild(this.communityCards[i]);
        }
        this.communityCards = [];
    },
    decodeCard: function(number){
        var suit = '';
        var type = '';

        if(number >= 1 && number <= 13){
            suit = 'c';
        }else if(number >= 14 && number <= 26){
            suit = 'd';
        }else if(number >= 27 && number <= 39){
            suit = 'h';
        }else if(number >= 40 && number <= 52){
            suit = 's';
        }

        console.log(number);
        console.log(suit);

        while(number > 13){
            number = number - 13;
        }

        if(number == 1){
            type = '2';
        }else if(number == 2){
            type = '3';
        }else if(number == 3){
            type = '4';
        }else if(number == 4){
            type = '5';
        }else if(number == 5){
            type = '6';
        }else if(number == 6){
            type = '7';
        }else if(number == 7){
            type = '8';
        }else if(number == 8){
            type = '9';
        }else if(number == 9){
            type = '10';
        }else if(number == 10){
            type = 'j';
        }else if(number == 11){
            type = 'q';
        }else if(number == 12){
            type = 'k';
        }else if(number == 13){
            type = 'a';
        }

        return suit + type;
    }


};


jQuery(function($) {



    var game = new Game();
    $('.wrapper').append(game.renderer.view);

    game.addTable();
    game.addSeats();

    var socket;
    var myId;

    var current = false;
    setTimeout(function(){
        socket = io();
        socket.on('myId', function(id){
            myId = id;
        });
        socket.on('playerListUpdate', function(list){

            for(var i = 0; i < 10; i++) {
                console.log(i);

                //$('.table li').each(function(index){
                console.log(game.players);
                if (list[i] === 0) {
                    if (game.players[i] === 0) {

                    }
                    //player left
                    //remove player
                    //$(this).children('.name').text('Empty Spot');
                    //$(this).children('.symbol').addClass( 'hide' );
                    //$(this).children('.cardOne').addClass( 'hide' );
                    //$(this).children('.cardTwo').addClass( 'hide' );
                    //$(this).children('.marker').addClass( 'hide' );
                    //$(this).children('.action').addClass( 'hide' );
                    continue;
                }

                if (game.players[i] === 0) {

                    game.addPlayer(i);
                }


                //if(playerList[index].current)$(this).append('*CURRENT<br/>');

                if (myId === list[i].playerId) {
                    game.players[i].name.text = 'ME';
                    //$(this).children('.name').text('ME')
                } else {
                    game.players[i].name.text = 'Player';
                    //$(this).children('.name').text()
                }

                console.log(game.players[i].money.text);
                game.players[i].money.text = '$ ' + list[i].money;

                //if(playerList[index].cards != []){
                //    $(this).children('.cardOne').removeClass('hide').text(decodeCard(playerList[index].cards[0]));
                //    $(this).children('.cardTwo').removeClass('hide').text(decodeCard(playerList[index].cards[1]));
                //}else{
                //    $(this).children('.cardOne').addClass( 'hide' );
                //    $(this).children('.cardTwo').addClass( 'hide' );
                //}

                if (list[i].dealer) {
                    game.moveDealerChip(i);
                } else if (list[i].smallBlind) {
                    game.moveSmallBlindChip(i);
                } else if (list[i].bigBlind) {
                    game.moveBigBlindChip(i);
                }

                //$(this).children('.action').removeClass( 'hide' ).text(playerList[index].action);


            }
        });
        //
        //socket.on('playerCards', function(cards){
        //    $('.playerCards')
        //        .empty()
        //        .append(cards[0] + '<br/>')
        //        .append(cards[1] + '<br/>');
        //});

        socket.on('updateGame', function(table){
            //$('.moneyPot .money').text(table.moneyPot);
            game.moneyPot.text = '$ ' + table.moneyPot;

            if(table.communityCards.length > 0){
                if(table.communityCards.length > game.communityCards.length){
                    for(var i = game.communityCards.length; i < table.communityCards.length; i++){
                        game.addCommunityCards(game.decodeCard(table.communityCards[i]));
                    }
                }
            }else{
                game.removeCommunityCards();
            }

            //$( ".communityCards li" ).each(function(index) {
            //    if(game.communityCards[index] == undefined){
            //        $( this ).text('?');
            //    }else{
            //        $( this ).text(decodeCard(game.communityCards[index]));
            //    }
            //});


        });

        socket.on('updatePlayer', function(player){

            $('.playerCards .cardOne').attr('src','assets/images/game/cards/' + game.decodeCard(player.cards[0]) + '.png');
            $('.playerCards .cardTwo').attr('src','assets/images/game/cards/' + game.decodeCard(player.cards[1]) + '.png');

            if(player.actions == 'wait'){
                setActionToWait();
            }else{
                current = true;
                setActions(player.actions);
            }
        });

    }, 1000);

    $('button.call').on('click', function(){
        call();
    });

    $('button.check').on('click', function(){
        check();
    });

    $('.bet button').on('click', function(){
        bet();
    });

    $('.raise button').on('click', function(){
        raise();
    });

    $('button.allIn').on('click', function(){
        allIn();
    });

    $('button.fold').on('click', function(){
        fold();
    });

    var call = function(){
        if(!current) return;
        socket.emit('call');
        setActionToWait();
    };

    var raise = function(){
        if(!current) return;
        if($('.raise input').val() == ''){
            socket.emit('raise', 10);
        }else{
            socket.emit('raise', Number($('.raise input').val()));
        }
        $('.raise input').val('');
        setActionToWait();
    };

    var check = function(){
        if(!current) return;
        socket.emit('check');
        setActionToWait();
    };

    var bet = function(){
        if(!current) return;
        if($('.bet input').val() == ''){
            socket.emit('bet', 10);
        }else{
            socket.emit('bet', Number($('.bet input').val()));
        }
        $('.bet input').val();
        setActionToWait();
    };

    var allIn = function(){
        if(!current) return;
        socket.emit('allIn');
        setActionToWait();
    };

    var fold = function(){
        if(!current) return;
        socket.emit('fold');
        setActionToWait();
    };

    var setActions = function(actions){
        $('span.waiting').addClass( 'hide' );

        for(var i = 0; i < actions.length; i++){
            if(actions[i] == 'call'){
                $('.call').removeClass( 'hide' );
            }else if(actions[i] == 'bet'){
                $('.bet').removeClass( 'hide' );
            }else if(actions[i] == 'raise'){
                $('.raise').removeClass( 'hide' );
            }else if(actions[i] == 'allIn'){
                $('.allIn').removeClass( 'hide' );
            }else if(actions[i] == 'fold'){
                $('.fold').removeClass( 'hide' );
            }else if(actions[i] == 'check'){
                $('.check').removeClass('hide');
            }
        }
    };

    var setActionToWait = function(){
        $('span.waiting').removeClass( 'hide' );
        $('.call').addClass( 'hide' );
        $('.bet').addClass( 'hide' );
        $('.raise').addClass( 'hide' );
        $('.allIn').addClass( 'hide' );
        $('.fold').addClass( 'hide' );
        $('.check').addClass( 'hide' );
        current = false;
    };



    $(document).keypress(function(event) {
        //1 49
        //2 50
        //3 51
        //4 52
        //5 53
        //6 54
        //7 55
        //8 56
        //9 57
        //0 48


        //alert(event.charCode);
        if(!current) return;
        var input = '';
        if(!$('.bet input').is(":focus") || !$('.raise input').is(":focus")){
            if(!$('.bet').hasClass('hide')){
                input = '.bet ';
            }else if(!$('.raise').hasClass('hide')){
                input = '.raise ';
            }else{
                return;
            }
            if(event.charCode == 49){
                $(input + 'input').val($(input + 'input').val() + '1');
            }else if(event.charCode == 50){
                $(input + 'input').val($(input + 'input').val() + '2');
            }else if(event.charCode == 51){
                $(input + 'input').val($(input + 'input').val() + '3');
            }else if(event.charCode == 52){
                $(input + 'input').val($(input + 'input').val() + '4');
            }else if(event.charCode == 53){
                $(input + 'input').val($(input + 'input').val() + '5');
            }else if(event.charCode == 54){
                $(input + 'input').val($(input + 'input').val() + '6');
            }else if(event.charCode == 55){
                $(input + 'input').val($(input + 'input').val() + '7');
            }else if(event.charCode == 56){
                $(input + 'input').val($(input + 'input').val() + '8');
            }else if(event.charCode == 57){
                $(input + 'input').val($(input + 'input').val() + '9');
            }else if(event.charCode == 48){
                $(input + 'input').val($(input + 'input').val() + '0');
            }
        }


        if(event.charCode == 99){
            call();// c 99
        }else if(event.charCode == 104){
            check();// h 104
        }else if(event.charCode == 98){
            bet();// b 98
        }else if(event.charCode == 114){
            raise();// r 114
        }else if(event.charCode == 97){
            allIn();// a 97
        }else if(event.charCode == 102){
            fold();// f 102
        }
    });
});

