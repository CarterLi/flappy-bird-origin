"use strict";

var startTime = null, currentTime = null, a = -10, currentScore = 0;
var nearestPipe = document.querySelector("#Pipes > li:first-child");
var bird = document.querySelector("#Bird");
var audios = {
    Hit: document.querySelector("#Audio > audio.hit"),
    Wing: document.querySelector("#Audio > audio.wing"),
    Swooshing: document.querySelector("#Audio > audio.swooshing"),
    Point: document.querySelector("#Audio > audio.point")
};

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
    document.removeEventListener("keypress", jump);
    document.getElementById("Background").removeEventListener("mousedown", jump);

    var highestScore = localStorage.getItem("highest_score");
    setScore(document.querySelector("#GameOver > div.score_board > div.highest-score > div.old"), highestScore);

    if (currentScore > 0) {
        document.querySelector("#GameOver > div.score_board").addEventListener("transitionend", function (e) {
            if (!e.target.classList.contains("score_board"))
                return;

            var scoreElement = document.querySelector("#GameOver > div.score_board > div.score:first-child");
            var scoreNum = 1;
            var interval = window.setInterval(function() {
                setScore(scoreElement, scoreNum);
                if (++scoreNum > currentScore) {
                    window.clearInterval(interval);
                    if (currentScore > highestScore) {
                        localStorage.setItem("highest_score", currentScore);
                        window.setTimeout(function () {
                            setScore(document.querySelector("#GameOver > div.score_board > div.highest-score > div.new"), currentScore);
                            document.querySelector("#GameOver > div.score_board > div.is-highest-score").classList.add("show");
                        }, 50);
                    }
                }
            }, 25);
        });
    }

    document.querySelector("body").classList.add("end");

    window.setTimeout(function () {
        audios.Swooshing.play();
        window.setTimeout(function () {
            audios.Swooshing.currentTime = 0;
            audios.Swooshing.play();
        }, 500);
    }, 500);
}

function jump() {
    bird.speedY = 40;
    audios.Wing.currentTime = 0;
    audios.Wing.play();
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

function moveBird(timestamp) {
    var t = (timestamp - currentTime) / 100;
    var posY = bird.offsetTop - bird.speedY * t + a * t * t / 2;
    if (posY < 0) {
        posY = 0;
    } else if (posY > 464) {
        bird.style.top = "464px";
        audios.Hit.play();
        return true;
    }
    bird.speedY += a * t;
    if (bird.speedY < -40) {
        bird.speedY = -40;
    }
    bird.style.webkitTransform = bird.style.transform = "rotate(" + (-bird.speedY) + "deg)";
    bird.style.top = posY + "px";
}

function judge() {
    if (nearestPipe.offsetLeft <= bird.offsetLeft) {
        if (nearestPipe.offsetLeft + nearestPipe.offsetWidth >= bird.offsetLeft) {
            var emptySpace = nearestPipe.firstElementChild;
            var pipeTop = nearestPipe.offsetTop;
            if (bird.offsetTop < emptySpace.offsetTop + pipeTop || bird.offsetTop > emptySpace.offsetTop + emptySpace.offsetHeight + pipeTop) {
                audios.Hit.play();
                return true;
            }
        } else {
            setScore(document.getElementById("Score"), ++currentScore);
            audios.Point.currentTime = 0;
            audios.Point.play();
            nearestPipe = nearestPipe.nextElementSibling || document.querySelector("#Pipes > li:first-child");
        }
    }
}

function go(timestamp) {
    if (currentTime === null) {
        startTime = currentTime = timestamp;
    }

    if (moveBird(timestamp) || judge()) {
        game_over();
        return;
    }

    currentTime = timestamp;

    window.requestAnimationFrame(go);
}

(function() {
    document.addEventListener("keypress", game_start);
    document.getElementById("Background").addEventListener("mousedown", game_start);

    document.querySelector("div#GameOver a.play").addEventListener("click", function () {
        window.location.reload();
    });

    var event;
    var pipes = document.querySelectorAll("#Pipes > li");
    for (var i = 0; i < pipes.length; ++i) {
        var pipe = pipes.item(i);
        pipe.style.top = (-Math.random() * 350 - 100) + "px";
        event = function () {
            this.style.top = (-Math.random() * 350 - 50) + "px";
        };
        pipe.addEventListener("webkitAnimationIteration", event);
        pipe.addEventListener("animationiteration", event);
    }
    var points = document.querySelectorAll("#Trajectory > li");
    for (var j = 0; j < points.length; ++j) {
        var point = points.item(j);
        event = function () {
            this.style.top = (bird.offsetTop + 11) + "px";
        };
        point.addEventListener("webkitAnimationStart", event);
        point.addEventListener("webkitAnimationIteration", event);
        point.addEventListener("animationstart", event);
        point.addEventListener("animationiteration", event);
    }

    bird.speedY = 0;
})();