const circle = "#FFFDD0";
const highlightedCircle = "lightblue";
const circleText = "black";
const highlightCircleText = "white";
const radius = 20;
const width = 1000;
const height = 1000;
const xOffset = 100; // Horizontal spacing between nodes
const yOffset = 100; // Vertical spacing between levels;

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

// Function to get input value
function getInputValue() {
    const input = document.getElementById('inputValue').value;
    document.getElementById('inputValue').value = ''; // Clear input after reading
    return parseInt(input);
}

function calculateOffset(depth) {
    return width / Math.pow(2, depth + 1); // Adjust spacing dynamically and calculates the number of potential nodes at the next level
}

// Insert a node into the BST with dynamic spacing
function insertNodeHelper(node, value, depth) {
    let offset = calculateOffset(depth); 

    if (node === null) {
        return new Node(value, width / 2, 30 + depth * yOffset);
    }

    if (value < node.value) {
        if (node.left === null) {
            node.left = new Node(value, node.x - offset, node.y + yOffset);
        } else {
            insertNodeHelper(node.left, value, depth + 1);
        }
    } else if (value > node.value) {
        if (node.right === null) {
            node.right = new Node(value, node.x + offset, node.y + yOffset);
        } else {
            insertNodeHelper(node.right, value, depth + 1);
        }
    }
    return node;
}

function updateNodePositions(node, depth, x, xOffset) {
    if (node) {
        node.x = x;
        node.y = 30 + depth * yOffset;

        // Recursively update positions of left and right children
        updateNodePositions(node.left, depth + 1, x - xOffset / 2, xOffset / 2);
        updateNodePositions(node.right, depth + 1, x + xOffset / 2, xOffset / 2);
    }
}

function updateVisualization() {
    svg.selectAll("*").remove(); // Clear previous drawing

    if (root) {
        updateNodePositions(root, 0, width / 2, width / 4); // Recalculate positions
    }

    function drawNode(node) {
        if (node) {
            // Draw lines first to maintain layer order
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

            // Draw node circle
            svg.append("circle")
                .attr("cx", node.x)
                .attr("cy", node.y)
                .attr("r", radius)
                .attr("fill", circle)
                .attr("stroke", "black");

            // Draw node value
            svg.append("text")
                .attr("x", node.x)
                .attr("y", node.y)
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .style("fill", circleText)
                .style("font-family", "sans-serif")
                .style("font-size", "1em")
                .text(node.value);
        }
    }

    drawNode(root);
}

// Insert node 
function insertNode() {
    const value = getInputValue();
    if (isNaN(value)) {
        alert("Please enter a valid number");
        return;
    }
    if (root === null) {
        root = new Node(value, width / 2, 30);
    } else {
        insertNodeHelper(root, value, 1);
    }
    updateVisualization();
}

// Clear the tree
function clearTree() {
    root = null;
    updateVisualization();
}

// Find the inorder successor
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

// Helper function to find a node by value
function findNode(node, value) {
    if (node === null) return null;
    if (node.value === value) return node;
    const left = findNode(node.left, value);
    if (left) return left;
    return findNode(node.right, value);
}

// Helper function to flicker a node
function flickerNode(node, callback) {
    d3.select(`circle[cx='${node.x}'][cy='${node.y}']`)
        .transition()
        .duration(300)
        .attr("fill", "#90EE90") // Light green
        .transition()
        .duration(300)
        .attr("fill", circle) // Revert to original color
        .on("end", callback);
}

// Delete node from user input with flickering effect
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

    // Find the node to delete
    const nodeToDelete = findNode(root, value);
    if (!nodeToDelete) {
        alert("Node not found");
        return;
    }

    // Flicker the node before deletion
    flickerNode(nodeToDelete, () => {
        root = deleteNodeHelper(root, value); // Perform deletion after flicker
        updateVisualization(); // Update visualization after deletion
    });
}

// Search node function with flickering effect
function searchNode() {
    const value = getInputValue();
    if (isNaN(value)) {
        alert("Please enter a valid number to search");
        return;
    }
    if (root === null) {
        alert("Tree is empty, nothing to search");
        return;
    }

    // Find the node to search
    const nodeToSearch = findNode(root, value);
    if (nodeToSearch) {
        // Flicker the found node
        flickerNode(nodeToSearch, () => {
            alert(`Node ${value} found!`);
        });
    } else {
        alert(`Node ${value} not found!`);
    }
}

function animateTraversal(nodes) {
    let index = 0;

    function highlightNext() {
        if (index < nodes.length) {
            let node = nodes[index];

            // Flickering effect
            d3.select(`circle[cx='${node.x}'][cy='${node.y}']`)
                .transition()
                .duration(300)
                .attr("fill", "#90EE90") // Light green
                .transition()
                .duration(300)
                .attr("fill", circle) // Revert to original color

            index++;
            setTimeout(highlightNext, 600); // Delay for next node
        } else {
            alert("Traversal Order: " + nodes.map(n => n.value).join(" → "));
        }
    }

    highlightNext();
}

// In-order Traversal (Left, Root, Right)
function inOrderTraversalHelper(node, nodes) {
    if (node) {
        inOrderTraversalHelper(node.left, nodes);
        nodes.push(node);
        inOrderTraversalHelper(node.right, nodes);
    }
}

function inOrderTraversal() {
    let nodes = [];
    inOrderTraversalHelper(root, nodes);
    animateTraversal(nodes);
}

// Pre-order Traversal (Root, Left, Right)
function preOrderTraversalHelper(node, nodes) {
    if (node) {
        nodes.push(node);
        preOrderTraversalHelper(node.left, nodes);
        preOrderTraversalHelper(node.right, nodes);
    }
}

function preOrderTraversal() {
    let nodes = [];
    preOrderTraversalHelper(root, nodes);
    animateTraversal(nodes);
}

// Post-order Traversal (Left, Right, Root)
function postOrderTraversalHelper(node, nodes) {
    if (node) {
        postOrderTraversalHelper(node.left, nodes);
        postOrderTraversalHelper(node.right, nodes);
        nodes.push(node);
    }
}

function postOrderTraversal() {
    let nodes = [];
    postOrderTraversalHelper(root, nodes);
    animateTraversal(nodes);
}

// Level-order Traversal (BFS)
function levelOrderTraversal() {
    let queue = [root];
    let nodes = [];

    while (queue.length > 0) {
        let node = queue.shift();
        nodes.push(node);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }

    animateTraversal(nodes);
}

// Initialize with a tree of multiple nodes
function initializeTree() {
    const initialValues = [40, 20, 60, 10, 30, 50];
    root = new Node(initialValues[0], width / 2, 30); // Start with 40 at center
    for (let i = 1; i < initialValues.length; i++) {
        insertNodeHelper(root, initialValues[i], 1);
    }
}

// Initialize the tree
initializeTree();
updateVisualization();