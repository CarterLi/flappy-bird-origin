var time = null, speedY = 0, posY = 200, a = -9;
var bird = document.getElementById("Bird"), birdStyle = bird.style;
var Hit = document.getElementById("Hit"), Wing = document.getElementById("Wing"),
    Swooshing = document.getElementById("Swooshing");

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
    document.querySelector("body").classList.add("end");

    document.removeEventListener("keypress", jump);
    document.getElementById("Background").removeEventListener("mousedown", jump);

    Swooshing.play();
    window.setTimeout(function () {
        Swooshing.currentTime = 0;
        Swooshing.play();
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

function go(timestamp) {
    if (time === null) {
        time = timestamp;
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
        if (speedY > 10) {
            speedY = 10;
        }
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
    window.requestAnimationFrame(go);
}

(function() {
    document.addEventListener("keypress", game_start);
    document.getElementById("Background").addEventListener("mousedown", game_start);

    document.querySelector("div#GameOver a.play").addEventListener("click", function () {
        window.location.reload();
    });
})();