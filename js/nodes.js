const circle = "#FFFDD0";
const circleText = "black";
const radius = 20;
const width = 1300;
const height = 1000;
const yOffset = 100;

// Create SVG container
const svg = d3
  .select("#treeContainer")
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
    this.parent = null;
    this.fill = circle;
  }
}

function getInputValue() {
  const input = document.getElementById("inputValue").value;
  document.getElementById("inputValue").value = "";
  return parseInt(input);
}

function calculateOffset(depth) {
  return width / Math.pow(2, depth + 1);
}

function insertNodeHelper(node, value, depth) {
  let offset = calculateOffset(depth);
  if (value < node.value) {
    if (node.left === null) {
      node.left = new Node(value, node.x - offset, node.y + yOffset);
      node.left.parent = node;
    } else {
      insertNodeHelper(node.left, value, depth + 1);
    }
  } else if (value > node.value) {
    if (node.right === null) {
      node.right = new Node(value, node.x + offset, node.y + yOffset);
      node.right.parent = node;
    } else {
      insertNodeHelper(node.right, value, depth + 1);
    }
  }
}

function updateNodePositions(node, depth, x, xOffset) {
  if (node) {
    node.x = x;
    node.y = 30 + depth * yOffset;
    updateNodePositions(node.left, depth + 1, x - xOffset / 2, xOffset / 2);
    updateNodePositions(node.right, depth + 1, x + xOffset / 2, xOffset / 2);
  }
}

function updateVisualization() {
  svg.selectAll("*").remove();
  if (root) {
    updateNodePositions(root, 0, width / 2, width / 4);
    drawNode(root);
  }
}

function drawNode(node) {
  if (node) {
    if (node.left) {
      svg
        .append("line")
        .attr("class", `line-${node.value}-${node.left.value}`)
        .attr("x1", node.x)
        .attr("y1", node.y)
        .attr("x2", node.left.x)
        .attr("y2", node.left.y)
        .attr("stroke", "black");
      drawNode(node.left);
    }
    if (node.right) {
      svg
        .append("line")
        .attr("class", `line-${node.value}-${node.right.value}`)
        .attr("x1", node.x)
        .attr("y1", node.y)
        .attr("x2", node.right.x)
        .attr("y2", node.right.y)
        .attr("stroke", "black");
      drawNode(node.right);
    }

    let g = svg
      .append("g")
      .datum(node)
      .attr("class", `node-${node.value}`) // Add class for easier selection
      .attr("transform", `translate(${node.x}, ${node.y})`);

    g.append("circle")
      .attr("r", radius)
      .attr("fill", node.fill)
      .attr("stroke", "black");

    g.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("fill", circleText)
      .style("font-family", "sans-serif")
      .style("font-size", "1em")
      .text(node.value);

    g.call(d3.drag().on("drag", dragged));
  }
}

function dragged(event, d) {
  d.x = event.x;
  d.y = event.y;
  d3.select(this).attr("transform", `translate(${d.x}, ${d.y})`);
  if (d.parent) {
    svg
      .select(`.line-${d.parent.value}-${d.value}`)
      .attr("x2", d.x)
      .attr("y2", d.y);
  }
  if (d.left) {
    svg
      .select(`.line-${d.value}-${d.left.value}`)
      .attr("x1", d.x)
      .attr("y1", d.y);
  }
  if (d.right) {
    svg
      .select(`.line-${d.value}-${d.right.value}`)
      .attr("x1", d.x)
      .attr("y1", d.y);
  }
}

function insertNode() {
  const value = getInputValue();
  if (isNaN(value)) {
    alert("Please enter a valid number");
    return;
  }
  if (findNode(root, value)) {
    alert(`Node ${value} is already present`);
    return;
  }
  if (root === null) {
    root = new Node(value, width / 2, 30);
  } else {
    insertNodeHelper(root, value, 1);
  }
  updateVisualization();
}

function clearTree() {
  root = null;
  updateVisualization();
}

