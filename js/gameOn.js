//Text Interactive Trivia Game Using Twilio API

var Questions = {
        list: [
            {
                q: "According to Greek mythology which Gorgon had snakes for hair and could turn onlookers into stone?",
                ans: {
                    a: "Cyclops",
                    b: "Chimera",
                    c: "Medusa",
                    d: "Scylla"
                },
                correct: "c",
                correctTxt: "Medusa"
    },
            {
                q: "New Orleans is known as the birthplace of what type of music?",
                ans: {
                    a: "Jazz",
                    b: "Southern Rock",
                    c: "Trap",
                    d: "Rococo"
                },
                correct: "a",
                correctTxt: "Jazz"
    },
            {
                q: "Superman is a superhero from what fictional planet?",
                ans: {
                    a: "Plutron",
                    b: "Earth 2",
                    c: "Smallville",
                    d: "Krypton"
                },
                correct: "d",
                correctTxt: "Krypton"
    }
],
        currentAnswer: "",
        currentAnswerTxt: "",
        addNew: function () {
            //adds question to screen
            $qSlot.text(this.list[(round - 1)].q);
            $aList.empty();
            var ans = this.list[(round - 1)].ans;
            //build answer list 
            $.each(ans, function (i, val) {
                console.log(i + "" + val);
                $aList.append('<li>' + val + '</li>');
            });
            //update answer variable
            this.currentAnswer = this.list[(round - 1)].correct;
            this.currentAnswerTxt = this.list[(round - 1)].correctTxt;
            $answerSpot.text(this.currentAnswer);
            $answerSpotTxt.text(". " + this.currentAnswerTxt);

            if (!$startLight.hasClass('greenLight')) {
                $startLight.addClass('greenLight');
            }

            round++
        }
    } 

//GLOBAL VARIABLES
var currentAnswer = "";
var score = 0;
var timeStamp = "";
var $startBtn = $('#startBtn');
var gameMode = false;
var $playerUl = $('#playerUl');
var playerList = [];
var round = 1;
var $qSlot = $('#qSlot');
var $aList = $('#ansUl');
var $timeSlot = $('#counter');
var $playerBtn = $('#playerBtn');
var $playerLight = $('#playerLight');
var $startLight = $('#startLight');
var $showAnswer = $('#showAnswer');
var $answerSpot = $('#answerSpot');
var $answerSpotTxt = $('#answerSpotTxt');
var $timeBox = $('#timeBox');
var $playerTimer = $('#playerTimer');


//PLAYER OBJECT
var Player = {
        vetedPlayer: {},
        list: [],
        add: function (d) {
            //player class
            function MakePlayer(id, nm) {
                this.id = id,
                    this.name = nm,
                    this.answer = '',
                    this.score = 0,
                    this.correct = false,
                    this.champ = false
            }

            if (!this.vetedPlayer.hasOwnProperty(d.from)) {
                var player = new MakePlayer(d.from, d.body);
                this.list.push(player);
                this.vetedPlayer[d.from] = true;
                console.log("Player.list: ");
                console.log(this.list);
                this.show();
            } else {
                console.log('This player is already on the list');
            }
        },

        show: function () {
            //updates the player/score area
            $playerUl.empty();
            //loop through player list to add to page
            for (var i = 0; i < this.list.length; i++) {

                var playerLi = "<li><span class='pName'>" + this.list[i].name + "</span>: <span class='pScore'>" + this.list[i].score + "</span></li>"
                $playerUl.append(playerLi);
            }
        },

        addAnswer: function (m) {
            //adds answer to player object
            console.log('Inside Player.addAnswer');
            console.log(m);

            //vet data and add answer to this.list[i].answer
            for (var i = 0; i < Player.list.length; i++) {
                if (m.from === Player.list[i].id) {
                    console.log('existing id and incoming answer phone number match!');
                    //only get first letter of answer message
                    var textAnswer = m.body;
                    textAnswer = textAnswer.substr(0, 1).toLocaleLowerCase();

                    Player.list[i].answer = textAnswer;
                    console.log('answer added:', Player.list[i].answer);

                    if (textAnswer === Questions.currentAnswer) {
                        Player.list[i].score++;
                        console.log('player score updated: ', Player.list[i].score);
                    }
                }
            }
        }
    }

//PLAYER BUTTON
$playerBtn.click(function () {
    playerTimer();
    gameMode = "addPlayer";
    timeStamp = new Date();

    //checkServer
    var checkInt = setInterval(checkServer, 3000);

    if (!$playerLight.hasClass('greenLight')) {
        $playerLight.addClass('greenLight');
    }

    //checkServer off in 20 sec
    setTimeout(function () {
        clearInterval(checkInt);
        console.log('clearing interval executed');
        $playerLight.removeClass('greenLight');
        gameMode = "addAnswers";
    }, 20000);
});

