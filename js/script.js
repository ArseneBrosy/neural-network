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
s_car.src = "./img/car.png";

// other
const MAX_RAY_DIS = 600;
var simulation_time = 2000;

const MUTATION_SIZE = 0.1;
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
        this.rotSpeed = 0;
        this.network = new Network(carLayers);
        this.crashed = false;
        this.fitness = 0;
    }
    reset () {
        this.x = 0;
        this.y = 0;
        this.r = 0;
        this.speed = 0;
        this.rotSpeed = 0;
        this.crashed = false;
        this.fitness = 0;
    }
    shootRays () {
        for (var r = 0; r < 9; r ++) {
            var rayX = this.x;
            var rayY = this.y;
            var rayR = (r*10-45+this.r)%360;
            var distance = 0;
            while (isOnRoad(rayX, rayY) && distance < MAX_RAY_DIS) {
                rayX += Math.cos(rayR * (Math.PI/180)) * 1;
                rayY += Math.sin(rayR * (Math.PI/180)) * 1;
                distance++;
            }
            if (distance <= 75) {
                this.crashed = true;
            }
            this.network.layers[0][r] = distance / 100;
        }
    }
    drawRays () {
        for (var r = 0; r < 9; r ++) {
            ctx.fillStyle = "yellow";
            var rayX = this.x;
            var rayY = this.y;
            var rayR = (r*10-45+this.r)%360;
            var distance = 0;
            while (isOnRoad(rayX, rayY) && distance < MAX_RAY_DIS) {
                rayX += Math.cos(rayR * (Math.PI/180)) * 1;
                rayY += Math.sin(rayR * (Math.PI/180)) * 1;
                distance++;
                ctx.fillRect(camX + rayX * camZ / 25, camY + rayY * camZ / 25, camZ / 25, camZ / 25);
            }
            ctx.fillStyle = "red";
            ctx.fillRect(camX + rayX * camZ / 25 - camZ / 4, camY + rayY * camZ / 25 - camZ / 4, camZ / 2, camZ / 2);
        }
    }
    move () {
        if (this.crashed) { return;}
        this.shootRays();
        this.network.evaluate();
        this.rotSpeed = Math.min(this.network.layers[this.network.layers.length - 1][0], 10);
        this.speed = Math.min(this.network.layers[this.network.layers.length - 1][1], 35);
        this.x += Math.cos(this.r * (Math.PI/180)) * this.speed;
        this.y += Math.sin(this.r * (Math.PI/180)) * this.speed;
        this.fitness += this.speed - Math.abs(this.rotSpeed);
        this.r += this.rotSpeed;
        this.r %= 360;
    }
    simuate () {
        for (var i = 0; i < simulation_time; i++) {
            this.move();
        }
    }
}

//#region VARIABLES
var camX = 300;
var camY = 600;
var camZ = 25;

// simualtion
var simulationStarted = false;

// souris
var mouseX = 0;
var mouseY = 0;
var mouseLeft = false;
var mouseCamOffsetX = 0;
var mouseCamOffsetY = 0;

var time = 0;
var generation = 0;

// cars
var cars = [];
var carLayers = [];

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

function isOnRoad(x, y) {
    var result = false;
    for (var i = 0; i < road.length - 1; i++) {
        //#region random shit found online DO NO TOUCH
        // https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
        var A = x - road[i][0];
        var B = y - road[i][1];
        var C = road[i+1][0] - road[i][0];
        var D = road[i+1][1] - road[i][1];
        var dot = A * C + B * D;
        var len_sq = C * C + D * D;
        var param = -1;
        if (len_sq != 0) //in case of 0 length line
            param = dot / len_sq;
    
        var xx, yy;
        if (param < 0) {
        xx = road[i][0];
        yy = road[i][1];
        }
        else if (param > 1) {
        xx = road[i+1][0];
        yy = road[i+1][1];
        }
        else {
        xx = road[i][0] + param * C;
        yy = road[i][1] + param * D;
        }
        var dx = x - xx;
        var dy = y - yy; 
        //#endregion
        if (Math.sqrt(dx * dx + dy * dy) <= roadWidth / 2) {
            result = true;
        }
    }
    return result;
}

function Save() {
    localStorage.setItem("neuranet-cars", JSON.stringify(cars));
    localStorage.setItem("neuranet-gen", JSON.stringify(generation));
    localStorage.setItem("neuranet-sim-time", JSON.stringify(simulation_time));
    localStorage.setItem("neuranet-layers", JSON.stringify(layers));
}

