var canvas = document.getElementById("renderer");
var ctx = canvas.getContext("2d");

//#region CONSTANTES
// couleures
const c_background = "#8397FF";
const c_neurons = "#bbbbbb";
const c_links = "black";
const c_text = "black";
const c_network_background = "white";
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
    mutate(fAddMargin, mulMargin, aAddMargin) {
        for (var i = 0; i < this.links.length; i++) {
            this.links[i][3] += Math.random() * fAddMargin * 2 - fAddMargin;
            this.links[i][4] += Math.random() * mulMargin * 2 - mulMargin;
            this.links[i][5] += Math.random() * aAddMargin * 2 - aAddMargin;
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
    draw(posX, posY, radius, margin) {
        // calc height
        var maxSize = 0;
        for (var x = 0; x < this.layers.length; x++) {
            if (this.layers[x].length > maxSize) { maxSize = this.layers[x].length; }
        }
        // background
        ctx.fillStyle = c_network_background;
        ctx.fillRect(posX, posY, (this.layers.length - 1) * xSpacing + radius * 2 + margin * 2, (maxSize - 1) * ySpacing + radius * 2 + margin * 2);
        // modifiy posX and posY
        posX += radius + margin;
        posY += maxSize * ySpacing / 2 + radius + margin;
        // links
        ctx.strokeStyle = c_links;
        ctx.lineWidth = 1;
        for (var i = 0; i < this.links.length; i++) {
            ctx.beginPath();
            ctx.moveTo(posX + this.links[i][0] * xSpacing, posY + this.links[i][1] * ySpacing - this.layers[this.links[i][0]].length * ySpacing / 2);
            ctx.lineTo(posX + (this.links[i][0] + 1) * xSpacing, posY + this.links[i][2] * ySpacing - this.layers[this.links[i][0] + 1].length * ySpacing / 2);
            ctx.stroke();
        }
        // neurons
        ctx.font = radius + "px serif";
        for (var x = 0; x < this.layers.length; x++) {
            for (var y = 0; y < this.layers[x].length; y++) {
                ctx.fillStyle = c_neurons;
                ctx.beginPath();
                ctx.arc(posX + x * xSpacing, posY + y * ySpacing - this.layers[x].length * ySpacing / 2, radius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = c_text;
                ctx.fillText(parseInt(this.layers[x][y] * 10) / 10, posX + x * xSpacing - radius / 2, posY + y * ySpacing - this.layers[x].length * ySpacing / 2 + radius / 4);
            }
        }
    }
}

//#region VARIABLES
var camX = 100;
var camY = 400;

// souris
var mouseX = 0;
var mouseY = 0;
var mouseLeft = false;
var mouseCamOffsetX = 0;
var mouseCamOffsetY = 0;

var ySpacing = 60;
var xSpacing = 120;

// network
var network = new Network([4,5,5,1]);
//#endregion

function loop() {
    if(mouseLeft) {
        camX = mouseX + mouseCamOffsetX;
        camY = mouseY + mouseCamOffsetY;
    }

    //#region MOVE CREATURE
    
    //#endregion

    //#region AFFICHAGE
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //#region FOND
    ctx.fillStyle = c_background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //#endregion

    ctx.fillStyle = "red"
    ctx.fillRect(camX, camY, 50, 50);

    //#region NETWORK
    network.draw(0, 0, 20, 10);
    //#endregion
    //#endregion
    network.evaluate();
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

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