//START BUTTON
$startBtn.click(function () {
    console.log('player button works');
    $startBtn.removeClass('outline');
    startTimer();
  
    //start game if players are logged
    if (Player.list.length > 0) {

        if (!$startLight.hasClass('greenLight')) {
            $startLight.addClass('greenLight');
        }

        //continue the game cycle
        gameOn();

        function gameOn() {
            if (round > 1 && round <= Questions.list.lenth) {
                startTimer();
            }
            $startBtn.removeClass('outline');
            $showAnswer.addClass('hide');
            $startLight.addClass('greenLight');
            gameMode = "addAnswers";
            timeStamp = new Date();
            Questions.addNew();
          
            //check server
            var checkInt = setInterval(checkServer, 5000);
          
            //checkServer off in 20 sec
            setTimeout(function () {
                clearInterval(checkInt);
                console.log('clearing interval executed');
                $playerLight.removeClass('greenLight');
                //update player score on screen;
                Player.show();
                $showAnswer.removeClass('hide');
                $startLight.removeClass('greenLight');
                // check game cycle
                setTimeout(function () {
                    checkGame();
                }, 10000);
            }, 20000);
        }

        //controls continuation of game
        function checkGame() {
            if (round <= Questions.list.length) {
                startTimer();
                gameOn();
            } else {
                Player.show();
                $startLight.removeClass('greenLight');
                alert('GREAT JOB! GAME OVER');
            }
        }
    } else {
        alert('Add Players Before Starting');
    }
});

//SERVER CALLS

//get UTC Time
function getTodayUTC() {
    var now = new Date();
    var today = now.getUTCFullYear().toString();
    today = today.concat("-");
    if (now.getUTCMonth() < 9) {
        today = today.concat("0");
    }
    today = today.concat((now.getUTCMonth() + 1).toString());
    today = today.concat("-");
    if (now.getUTCDate() < 10) {
        today = today.concat("0");
    }
    today = today.concat(now.getUTCDate());
    return today;
}

//ajax related variables
var ACCOUNT_SID = '########################';
var AUTH_TOKEN = '########################';
var smsInbound = {};

//checks for presence of messages on server
function checkServer() {
    var username = ACCOUNT_SID;
    var password = AUTH_TOKEN;
    var getUrl = "https://api.twilio.com/2010-04-01/Accounts/" + ACCOUNT_SID + "/Messages.json?DateSent=" + getTodayUTC();

    $.ajax({
        type: "GET",
        username: ACCOUNT_SID,
        password: AUTH_TOKEN,
        url: getUrl,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        },

        success: function (data) {
            console.log("checkServer() called ");
            console.log("data from first server check:");
            console.log(data);

            for (var i = 0; i < data.messages.length; i++) {
                var message = data.messages[i];
                if (message.direction === "inbound" && message.status === "received") {
                    //turn date sent into a date obj for comparison
                    var mDate = new Date(message.date_sent);
                    //Sorts for messages from today and hasn't been reviewed
                    //timeStamp from button press
                    console.log('smsInbound from checkServer(): ');
                    console.log(smsInbound);
                    if (mDate > timeStamp && !smsInbound.hasOwnProperty(message.sid)) {
                        console.log('incoming message after timestamp');
                        smsInbound[message.sid] = false;
                        getMessage(message.sid);
                    } else {
                        console.log('no messages within time limit');
                    }
                }
            }

        },

        error: function (data) {
            console.log(data);
        }
    });
}

//gets messages that meet time requirement
function getMessage(sid) {
    console.log('getMessage fired');

    var sidWas = sid;
    var username = ACCOUNT_SID;
    var password = AUTH_TOKEN;
    var getUrl = "https://api.twilio.com/2010-04-01/Accounts/" + ACCOUNT_SID + "/Messages/" + sid + ".json";

    $.ajax({
        type: "GET",
        username: ACCOUNT_SID,
        password: AUTH_TOKEN,
        url: getUrl,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        },

        success: function (data) {
          
            //logs message has been recieived
            smsInbound[sidWas] = true;
            console.log('smsInbound from getMessage(): ');
            console.log(smsInbound);
          
            //if in recieving answer mode, add message to player answers
            if (gameMode === "addAnswers") {
                console.log("addAnswer mode");
                Player.addAnswer(data);
            }
          
            //if in recieving players mode, add player to list
            if (gameMode === "addPlayer") {
                console.log("data is being sorted for new players");
                Player.add(data);
            }
        },

        error: function (data) {
            console.log(data);
        }
    });
}

//TIMERS

//adding players timer
function playerTimer() {
    console.log('Player Timer!');
    var count = 20;
    $playerTimer.text(count);
    var counter = setInterval(timer, 1000); //1000 will  run it every 1 second

    function timer() {
        count = count - 1;
        if (count <= -1) {
            clearInterval(counter);
            $playerTimer.text(' ');
            if (Player.list.length > 0) {
                $startBtn.addClass('outline');
            }
            return;
        }
        $playerTimer.text(count);
    }
}

//adding question timer
function startTimer() {
    console.log('start Timer!');
    var count = 20;
    $timeBox.text(count);
    var counter = setInterval(timer, 1000); //1000 will  run it every 1 second

    function timer() {
        count = count - 1;
        if (count <= -1) {
            clearInterval(counter);
            $timeBox.text(' ');
            if (Player.list.length >= 0 && round <= 1) {
                $startBtn.addClass('outline');
            }
            return;
        }
        $timeBox.text(count);
    }
}