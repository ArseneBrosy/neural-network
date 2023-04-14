var canvas = document.getElementById("renderer");
var ctx = canvas.getContext("2d");

//#region CONSTANTES
// couleures
const c_background = "#8397FF";
const c_neurons = "#bbbbbb";
const c_links = "black";
const c_text = "black";
const c_network_background = "white";
const c_road = "#333333";

// sprites
const s_car = new Image();
s_car.src = "../img/car.png";
//#endregion

class Network {
    constructor(layerSizes) {
        this.layers = [];
        this.links = [];
        for (var i = 0; i < layerSizes.length; i++) {
            var newLayer = [];
            for (var j = 0; j < layerSizes[i]; j++) {
                newLayer.push(0);
            }
            this.layers.push(newLayer);
        }
        for (var x = 0; x < this.layers.length - 1; x++) {
            for (var y = 0; y < this.layers[x].length; y++) {
                for (var z = 0; z < this.layers[x + 1].length; z++) {
                    //startLayer, startNeuron, endNeuron, before-adder, multiplier, afterAdder
                    this.links.push([x, y, z, 0, 0, 0]);
                }
            }
        }
    }
    evaluate() {
        // reinit
        for (var x = 1; x < this.layers.length; x++) {
            for (var y = 0; y < this.layers[x].length; y++) {
                this.layers[x][y] = 0;
            }
        }
        for (var i = 0; i < this.links.length; i++) {this
            this.layers[this.links[i][0] + 1][this.links[i][2]] += (this.layers[this.links[i][0]][this.links[i][1]] + this.links[i][3]) * this.links[i][4] + this.links[i][5];
        }
    }
    mutate(fAddMargin, mulMargin, aAddMargin) {
        for (var i = 0; i < this.links.length; i++) {
            this.links[i][3] += Math.random() * fAddMargin * 2 - fAddMargin;
            this.links[i][4] += Math.random() * mulMargin * 2 - mulMargin;
            this.links[i][5] += Math.random() * aAddMargin * 2 - aAddMargin;
        }
    }
    draw(posX, posY, size, margin) {
        // calc things
        var maxSize = 0;
        for (var x = 0; x < this.layers.length; x++) {
            if (this.layers[x].length > maxSize) { maxSize = this.layers[x].length; }
        }
        var ySpacing = size * 2.5;
        var xSpacing = size * 5;
        // background
        ctx.fillStyle = c_network_background;
        ctx.fillRect(posX, posY, (this.layers.length - 1) * xSpacing + size * 2 + margin * 2, (maxSize - 1) * ySpacing + size * 2 + margin * 2);
        // modifiy posX and posY
        posX += size + margin;
        posY += maxSize * ySpacing / 2 + size + margin;
        // links
        ctx.strokeStyle = c_links;
        ctx.lineWidth = size / 15;
        for (var i = 0; i < this.links.length; i++) {
            ctx.beginPath();
            ctx.moveTo(posX + this.links[i][0] * xSpacing, posY + this.links[i][1] * ySpacing - this.layers[this.links[i][0]].length * ySpacing / 2);
            ctx.lineTo(posX + (this.links[i][0] + 1) * xSpacing, posY + this.links[i][2] * ySpacing - this.layers[this.links[i][0] + 1].length * ySpacing / 2);
            ctx.stroke();
        }
        // neurons
        ctx.font = size + "px serif";
        for (var x = 0; x < this.layers.length; x++) {
            for (var y = 0; y < this.layers[x].length; y++) {
                ctx.fillStyle = c_neurons;
                ctx.beginPath();
                ctx.arc(posX + x * xSpacing, posY + y * ySpacing - this.layers[x].length * ySpacing / 2, size, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = c_text;
                ctx.fillText(parseInt(this.layers[x][y] * 10) / 10, posX + x * xSpacing - size / 2, posY + y * ySpacing - this.layers[x].length * ySpacing / 2 + size / 4);
            }
        }
    }
}

class Car {
    constructor () {
        this.x = 0;
        this.y = 0;
        this.r = 0;
        this.speed = 0;
    }
}

//#region VARIABLES
var camX = 150;
var camY = 100;
var camZ = 3;

// souris
var mouseX = 0;
var mouseY = 0;
var mouseLeft = false;
var mouseCamOffsetX = 0;
var mouseCamOffsetY = 0;

// car
var car = new Car();

// network
var network = new Network([4,5,5,1]);

// road
var roadWidth = 300;
var road = [
    [0, 0],
    [4000, 0],
    [4750, -300],
    [5000, -200],
    [5200, 400],
    [5050, 600],
    [1500, 600],
    [1400, 650],
    [1300, 750],
    [1300, 900],
    [1350, 1000],
    [2600, 1900],
    [2800, 2000],
    [3000, 2000],
    [3200, 1900],
    [3900, 1350],
    [4100, 1300],
    [5000, 1300],
    [5500, 1500],
    [5750, 2100],
    [5500, 2700],
    [5000, 3000],
    [-300, 3000],
    [-500, 2900],
    [-600, 2700],
    [-500, 2500],
    [-300, 2400],
    [300, 2400],
    [700, 2150],
    [800, 1800],
    [700, 1600],
    [-100, 1150],
    [-200, 1000],
    [-200, 400],
    [-150, 100],
    [-100, 50],
    [0, 0],
];
//#endregion

function loop() {
    //#region MOVE CAMERA
    if(mouseLeft) {
        camX = mouseX + mouseCamOffsetX;
        camY = mouseY + mouseCamOffsetY;
    }
    //#endregion

    //#region AFFICHAGE
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Background
    ctx.fillStyle = c_background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // road
    ctx.strokeStyle = c_road;
    ctx.lineWidth = roadWidth * camZ / 25;
    ctx.beginPath();
    ctx.moveTo(camX + road[0][0] * camZ / 25, camY + road[0][1] * camZ / 25);
    for (var i = 1; i < road.length; i++) {
        ctx.lineTo(camX + road[i][0] * camZ / 25, camY + road[i][1] * camZ / 25);
    }
    ctx.closePath();
    ctx.stroke();

    // Player
    car.x += Math.cos(car.r * (Math.PI/180)) * car.speed;
    car.y += Math.sin(car.r * (Math.PI/180)) * car.speed;
    ctx.translate(camX + car.x * camZ / 25, camY + car.y * camZ / 25);
    ctx.rotate(car.r * (Math.PI/180));
    ctx.drawImage(s_car, -camZ * 4, -camZ * 2, camZ * 8, camZ * 4);
    ctx.rotate(-car.r * (Math.PI/180));
    ctx.translate(-camX - car.x * camZ / 25, -camY - car.y * camZ / 25);
    //#endregion
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

//#region INPUTS
document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});
document.addEventListener("mousedown", (e) => {
    if (e.which === 1) {
        mouseLeft = true;
        mouseCamOffsetX = camX - mouseX;
        mouseCamOffsetY = camY - mouseY;
    }
});
document.addEventListener("mouseup", (e) => {
    if (e.which === 1) {
        mouseLeft = false;
    }
});
document.addEventListener("wheel", (e) => {
    camZ -= e.deltaY * 0.01;
    if (camZ < 1) { camZ = 1; }
});
//#endregion