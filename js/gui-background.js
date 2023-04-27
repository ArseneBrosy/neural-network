var canvas = document.getElementById("gui-background");
var ctx = canvas.getContext("2d");

ctx.strokeStyle = "white";

function loop() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    ctx.fillStyle = "red";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    requestAnimationFrame(loop);
}
//requestAnimationFrame(loop);