function findMin(node) {
  let current = node;
  while (current && current.left !== null) {
    current = current.left;
  }
  return current;
}

function deleteNodeHelper(node, value) {
  if (node === null) return null;
  if (value < node.value) {
    node.left = deleteNodeHelper(node.left, value);
  } else if (value > node.value) {
    node.right = deleteNodeHelper(node.right, value);
  } else {
    if (node.left === null) return node.right;
    if (node.right === null) return node.left;
    let successor = findMin(node.right);
    node.value = successor.value;
    node.right = deleteNodeHelper(node.right, successor.value);
  }
  return node;
}

function findNode(node, value) {
  if (!node) return null;
  if (node.value === value) return node;
  return findNode(node.left, value) || findNode(node.right, value);
}

function flickerNode(node) {
  // Select using the node class instead of transform to handle drag changes
  const circle = svg.select(`.node-${node.value}`).select("circle");
  if (circle.empty()) {
    console.error(`Circle for node ${node.value} not found`);
    return;
  }
  console.log(`Flickering node ${node.value}`);
  circle
    .transition()
    .duration(300)
    .attr("fill", "#90EE90") // Green highlight
    .transition()
    .duration(300)
    .attr("fill", circle.attr("fill") || circle) // Revert to initial fill
    .on("end", () =>
      console.log(`Transition completed for node ${node.value}`)
    );
}

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
  const nodeToDelete = findNode(root, value);
  if (!nodeToDelete) {
    alert("Node not found");
    return;
  }
  flickerNode(nodeToDelete);
  setTimeout(() => {
    root = deleteNodeHelper(root, value);
    updateVisualization();
  }, 600);
}

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
  const nodeToSearch = findNode(root, value);
  if (nodeToSearch) {
    flickerNode(nodeToSearch);
    setTimeout(() => alert(`Node ${value} found!`), 600);
  } else {
    alert(`Node ${value} not found!`);
  }
}

function inOrderTraversalHelper(node, nodes) {
  if (node) {
    inOrderTraversalHelper(node.left, nodes);
    nodes.push(node);
    inOrderTraversalHelper(node.right, nodes);
  }
}

function inOrderTraversal() {
  if (!root) {
    alert("Tree is empty");
    return;
  }
  const nodes = [];
  inOrderTraversalHelper(root, nodes);
  animateTraversal(nodes);
}

function preOrderTraversalHelper(node, nodes) {
  if (node) {
    nodes.push(node);
    preOrderTraversalHelper(node.left, nodes);
    preOrderTraversalHelper(node.right, nodes);
  }
}

function preOrderTraversal() {
  if (!root) {
    alert("Tree is empty");
    return;
  }
  const nodes = [];
  preOrderTraversalHelper(root, nodes);
  animateTraversal(nodes);
}

function postOrderTraversalHelper(node, nodes) {
  if (node) {
    postOrderTraversalHelper(node.left, nodes);
    postOrderTraversalHelper(node.right, nodes);
    nodes.push(node);
  }
}

function postOrderTraversal() {
  if (!root) {
    alert("Tree is empty");
    return;
  }
  const nodes = [];
  postOrderTraversalHelper(root, nodes);
  animateTraversal(nodes);
}

function levelOrderTraversal() {
  if (!root) {
    alert("Tree is empty");
    return;
  }
  const nodes = [];
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    nodes.push(node);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  animateTraversal(nodes);
}

function animateTraversal(nodes) {
  let count = 0;
  function highlightNext() {
    if (count < nodes.length) {
      flickerNode(nodes[count]);
      count++;
      setTimeout(highlightNext, 600);
    } else {
      alert("Traversal Order: " + nodes.map((n) => n.value).join(" → "));
    }
  }
  highlightNext();
}

function initializeTree() {
  const initialValues = [40, 20, 60, 10, 30, 50];
  root = new Node(initialValues[0], width / 2, 30);
  for (let i = 1; i < initialValues.length; i++) {
    insertNodeHelper(root, initialValues[i], 1);
  }
}

// Initialize the tree
initializeTree();
updateVisualization();
