"use strict";

var startTime = null, time = null, speedY = 0, posY = 200, a = -10, oldScore = 0;
var bird = document.querySelector("#Bird"), birdStyle = bird.style;
var Hit = document.querySelector("#Audio > audio.hit"),
    Wing = document.querySelector("#Audio > audio.wing"),
    Swooshing = document.querySelector("#Audio > audio.swooshing"),
    Point = document.querySelector("#Audio > audio.point");

function game_start() {
    document.removeEventListener("keypress", game_start);
    document.getElementById("Background").removeEventListener("mousedown", game_start);
    document.addEventListener("keypress", jump);
    document.getElementById("Background").addEventListener("mousedown", jump);

    document.querySelector("body").classList.remove("ready");

    jump();

    window.requestAnimationFrame(go);
}

function game_over() {
    var highestScore = localStorage.getItem("highest_score");
    if (oldScore && (!highestScore || oldScore > highestScore)) {
        highestScore = oldScore;
        localStorage.setItem("highest_score", oldScore);
        document.querySelector("#GameOver > div.score_board > div.is-highest-score").style.visibility = "visible";
    } else {
        document.querySelector("#GameOver > div.score_board > div.is-highest-score").style.visibility = "hidden";
    }

    setScore(document.querySelector("#GameOver > div.score_board > div.score:first-child"), oldScore);
    setScore(document.querySelector("#GameOver > div.score_board > div.score:last-child"), highestScore);

    document.querySelector("body").classList.add("end");

    document.removeEventListener("keypress", jump);
    document.getElementById("Background").removeEventListener("mousedown", jump);

    window.setTimeout(function() {
        Swooshing.play();
        window.setTimeout(function() {
            Swooshing.currentTime = 0;
            Swooshing.play();
        }, 500);
    }, 500);
}

function jump() {
    speedY = 40;
    // TODO: IE
    Wing.currentTime = 0;
    Wing.play();
}

function removePipe() {
    var nextPipe = this.nextElementSibling;
    var Pipes = this.parentNode;
    Pipes.removeChild(this);
    Pipes.appendChild(document.createElement("li"));
    nextPipe.classList.add("moving");
    nextPipe.addEventListener("transitionend", removePipe);
}

function setScore(element, score) {
    var i = 1;
    for (; i <= 4; ++i) {
        var num = score % 10;
        element.querySelector("span:nth-last-child(" + i + ")").dataset.number = num;
        score = Math.floor(score / 10);
        if (score === 0) {
            ++i;
            break;
        }
    }
    for (; i <= 4; ++i) {
        delete element.querySelector("span:nth-last-child(" + i + ")").dataset.number;
    }
}

function go(timestamp) {
    if (time === null) {
        startTime = time = timestamp;
        var pipes = document.querySelectorAll("#Pipes > li");
        for (var i = 0; i < pipes.length; ++i) {
            var pipe = pipes.item(i);
            pipe.style.top = (-Math.random() * 350 - 100) + "px";
            pipe.addEventListener("webkitAnimationIteration", function () {
                this.style.top = (-Math.random() * 350 - 50) + "px";
            });
        }
        var points = document.querySelectorAll("#Trajectory > li");
        for (var j = 0; j < points.length; ++j) {
            var point = points.item(j);
            point.addEventListener("webkitAnimationStart", function () {
                this.style.top = (posY + 11) + "px";
            });
            point.addEventListener("webkitAnimationIteration", function () {
                this.style.top = (posY + 11) + "px";
            });
        }
    }
    var t = (timestamp - time) / 100;
    posY -= speedY * t + a * t * t / 2;
    if (posY < 0) {
        posY = 0;
    } else if (posY > 464) {
        bird.style.top = "464px";
        Hit.play();
        game_over();
        return;
    }
    speedY += a * t;
    if (speedY < -40) {
        speedY = -40;
    }
    birdStyle.webkitTransform = birdStyle.transform = "rotate(" + (-speedY) + "deg)";
    birdStyle.top = posY + "px";
    time = timestamp;

    var score = Math.floor(((timestamp - startTime) / 1000 - 4));
    if (score < 0) {
        score = 0;
    } else if (score > 9999) {
        score = 9999;
    }
    if (score !== oldScore) {
        oldScore = score;
        setScore(document.getElementById("Score"), score);
        Point.currentTime = 0;
        Point.play();
    }

    window.requestAnimationFrame(go);
}

(function() {
    document.addEventListener("keypress", game_start);
    document.getElementById("Background").addEventListener("mousedown", game_start);

    document.querySelector("div#GameOver a.play").addEventListener("click", function () {
        window.location.reload();
    });
})();