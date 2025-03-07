const circle = "#FFFDD0";
const highlightedCircle = "lightblue";
const circleText = "black";
const highlightCircleText = "white";
const radius = 20;
const width = 800;
const height = 600;
const xOffset = 100; // Horizontal spacing between nodes
const yOffset = 100; // Vertical spacing between levels

// Create SVG container
const svg = d3.select("#treeContainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

let root = null;


class Node {
    constructor(value, x, y) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.left = null;
        this.right = null;
        this.fill = circle;
        this.highlighted = false;
    }
}

// function to get input value
function getInputValue() {
    const input = document.getElementById('inputValue').value;
    document.getElementById('inputValue').value = ''; // Clear input after reading
    return parseInt(input);
}

// Insert a node into the BST
function insertNodeHelper(node, value, parentX, parentY) {
    if (node === null) {
        return new Node(value, parentX, parentY); // New node at parent's position initially
    }
    if (value < node.value) {
        if (node.left === null) {
            node.left = new Node(value, node.x - xOffset, node.y + yOffset);
        } else {
            insertNodeHelper(node.left, value, node.x - xOffset, node.y + yOffset);
        }
    } else if (value > node.value) {
        if (node.right === null) {
            node.right = new Node(value, node.x + xOffset, node.y + yOffset);
        } else {
            insertNodeHelper(node.right, value, node.x + xOffset, node.y + yOffset);
        }
    }
    return node;
}

// Update the visualization
function updateVisualization() {
    svg.selectAll("*").remove(); // Clear existing elements

    function drawNode(node) {
        if (node) {
            // Draw circle
            svg.append("circle")
                .attr("cx", node.x)
                .attr("cy", node.y)
                .attr("r", radius)
                .attr("fill", node.fill)
                .attr("stroke", "black");

            // Draw text
            svg.append("text")
                .attr("x", node.x)
                .attr("y", node.y)
                .attr("dy", ".35em") // Vertical alignment
                .attr("text-anchor", "middle") // Center text horizontally
                .style("fill", circleText)
                .style("font-family", "sans-serif")
                .style("font-size", "1em")
                .text(node.value);

            // Draw lines to children
            if (node.left) {
                svg.append("line")
                    .attr("x1", node.x)
                    .attr("y1", node.y)
                    .attr("x2", node.left.x)
                    .attr("y2", node.left.y)
                    .attr("stroke", "black");
                drawNode(node.left);
            }
            if (node.right) {
                svg.append("line")
                    .attr("x1", node.x)
                    .attr("y1", node.y)
                    .attr("x2", node.right.x)
                    .attr("y2", node.right.y)
                    .attr("stroke", "black");
                drawNode(node.right);
            }
        }
    }

    drawNode(root);
}

// Insert node from user input when Insert button is clicked
function insertNode() {
    const value = getInputValue();
    if (isNaN(value)) {
        alert("Please enter a valid number");
        return;
    }
    if (root === null) {
        root = new Node(value, width / 2, height / 2); // Initial node at center
    } else {
        insertNodeHelper(root, value, width / 2, height / 2); // Use center as reference for new nodes
    }
    updateVisualization();
}

// Clear the tree
function clearTree() {
    root = null;
    updateVisualization();
}

// Placeholder functions for other operations
function deleteNode() {
    alert("Delete functionality will be added in the next step.");
}

function inOrderTraversal() {
    alert("Traversal functionality will be added in the next step.");
}

function preOrderTraversal() {
    alert("Traversal functionality will be added in the next step.");
}

function postOrderTraversal() {
    alert("Traversal functionality will be added in the next step.");
}

function levelOrderTraversal() {
    alert("Traversal functionality will be added in the next step.");
}

// Initialize with a single node (24)
root = new Node(24, width / 2, height / 2);
updateVisualization();