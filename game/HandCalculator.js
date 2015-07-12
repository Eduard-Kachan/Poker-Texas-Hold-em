var _ = require('underscore');

exports.calculateHand = (function(){
    function normalize(num){
        while(num > 13){
            num = num - 13;
        }
        return num;
    }

    function orderBySuits(cards){
        var orderedCards = [[],[],[],[]];
        for(var i = 6; i >= 0; i--){
            if(cards[i] >= 1 && cards[i] <= 13){
                orderedCards[0].push(normalize(cards[i]));
            }else if(cards[i] >= 14 && cards[i] <= 26){
                orderedCards[1].push(normalize(cards[i]));
            }else if(cards[i] >= 27 && cards[i] <= 39){
                orderedCards[2].push(normalize(cards[i]));
            }else if(cards[i] >= 27 && cards[i] <= 52){
                orderedCards[3].push(normalize(cards[i]));
            }
        }
        return orderedCards;
    }

    function checkDuplicates(cards, times){
        times = times - 1;
        var i;
        var count = 0;
        var card = 0;
        for(i = 0; i <= cards.length - 1; i++){
            if(count === times){
                return card;
            }
            if (cards[i] == cards[i + 1]) {
                count = count + 1;
                card = cards[i];
            } else {
                count = 0;
            }
        }
        return false;
    }

    function checkStraight(cards){
        var straightCards = [];

        for(var i = cards.length-1; i >= 0; i--){

            if(i == 0 && straightCards.length == 4){
                straightCards.push(cards[i]);
            } else if (cards[i] == cards[i - 1] + 1){
                if(straightCards.length == 0 && cards[i] == cards[i + 1] - 1) {
                    straightCards.push(cards[i + 1])
                }
                straightCards.push(cards[i]);
            } else {
                straightCards = [];
            }

            if(straightCards.length == 5) {
                return straightCards;
            }
        }

        return false;
    }

    function reducedCards(cards){
        var array = [];
        for(var i = 0; i <= cards.length - 1; i++){
            array.push(normalize(cards[i]));
        }
        array.sort(function (a, b) {return a - b;});
        return array;
    }

    function isRoyalFlush(playerCards, communityCards){
        var suits = orderBySuits(_.union(playerCards, communityCards)); //clubs, diamonds, hearts, spades
        var royalFlush = [1,10,11,12,13];
        var removeCards = [2, 3, 4, 5, 6, 7, 8, 9];

        for(var i = 0; i < 4; i++){
            suits[i].sort(function (a, b) {return a - b;});
            suits[i] = _.difference(suits[i], removeCards);
            if(_.isEqual(suits[i], royalFlush)){
                //console.log('Royal Flush');
                return suits[i];
            }
        }

        //console.log('not Royal Flush');
        return false;
    }

    function isStraightFlush(playerCards, communityCards){
        var suits = orderBySuits(_.union(playerCards, communityCards)); //clubs, diamonds, hearts, spades
        var straight;

        for(var i = 0; i < 4; i++){
            suits[i].sort(function (a, b) {return a - b;});
            straight = checkStraight(suits[i]);
            if(straight){
                //console.log('Straight Flush');
                return straight;
            }
        }
        //console.log('not Straight Flush');
        return false;
    }

    function isFourKind(playerCards, communityCards){
        var suits = orderBySuits(_.union(playerCards, communityCards)); //clubs, diamonds, hearts, spades
        var fourKindCard = _.intersection(suits[0], suits[1], suits[2], suits[3]);
        if(fourKindCard.length >= 1){
            fourKindCard = fourKindCard[0];
            var fourKind = [fourKindCard, fourKindCard, fourKindCard, fourKindCard];
            var cards = suits[0]
                .concat(suits[1], suits[2], suits[3])
                .sort(function (a, b) {return a - b;});
            for(var i = cards.length-1; i >= 0; i--){
                if(fourKind.length == 5) continue;

                if(cards[i] != fourKindCard){
                    fourKind.push(cards[i]);
                }
            }

            return fourKind;
        }

        return false;
    }

    function isFullHouse(playerCards, communityCards){
        var cards = reducedCards(_.union(playerCards, communityCards));
        var fullHouse = [];

        var firstThree = checkDuplicates(cards, 3);
        if(firstThree){
            cards = _.without(cards, firstThree);
            fullHouse = [firstThree, firstThree, firstThree]
        }else{
            return false;
        }

        var lastTwo = checkDuplicates(cards, 2);
        if(lastTwo){
            fullHouse = fullHouse.concat([lastTwo, lastTwo]);
            return fullHouse;
        }

        return false;
    }

    function isFlush(playerCards, communityCards){
        var suits = orderBySuits(_.union(playerCards, communityCards)); //clubs, diamonds, hearts, spades
        for (var i = 0; i < 4; i++) {
            if(suits[i].length >= 5){
                var flush = suits[i].sort(function (a, b) {return a - b;});
                for(var j = 0; j < 5; j++){
                    if(flush.length == 5) continue;
                    flush.splice(0,1);
                }
                return flush;
            }
        }

        return false;
    }

    function isStraight(playerCards, communityCards){
        var suits = orderBySuits(_.union(playerCards, communityCards)); //clubs, diamonds, hearts, spades
        var cards = _.union(suits[0], suits[1], suits[2], suits[3]).sort(function (a, b) {return a - b;});
        var straight = checkStraight(cards);
        if(straight) {
            return straight;
        }

        return false;
    }

    function isThreeKind(playerCards, communityCards){
        var cards = reducedCards(_.union(playerCards, communityCards)).sort(function (a, b) {return a - b;});
        var threeKind = [];
        var threeKindCard = checkDuplicates(cards, 3);
        if(threeKindCard){
            threeKind = [threeKindCard, threeKindCard, threeKindCard];
            for(var i = cards.length-1; i >= 0; i--){
                if(threeKind.length == 5) continue;

                if(cards[i] != threeKindCard){
                    threeKind.push(cards[i]);
                }
            }
            return threeKind;
        }

        return false;

    }

    function isTwoPair(playerCards, communityCards){
        var cards = reducedCards(_.union(playerCards, communityCards)).sort(function (a, b) {return a - b;});
        var firstTwoKindCard = checkDuplicates(cards, 2);
        var secondTwoKindCard;

        if(firstTwoKindCard){
            var twoPair = [firstTwoKindCard, firstTwoKindCard];
        }else{
            return false;
        }
        var cardsWithout = _.without(cards, firstTwoKindCard);
        secondTwoKindCard = checkDuplicates(cardsWithout, 2);

        if(secondTwoKindCard){
            twoPair = twoPair.concat([secondTwoKindCard,secondTwoKindCard]);
            for(var i = cards.length-1; i >= 0; i--){
                if(twoPair.length == 5) continue;

                if(cards[i] != firstTwoKindCard && cards[i] != secondTwoKindCard){
                    twoPair.push(cards[i]);
                }
            }
            return twoPair;
        }

        return false;

    }

    function isPair(playerCards, communityCards){
        var cards = reducedCards(_.union(playerCards, communityCards)).sort(function (a, b) {return a - b;});
        var pair = [];
        var twoKindCard = checkDuplicates(cards, 2);

        if(twoKindCard){
            pair = [twoKindCard, twoKindCard];
            for(var i = cards.length-1; i >= 0; i--){
                if(pair.length == 5) continue;

                if(cards[i] != twoKindCard){
                    pair.push(cards[i]);
                }
            }
            return pair;
        }

        return false;

    }

    function isHighCard(playerCards, communityCards){
        var cards = reducedCards(_.union(playerCards, communityCards)).sort(function (a, b) {return a - b;});
        var highCard = [];

        for(var i = cards.length-1; i >= 0; i--){
            if(highCard.length == 5) continue;
            highCard.push(cards[i]);
        }

        return highCard;
    }

    return function(playerCards, communityCards){
        var hand = false;
        var handType = 0;
        for(var i = 0; i < 10; i++){
            switch(i){
                case 0:
                    hand = isRoyalFlush(playerCards, communityCards);
                    handType = 9;
                    break;
                case 1:
                    hand = isStraightFlush(playerCards, communityCards);
                    handType = 8;
                    break;
                case 2:
                    hand = isFourKind(playerCards, communityCards);
                    handType = 7;
                    break;
                case 3:
                    hand = isFullHouse(playerCards, communityCards);
                    handType = 6;
                    break;
                case 4:
                    hand = isFlush(playerCards, communityCards);
                    handType = 5;
                    break;
                case 5:
                    hand = isStraight(playerCards, communityCards);
                    handType = 4;
                    break;
                case 6:
                    hand = isThreeKind(playerCards, communityCards);
                    handType = 3;
                    break;
                case 7:
                    hand = isTwoPair(playerCards, communityCards);
                    handType = 2;
                    break;
                case 8:
                    hand = isPair(playerCards, communityCards);
                    handType = 1;
                    break;
                default:
                    hand = isHighCard(playerCards, communityCards);
                    handType = 0;
            }
            if(hand){
                return [hand, handType];
            }
        }

    }

})();