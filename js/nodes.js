const circle = "#FFFDD0";
const highlightedCircle = "lightblue";
const circleText = "black";
const highlightCircleText = "white";
const radius = 20;
const width = 1000;
const height = 1000;
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
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .style("fill", circleText)
                .style("font-family", "sans-serif")
                .style("font-size", "1em")
                .text(node.value);

            // Draw lines to children, adjusted to connect circumferences 
            if (node.left) {
                // Calculate angle from parent to left child
                const dx = node.left.x - node.x;
                const dy = node.left.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const offsetX = (dx / distance) * radius; // Scale by radius
                const offsetY = (dy / distance) * radius;

                // New line endpoints: from parent's edge to child's edge
                svg.append("line")
                    .attr("x1", node.x + offsetX)      // Start at parent's circumference
                    .attr("y1", node.y + offsetY)
                    .attr("x2", node.left.x - offsetX)  // End at child's circumference
                    .attr("y2", node.left.y - offsetY)
                    .attr("stroke", "black");
                drawNode(node.left);
            }
            if (node.right) {
                // Calculate angle from parent to right child
                const dx = node.right.x - node.x;
                const dy = node.right.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const offsetX = (dx / distance) * radius;
                const offsetY = (dy / distance) * radius;

                // New line endpoints: from parent's edge to child's edge
                svg.append("line")
                    .attr("x1", node.x + offsetX)       // Start at parent's circumference
                    .attr("y1", node.y + offsetY)
                    .attr("x2", node.right.x - offsetX)  // End at child's circumference
                    .attr("y2", node.right.y - offsetY)
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
        root = new Node(value, width / 2, 30); // Initial node at center
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



// Find the inorder successor (smallest node in right subtree)
function findMin(node) {
    let current = node;
    while (current && current.left !== null) {
        current = current.left;
    }
    return current;
}



// Delete a node from the BST
function deleteNodeHelper(node, value) {
    if (node === null) {
        return null;
    }

    if (value < node.value) {
        node.left = deleteNodeHelper(node.left, value);
    } else if (value > node.value) {
        node.right = deleteNodeHelper(node.right, value);
    } else {
        // Case 1: No children
        if (node.left === null && node.right === null) {
            node = null;
            return null;
        }
        // Case 2: One child (left only)
        else if (node.right === null) {
            let temp = node.left;
            node = null;
            return temp;
        }
        // Case 2: One child (right only)
        else if (node.left === null) {
            let temp = node.right;
            node = null;
            return temp;
        }
        // Case 3: Two children 
        else {
            let successor = findMin(node.right);
            node.value = successor.value;
            node.right = deleteNodeHelper(node.right, successor.value);
        }
    }
    return node;
}


// Delete node from user input
function deleteNode() {
    const value = getInputValue();
    if (isNaN(value)) {
        alert("Please enter a valid number to delete");
        return;
    }
    if (root === null) {
        alert("Tree is empty, nothing to delete");
        return;
    }
    root = deleteNodeHelper(root, value);
    updateVisualization();
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
root = new Node(24, width / 2, 30);
updateVisualization();