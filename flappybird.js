"use strict";

var startTime = null, currentTime = null, a = -10, currentScore = 0;
var nearestPipe = document.querySelector("#Pipes > li:first-child");
var bird = document.querySelector("#Bird");
var fps = document.querySelector("#fps");
var audios = {
    Hit: document.querySelector("#Audio > audio.hit"),
    Wing: document.querySelector("#Audio > audio.wing"),
    Swooshing: document.querySelector("#Audio > audio.swooshing"),
    Point: document.querySelector("#Audio > audio.point")
};

function gameStart() {
    document.getElementById("EnableTrajectory").disabled = true;
    if (document.getElementById("EnableTrajectory").checked) {
        Array.prototype.forEach.call(document.querySelectorAll("#Trajectory > li"), function(point) {
            var event = function pointEvent() {
                this.style.marginTop = (bird.positionY + 11) + "px";
            };
            point.addEventListener("animationstart", event);
            point.addEventListener("animationiteration", event);
        });
    }
    
    document.removeEventListener("keypress", gameStart);
    document.getElementById("Background").removeEventListener("mousedown", gameStart);
    document.addEventListener("keypress", jump);
    document.getElementById("Background").addEventListener("mousedown", jump);

    document.getElementById("GetReady").addEventListener("transitionend", function() {
        this.setAttribute('hidden', '');
    });
    document.body.classList.remove("ready");

    jump();

    window.requestAnimationFrame(go);
}

function game_over() {
    document.removeEventListener("keypress", jump);
    document.getElementById("Background").removeEventListener("mousedown", jump);

    var highestScore = localStorage.getItem("highest_score");
    setScore(document.querySelector("#GameOver > div.score_board > div.highest-score > div.old"), highestScore);

    if (currentScore > 0) {
        document.querySelector("#GameOver > div.score_board").addEventListener("animationend", function (e) {
            if (!e.target.classList.contains("score_board"))
                return;

            var scoreElement = document.querySelector("#GameOver > div.score_board > div.score:first-child");
            var scoreNum = 1;
            var interval = window.setInterval(function() {
                setScore(scoreElement, scoreNum);
                if (++scoreNum > currentScore) {
                    window.clearInterval(interval);
                    if (currentScore > highestScore) {
                        localStorage.setItem("highest_score", String(currentScore));
                        window.setTimeout(function () {
                            setScore(document.querySelector("#GameOver > div.score_board > div.highest-score > div.new"), currentScore);
                            document.querySelector("#GameOver > div.score_board > div.is-highest-score").classList.add("show");
                        }, 50);
                    }
                }
            }, 25);
        });
    }

    document.body.classList.add("end");
    bird.style.transform = bird.style.top = null;

    window.setTimeout(function () {
        audios.Swooshing.play();
        window.setTimeout(function () {
            audios.Swooshing.currentTime = 0;
            audios.Swooshing.play();
        }, 500);
    }, 500);
}

function jump() {
    bird.speedY = 30;
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
    var i = 4, chars = element.children;
    while (i --> 0) {
        var num = score % 10;
        chars[i].dataset.number = num;
        score = Math.floor(score / 10);
        if (score === 0) break;
    }
    while (i --> 0) {
        chars[i].removeAttribute('data-number');
    }
}

function moveBird(timestamp) {
    var t = (timestamp - currentTime) / 100;
    fps.textContent = (10 / t).toFixed(3) + " FPS";
    bird.positionY -= bird.speedY * t + a * t * t / 2;
    if (bird.positionY < 0) {
        bird.positionY = 0;
    } else if (bird.positionY > 464) {
        bird.style.transform = "translateY(464px) rotate(" + (-bird.speedY) + "deg)";
        audios.Hit.play();
        return true;
    }
    bird.speedY += a * t;
    if (bird.speedY < -40) {
        bird.speedY = -40;
    }
    bird.style.transform = "translateY(" + bird.positionY + "px) rotate(" + (-bird.speedY) + "deg)";
}

function judge() {
    //        |    |
    //        |    |
    //        ------
    //          X
    //        ------
    //        |    |
    //        |    |
    //=======================
    var pipeOffsetLeft = parseFloat(getComputedStyle(nearestPipe).transform.substring(19));
    if (pipeOffsetLeft <= bird.offsetLeft + bird.offsetWidth) {
        if (pipeOffsetLeft + nearestPipe.scrollWidth >= bird.offsetLeft) {
            var emptySpace = nearestPipe.firstElementChild;
            var pipeTop = nearestPipe.offsetTop;
            if (bird.positionY < emptySpace.offsetTop + pipeTop || bird.positionY + bird.offsetHeight > emptySpace.offsetTop + emptySpace.offsetHeight + pipeTop) {
                audios.Hit.play();
                return true;
            }
        } else {
            setScore(document.getElementById("Score"), ++currentScore);
            audios.Point.currentTime = 0;
            audios.Point.play();
            nearestPipe = nearestPipe.nextElementSibling || document.querySelector("#Pipes :first-child");
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
    document.addEventListener("keypress", gameStart);
    document.getElementById("Background").addEventListener("mousedown", gameStart);

    document.querySelector("#GameOver a.play").addEventListener("click", function () {
        window.location.reload();
    });

    Array.prototype.forEach.call(document.querySelectorAll("#Pipes > li"), function(pipe) {
        pipe.style.marginTop = (-Math.random() * 250 - 100) + "px";
        var event = function pipeEvent() {
            this.style.marginTop = (-Math.random() * 350 - 50) + "px";
        };
        pipe.addEventListener("animationiteration", event);
    });

    bird.speedY = 0;
    bird.positionY = parseFloat(getComputedStyle(bird).transform.substring(22));
})();