function newGen() {
    // kill half
    var sortedCars = cars.sort((c1, c2) => (c1.fitness < c2.fitness) ? 1 : (c1.fitness > c2.fitness) ? -1 : 0);
    sortedCars.splice(sortedCars.length / 2, sortedCars.length / 2);
    cars = sortedCars;
    
    var newCars = [];
    // clone
    for (var i = 0; i < cars.length; i++) {
        //! j'ai littéralement passé 3h30 pour trouver comment cloner un putain d'objet alors
        //! NE TOUCHER CE BLOC SOUS AUCUN PRETEXTE
        var parent = new Car();
        parent.network.links = JSON.parse(JSON.stringify(cars[i].network.links));
        var children = new Car();
        children.network.links = JSON.parse(JSON.stringify(cars[i].network.links));
        children.network.mutate(0.05,0.1,0.05);
        newCars.push(parent);
        newCars.push(children);
    }
    cars = newCars;
    Save();
}

function StartSimualtion(layers, nbCars, simTime) {
    simulation_time = simTime;
    carLayers = layers;
    for (var i = 0; i < nbCars; i++) {
        var ncar = new Car();
        ncar.network.mutate(0.5,0.5,0.5);
        cars.push(ncar);
    }
    document.getElementById("GUI").style.display = "none";
    simulationStarted = true;
    Save();
}

function LoadSimulation() {
    if (localStorage.getItem("neuranet-cars") != null) {
        var saved = generation = JSON.parse(localStorage.getItem("neuranet-cars"));
        carLayers = JSON.parse(localStorage.getItem("neuranet-layers"));
        for (var i = 0; i < saved.length; i++) {
            var ncar = new Car();
            cars.push(ncar);
        }
        for (var i = 0; i < cars.length; i++) {
            cars[i].network.links = JSON.parse(JSON.stringify(saved[i].network.links));
        }
        generation = JSON.parse(localStorage.getItem("neuranet-gen"));
        simulation_time = parseInt(JSON.parse(localStorage.getItem("neuranet-sim-time")));
        document.getElementById("GUI").style.display = "none";
        simulationStarted = true;
        Save();
    } else {
        console.error("no datas");
    }
}

var selectedCar = 0;
var focus = false;
var drawNetwork = false;
var carSelected = true;

function mainLoop() {
    if (simulationStarted) {
        //#region MOVE CAMERA
        if(mouseLeft) {
            camX = mouseX + mouseCamOffsetX;
            camY = mouseY + mouseCamOffsetY;
        }
        if (focus) {
            camX = -cars[selectedCar].x * camZ / 25 + canvas.width / 2;
            camY = -cars[selectedCar].y * camZ / 25 + canvas.height / 2;
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

        // Cars
        ctx.globalAlpha = carSelected ? 0.2 : 1;
        for (var i = 0; i < cars.length; i++) {
            if (i === selectedCar) { ctx.globalAlpha = 1; }
            ctx.translate(camX + cars[i].x * camZ / 25, camY + cars[i].y * camZ / 25);
            ctx.rotate(cars[i].r * (Math.PI/180));
            ctx.drawImage(s_car, -camZ * 4, -camZ * 2, camZ * 8, camZ * 4);
            ctx.rotate(-cars[i].r * (Math.PI/180));
            ctx.translate(-camX - cars[i].x * camZ / 25, -camY - cars[i].y * camZ / 25);
            ctx.globalAlpha = carSelected ? 0.2 : 1;
        }
        ctx.globalAlpha = 1;

        if (carSelected) {
            ctx.fillStyle = "green";
            ctx.fillRect(camX + cars[selectedCar].x * camZ / 25 - camZ, camY + cars[selectedCar].y * camZ / 25 - camZ, camZ * 2, camZ * 2);
            cars[selectedCar].drawRays();
            if (drawNetwork) { cars[selectedCar].network.draw(0,0,15,10); }
        }

        // time
        ctx.font = "50px serif";
        ctx.fillStyle = "black";
        ctx.fillText("time: " + time, 20, canvas.height - 75);
        ctx.fillText("gen: " + generation, 20, canvas.height - 25);
        
        //#endregion
        
        if (time < simulation_time) {
            time ++;
            for (var i = 0; i < cars.length; i++) {
                cars[i].move();
            }
        } else {
            time = 0;
            generation ++;
            newGen();
        }
    }
    requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);

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
document.addEventListener("keydown", (e) => {
    if (e.which === 13) {
        drawNetwork = !drawNetwork;
        document.getElementById("game-GUI").style.display = drawNetwork ? "flex" : "none";
    }
    if (e.which === 17) {
        carSelected = !carSelected;
    }
    if (e.which === 27) {
        focus = false;
    }
    if (e.which === 70) {
        focus = !focus;
    }
    if (e.which === 32) {
        focus = true;
        selectedCar++;
        if (selectedCar >= cars.length) {
            selectedCar = 0; 
        }
    }
});
//#endregion