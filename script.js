let workspace = document.getElementById("workspace");
let popupNode = document.getElementById("popup-node");
let nodename = document.getElementById("node-name");
let distancePopup = document.getElementById("distance-popup");
let distanceInput = document.getElementById("distance-value");

let mode = "none";
let pendingNodeA = null;
let pendingNodeB = null;
let selectedNode = null;
let startNode = null;
let endNode = null;

const edges = [];

const svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
);

svg.id = "connections";

workspace.prepend(svg);

function connectMode() {

    mode = "connect";

    alert(
        "Connect Mode Aktif\n\nKlik node pertama lalu klik node kedua."
    );
}

function deleteMode() {

    mode = "delete";

    alert(
        "Delete Mode Aktif\n\nKlik node yang ingin dihapus."
    );
}

function findPathMode() {

    mode = "find-path";

    alert(
        "Find Path Mode Aktif\n\nPilih node awal lalu node tujuan."
    );
}


document.addEventListener("dblclick", (e) => {

    if (
        e.target.closest(".circle") ||
        e.target.closest("#popup-node") ||
        e.target.closest("#navbar")
    ) {
        return;
    }

    popupNode.style.left = e.clientX - 120 + "px";
    popupNode.style.top = e.clientY + "px";

    popupNode.classList.remove("hidden");
});

function createNode() {



    const circleX = parseInt(popupNode.style.left) + 50;
    const circleY = parseInt(popupNode.style.top) - 50;

    const name = nodename.value || "Node";

    const node = document.createElement("div");

    node.classList.add("circle");

    node.style.left = circleX + "px";
    node.style.top = circleY + "px";

    node.innerHTML = `<p>${name}</p>`;

    node.addEventListener("click", () => {

        if (mode === "delete") {

            edges.forEach(edge => {

                if (
                    edge.from === node ||
                    edge.to === node
                ) {
                    edge.line.remove();
                    edge.text.remove();
                }

            });

            node.remove();

            return;
        }

        if (mode === "connect") {
            selectNode(node);
            return;
        }

        if (mode === "find-path") {
            selectPathNode(node);
            return;
        }

    });

    workspace.appendChild(node);

    popupNode.classList.add("hidden");
    nodename.value = "";
}

function selectNode(node) {

    if (mode !== "connect") {
        alert("Pilih mode Connect terlebih dahulu!");
        return;
    }


    if (!selectedNode) {
        selectedNode = node;
        node.style.border = "3px solid red";
        return;
    }

    if (selectedNode === node) {
        return;
    }

    pendingNodeA = selectedNode;
    pendingNodeB = node;

    distancePopup.classList.remove("hidden");

    selectedNode.style.border = "1px solid black";
    selectedNode = null;
}


function findShortestPath() {

    const nodes = [
        ...workspace.querySelectorAll(".circle")
    ];

    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set(nodes);

    nodes.forEach(node => {
        distances.set(node, Infinity);
        previous.set(node, null);
    });

    distances.set(startNode, 0);

    while (unvisited.size > 0) {

        let current = null;

        unvisited.forEach(node => {
            if (
                current === null ||
                distances.get(node) < distances.get(current)
            ) {
                current = node;
            }
        });

        if (current === endNode) break;

        unvisited.delete(current);

        edges.forEach(edge => {

            let neighbor = null;

            if (edge.from === current) {
                neighbor = edge.to;
            } else if (edge.to === current) {
                neighbor = edge.from;
            }

            if (
                neighbor &&
                unvisited.has(neighbor)
            ) {

                const alt =
                    distances.get(current) +
                    edge.distance;

                if (
                    alt < distances.get(neighbor)
                ) {
                    distances.set(neighbor, alt);
                    previous.set(neighbor, current);
                }
            }

        });

    }

    const path = [];
    let current = endNode;

    while (current) {
        path.unshift(current);
        current = previous.get(current);
    }

    if (
        path.length === 1 &&
        path[0] !== startNode
    ) {
        alert("Path tidak ditemukan");
        resetPathSelection();
        return;
    }

    highlightPath(path);

    // alert(
    //     `Jarak Terpendek: ${distances.get(endNode)}`
    // );

    resetPathSelection();
}



function highlightPath(path) {

    svg.querySelectorAll("line").forEach(line => {
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", "3");
    });

    for (let i = 0; i < path.length - 1; i++) {

        const nodeA = path[i];
        const nodeB = path[i + 1];

        const edge = edges.find(
            edge =>
                (edge.from === nodeA &&
                    edge.to === nodeB) ||
                (edge.from === nodeB &&
                    edge.to === nodeA)
        );

        if (edge) {
            edge.line.setAttribute(
                "stroke",
                "lime"
            );

            edge.line.setAttribute(
                "stroke-width",
                "6"
            );
        }

    }

}


function resetPathSelection() {

    if (startNode) {
        startNode.style.border =
            "1px solid black";
    }

    if (endNode) {
        endNode.style.border =
            "1px solid black";
    }

    startNode = null;
    endNode = null;
}


function setDistance() {

    const distance = distanceInput.value;

    if (!distance) return;

    createConnection(
        pendingNodeA,
        pendingNodeB,
        distance
    );

    distancePopup.classList.add("hidden");

    distanceInput.value = "";

    pendingNodeA = null;
    pendingNodeB = null;
}

function createConnection(nodeA, nodeB, distance) {

    const x1 = nodeA.offsetLeft + nodeA.offsetWidth / 2;
    const y1 = nodeA.offsetTop + nodeA.offsetHeight / 2;

    const x2 = nodeB.offsetLeft + nodeB.offsetWidth / 2;
    const y2 = nodeB.offsetTop + nodeB.offsetHeight / 2;

    const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );

    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);

    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "3");

    svg.appendChild(line);

    const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
    );

    text.setAttribute("x", (x1 + x2) / 2);
    text.setAttribute("y", (y1 + y2) / 2);

    text.textContent = distance;

    text.setAttribute("font-size", "16");
    text.setAttribute("fill", "red");

    svg.appendChild(text);

    edges.push({
        from: nodeA,
        to: nodeB,
        line: line,
        text: text,
        distance: Number(distance)
    });
}


function clearNodes() {

    workspace.querySelectorAll(".circle").forEach(node => {
        node.remove();
    });

    svg.innerHTML = "";

    selectedNode = null;
}

function selectPathNode(node) {

    if (!startNode) {

        startNode = node;

        node.style.border =
            "3px solid green";

        return;
    }

    if (startNode === node)
        return;

    endNode = node;

    node.style.border =
        "3px solid blue";

    findShortestPath();

}