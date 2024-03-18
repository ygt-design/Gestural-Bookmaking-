let paths = []; // Store arrays of points for each path
let elements = []; // Store draggable elements including text
let draggingElement = null; // The element currently being dragged
let offsetX, offsetY; // Offset when dragging

function setup() {
  createCanvas(1000, 600);

  document.getElementById("submitText").addEventListener("click", function () {
    let inputText = document.getElementById("textInput").value;
    if (inputText.trim() !== "") {
      let dimensions = calculateTextDimensions(inputText, 400); // maxWidth can be adjusted
      // When adding a new text element
      elements.push({
        type: "text",
        text: inputText,
        x: 20,
        y: 60 + elements.filter((e) => e.type === "text").length * 60,
        w: dimensions.w,
        h: dimensions.h,
        dragging: false,
        resizing: false, // New property to track if the element is being resized
        resizeHandle: { width: 8, height: 8 }, // Dimensions of the resize handle
      });

      document.getElementById("textInput").value = ""; // Clear the input box
    }
  });

  document
    .getElementById("heightSlider")
    .addEventListener("input", function () {
      resizeCanvas(1000, document.getElementById("heightSlider").value);
    });
}

function calculateTextDimensions(txt, maxWidth) {
  textSize(16); // Ensure this matches the text size used in draw
  let words = txt.split(" ");
  let line = "";
  let lines = 0;
  let currentWidth = 0;

  words.forEach((word) => {
    let testLine = line + word + " ";
    let testWidth = textWidth(testLine);
    if (testWidth > maxWidth && line !== "") {
      lines++;
      line = word + " ";
    } else {
      line = testLine;
    }
    currentWidth = max(currentWidth, testWidth);
  });

  if (line !== "") {
    lines++;
  }

  let adjustedHeight = lines * 20; // 20 can be adjusted based on line height
  return { w: min(currentWidth, maxWidth), h: adjustedHeight };
}

function mousePressed() {
  elements.forEach((elem) => {
    if (
      mouseX >= elem.x + elem.w - elem.resizeHandle.width &&
      mouseX <= elem.x + elem.w &&
      mouseY >= elem.y + elem.h - elem.resizeHandle.height &&
      mouseY <= elem.y + elem.h
    ) {
      elem.resizing = true;
      draggingElement = elem; // Ensure we only resize one element at a time
    }
    if (
      mouseX > elem.x &&
      mouseX < elem.x + elem.w &&
      mouseY > elem.y &&
      mouseY < elem.y + elem.h
    ) {
      draggingElement = elem;
      offsetX = mouseX - elem.x;
      offsetY = mouseY - elem.y;
      elem.dragging = true;
    }
  });

  if (!draggingElement) {
    paths.push([]);
  }
}

function snapToPath(element) {
  if (!element.dragging) return; // Only snap if the element was being dragged

  let closestPoint = null;
  let recordDistance = Infinity;
  paths.forEach((path) => {
    path.forEach((point) => {
      let d = dist(
        element.x + element.w / 2,
        element.y + element.h / 2,
        point.x,
        point.y
      );
      if (d < recordDistance) {
        closestPoint = point;
        recordDistance = d;
      }
    });
  });
  if (closestPoint) {
    element.x = closestPoint.x - element.w / 2;
    element.y = closestPoint.y - element.h / 2;
  }
}

function mouseDragged() {
  if (draggingElement && draggingElement.resizing) {
    // Resize the text box
    draggingElement.w = mouseX - draggingElement.x;
    draggingElement.h = mouseY - draggingElement.y;
    // Adjust text wrapping based on new dimensions
    let dimensions = calculateTextDimensions(
      draggingElement.text,
      draggingElement.w
    );
    draggingElement.w = dimensions.w;
    draggingElement.h = dimensions.h;
  } else if (draggingElement) {
    draggingElement.x = mouseX - offsetX;
    draggingElement.y = mouseY - offsetY;
  } else {
    let currentPath = paths[paths.length - 1];
    currentPath.push(createVector(mouseX, mouseY));
  }
}

function mouseReleased() {
  if (draggingElement) {
    if (draggingElement.resizing) {
      // Final adjustments and clean-up after resizing
      draggingElement.resizing = false;
    } else {
      snapToPath(draggingElement);
      draggingElement.dragging = false;
      draggingElement = null;
    }
    draggingElement.dragging = false;
    draggingElement = null;
  }
}

function draw() {
  background(240);

  // Draw paths
  paths.forEach((path) => {
    beginShape();
    noFill();
    stroke(0);
    strokeWeight(2);
    path.forEach((point) => curveVertex(point.x, point.y));
    endShape();
  });

  // Draw elements
  elements.forEach((elem) => {
    if (elem.type === "rectangle") {
      fill(0, 255, 0); // Green fill for rectangles
      stroke(0); // Black stroke
      if (elem.dragging) fill(150); // Darker fill if being dragged
      rect(elem.x, elem.y, elem.w, elem.h);
    } else if (elem.type === "text") {
      // Draw text box background and border
      fill(240); // Light gray background for text box
      stroke(0); // Black stroke
      rect(elem.x, elem.y, elem.w, elem.h); // Text box background

      // Draw the text with padding
      const padding = 10; // Padding on each side
      fill(0); // Black text
      noStroke();
      textSize(16);
      text(
        elem.text,
        elem.x + padding,
        elem.y + padding,
        elem.w - 2 * padding,
        elem.h - 2 * padding
      );

      // Draw resize handle
      fill(255, 0, 0); // Red fill for the resize handle
      rect(
        elem.x + elem.w - elem.resizeHandle.width,
        elem.y + elem.h - elem.resizeHandle.height,
        elem.resizeHandle.width,
        elem.resizeHandle.height
      );
    }
  });
}
