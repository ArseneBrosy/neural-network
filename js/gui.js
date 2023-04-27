var container = document.getElementById("gui-network-layers");

if (localStorage.getItem("neuranet-cars") === null) {
    document.getElementById("load-sim-button").style.display = "none";
}

var layers = [9, 5, 5, 2];

function AddLayer() {
    if (layers.length >= 7) { return; }
    layers.splice(1,0,5);
    DrawNetwork();
}

function RemoveLayer() {
    if (layers.length <= 2) { return; }
    layers.splice(1,1);
    DrawNetwork();
}

function ModifyLayer(layer, add) {
    if (layers[layer] + add <= 1 || layers[layer] + add >= 10) { return; }
    layers[layer] += add;
    DrawNetwork();
}

function NewSim() {
    StartSimualtion(layers, document.getElementById("gui-nb-cars").value, document.getElementById("gui-sim-time").value);
}

function HomeNew() {
    document.getElementById("home-page").style.display = "none";
    document.getElementById("new-page").style.display = "flex";
}

function DrawNetwork() {
    container.innerHTML = "";
    var elements = "";
    for (var x = 0; x < layers.length; x++) {
        elements += "<div>";
        if (x > 0 && x < layers.length - 1) {
            elements += "<button onclick=\"ModifyLayer(" + x + ", 1)\">+</button>";
        }
        for (var y = 0; y < layers[x]; y++) {
            elements += "<div></div>";
        }
        if (x > 0 && x < layers.length - 1) {
            elements += "<button onclick=\"ModifyLayer(" + x + ", -1)\">-</button>";
        }
        elements += "</div>";
    }
    container.innerHTML = elements;
}
DrawNetwork();