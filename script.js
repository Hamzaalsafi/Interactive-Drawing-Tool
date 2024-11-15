const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const cursor = document.querySelectorAll(".cursor");
let isDrawing = false;
let lastX = 0;
let lastY = 0;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let startX, startY, currentShape = '';
const shapes = [];
let canvasSnapshot;
let fillShape = false;
let shapeColor = '#000000';
// To set the shape when clicking on a button
const shapeButtons = document.querySelectorAll('.shape-btn');
shapeButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentShape = button.getAttribute('data-shape');
    
  });
  
});
const fillToggle = document.getElementById('fillToggle');
fillToggle.addEventListener('change', (e) => {
  fillShape = e.target.checked;
});
const shapeColorInput = document.getElementById('shapecolor');
shapeColorInput.addEventListener('input', (e) => {
  shapeColor = e.target.value;
});
ctx.lineWidth = 2; 
let globalLineWidth = 1; // Default line width
let globalColor = '#4B4B4B'
ctx.lineJoin = 'round';
ctx.lineCap = 'round';

// Handle mouse up globally
document.addEventListener('mouseup', () => {
  isDrawing = false;
  
});

const drawingbutton = document.getElementById('drawingbutton');
const mousebutton = document.getElementById('mousebutton');
const trash = document.getElementById('trash');
const shapebtn=document.getElementById('shapebtn');
const shapetoolbar=document.querySelector(".shape-toolbar");
function shapemousedown(e) {
  isDrawing = true;
  const pos = getMousePos(e);
  startX = pos.x;
  startY = pos.y;
  ctx.beginPath();
  // Save a snapshot of the canvas before starting to draw the shape
  canvasSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function shapemousemove(e) {
  if (!isDrawing) return;

  const pos = getMousePos(e);
  
  // Restore the canvas to the saved snapshot before drawing the current shape
  ctx.putImageData(canvasSnapshot, 0, 0);

  // Draw the current shape as the mouse moves
  switch (currentShape) {
    case 'rectangle':
      drawRectangle(startX, startY, pos.x - startX, pos.y - startY);
      break;
    case 'circle':
      drawCircle(startX, startY, Math.abs(pos.x - startX));
      break;
    case 'line':
      drawLine(startX, startY, pos.x, pos.y);
      break;
    case 'star':
      drawStar(startX, startY, Math.abs(pos.x - startX));
      break;
    case 'square':
      drawSquare(startX, startY, Math.abs(pos.x - startX));
      break;
    case 'triangle':
      drawEquilateralTriangle(startX, startY, Math.abs(pos.x - startX));
      break;
    default:
      break;
  }
}
function shapemouseup(e) {
  if (isDrawing) {
    const pos = getMousePos(e);
    shapes.push({
      type: currentShape,
      startX,
      startY,
      endX: pos.x,
      endY: pos.y,
    });
    isDrawing = false;
    saveState();
  }
}
function redrawShapes() {
  shapes.forEach(shape => {
    const { startX, startY, endX, endY, type } = shape;
    const width = endX - startX;
    const height = endY - startY;
    switch (type) {
      case 'rectangle':
        drawRectangle(startX, startY, width, height);
        break;
      case 'circle':
        drawCircle(startX, startY, Math.abs(width));
        break;
      case 'line':
        drawLine(startX, startY, endX, endY);
        break;
      case 'star':
        drawStar(startX, startY, Math.abs(width));
        break;
      case 'square':
        drawSquare(startX, startY, Math.abs(width));
        break;
      case 'triangle':
        drawEquilateralTriangle(startX, startY, Math.abs(width));
        break;
      default:
        break;
    }
  });
}

// Functions to draw shapes (as outlines)
function drawRectangle(x, y, width, height) {
  ctx.strokeStyle = shapeColor;
  ctx.lineWidth = 2;
  if (fillShape) {
    ctx.fillStyle = shapeColor;
    ctx.fillRect(x, y, width, height);
  } else {
    ctx.strokeRect(x, y, width, height);
  }
}

function drawCircle(x, y, radius) {
  ctx.strokeStyle = shapeColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  if (fillShape) {
    ctx.fillStyle = shapeColor;
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

function drawLine(x1, y1, x2, y2) {
  ctx.strokeStyle = shapeColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawSquare(x, y, size) {
  drawRectangle(x, y, size, size);
}

function drawEquilateralTriangle(x, y, size) {
  const height = (Math.sqrt(3) / 2) * size;
  const x1 = x - size / 2;
  const x2 = x + size / 2;
  const y1 = y + height / 2;
  const y2 = y - height / 2;

  ctx.strokeStyle = shapeColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);  // Bottom left
  ctx.lineTo(x2, y1);  // Bottom right
  ctx.lineTo((x1 + x2) / 2, y2);  // Top
  ctx.closePath();
  if (fillShape) {
    ctx.fillStyle = shapeColor;
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

function drawStar(cx, cy, radius) {
  const spikes = 5;
  const outerRadius = radius;
  const innerRadius = radius / 2;
  let rotation = Math.PI / 2 * 3;
  const step = Math.PI / spikes;

  ctx.strokeStyle = shapeColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rotation) * outerRadius;
    let y = cy + Math.sin(rotation) * outerRadius;
    ctx.lineTo(x, y);
    rotation += step;

    x = cx + Math.cos(rotation) * innerRadius;
    y = cy + Math.sin(rotation) * innerRadius;
    ctx.lineTo(x, y);
    rotation += step;
  }

  ctx.closePath();
  if (fillShape) {
    ctx.fillStyle = shapeColor;
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

// Utility function to get mouse position
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}
drawingbutton.addEventListener('click', function() {
  shapetoolbar.style.opacity=0;
  const pentoolbar=document.querySelector('.pen-toolbar');
  pentoolbar.style.display = "block";
 const h1=document.querySelectorAll('#texth1');
 h1.forEach(c => {
  c.style.pointerEvents = "none";
  c.style.cursor = "none";

});
saveState();
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);

  canvas.removeEventListener('mousedown', shapemousedown);
  canvas.removeEventListener('mousemove', shapemousemove);
  canvas.removeEventListener('mouseup', shapemouseup);
});


function getMousePos(e) {
  const rect = canvas.getBoundingClientRect(); 
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function startDrawing(e) {
  isDrawing = true;
  const pos = getMousePos(e);
  [lastX, lastY] = [pos.x, pos.y];
  ctx.beginPath();
  ctx.moveTo(lastX, lastY); // Move to the starting point of the draw
}

function draw(e) {
  if (!isDrawing) return;
  
  const pos = getMousePos(e); // Get the current position
  ctx.lineTo(pos.x, pos.y);    // Draw a line to the current position
  ctx.stroke();
  
  [lastX, lastY] = [pos.x, pos.y]; // Update last positions
}

function stopDrawing() {
  isDrawing = false;
  saveState();
}

shapebtn.addEventListener('click', function() {
  shapetoolbar.style.opacity=1;
  cursor.forEach(c => {
    c.style.display = "none";
  });
 
  const pentoolbar=document.querySelector('.pen-toolbar');
  pentoolbar.style.display = "none";
  canvas.style.cursor = "default";
  canvas.removeEventListener('mousedown', startDrawing);
  canvas.removeEventListener('mousemove', draw);
  canvas.removeEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mousedown', shapemousedown);
  canvas.addEventListener('mousemove', shapemousemove);
  canvas.addEventListener('mouseup', shapemouseup);
});


trash.addEventListener('click', function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
});


mousebutton.addEventListener('click', function() {
  cursor.forEach(c => {
    c.style.display = "none";
  });
  shapetoolbar.style.opacity=0;
  const pentoolbar=document.querySelector('.pen-toolbar');
  pentoolbar.style.display = "none";
  canvas.style.cursor = "default";
  canvas.removeEventListener('mousedown', startDrawing);
  canvas.removeEventListener('mousemove', draw);
  canvas.removeEventListener('mouseup', stopDrawing);
  canvas.removeEventListener('mousedown', shapemousedown);
  canvas.removeEventListener('mousemove', shapemousemove);
  canvas.removeEventListener('mouseup', shapemouseup);

});



// Toolbar button active state handling
const toolbarButtons = document.querySelectorAll('.toolbar-icons button');

toolbarButtons.forEach(button => {
  button.addEventListener('click', function() {
    toolbarButtons.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
  });
});
const pentoolbar= document.querySelector(".pen-toolbar");
pentoolbar.style.left= window.innerWidth-110+'px';
const activepentoolbar= document.querySelector("#activepentoolbar");


const toolbarButtons2 = document.querySelectorAll('.pen-toolbar .toolbar-icons button');

toolbarButtons2.forEach(button => {
  button.addEventListener('click', function() {
    
   
    currentTool = this.getAttribute('data-tool');
    setToolProperties(currentTool);
  });
});

// Function to set tool properties based on the selected tool
function setToolProperties(tool) {
  // Set line width and color based on global settings
  ctx.lineWidth = globalLineWidth;
  ctx.strokeStyle = globalColor;
  ctx.shadowColor = globalColor;

  switch (tool) {
    case 'pencil':
      canvas.style.cursor = "none";
      ctx.globalCompositeOperation = 'source-over'; 
      ctx.setLineDash([0.5, 1.5]);
      ctx.globalAlpha = 0.7; 
      ctx.lineJoin = 'round'; 
      ctx.lineCap = 'round'; 
      ctx.shadowOffsetX = 0.5; 
      ctx.shadowOffsetY = 0.5;
      ctx.shadowBlur = 1;  

      

      // Adding slight jitter to simulate hand-drawn lines
      function drawPencilLine(x1, y1, x2, y2) {
        const steps = 10;
        const dx = (x2 - x1) / steps;
        const dy = (y2 - y1) / steps;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        for (let i = 1; i <= steps; i++) {
          const x = x1 + dx * i + (Math.random() - 0.5) * 0.5;
          const y = y1 + dy * i + (Math.random() - 0.5) * 0.5;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Handle pencil cursor display
      cursor.forEach(c => {
        c.style.display = "none";
      });
      const PENCIL = document.querySelector(".PENCIL");
      PENCIL.style.display = "block";
      document.addEventListener("mousemove", (e) => {
        const pos = getMousePos(e); 
        PENCIL.style.left = pos.x - 12.5 + "px";
        PENCIL.style.top = pos.y - 34 + "px";
      });
      break;

    case 'pen':
      canvas.style.cursor = "none";
      ctx.lineWidth = globalLineWidth; // Use global width
      ctx.strokeStyle = globalColor;   // Use global color
      ctx.globalCompositeOperation = 'source-over';
      ctx.setLineDash([]); 
      ctx.shadowBlur = 0; 
      ctx.globalAlpha = 1; 

      // Adding slight shadow for depth
      ctx.shadowColor = globalColor;
      ctx.shadowOffsetX = 0.5;
      ctx.shadowOffsetY = 0.5;
      ctx.shadowBlur = 2;

      // Handle pen cursor display
      cursor.forEach(c => {
        c.style.display = "none";
      });
      const PEN = document.querySelector(".PEN");
      PEN.style.display = "block";
      document.addEventListener("mousemove", (e) => {
        const pos = getMousePos(e); 
        PEN.style.left = pos.x - 2 + "px";
        PEN.style.top = pos.y - 38 + "px";
      });
      break;

    case 'brush':
      canvas.style.cursor = "none";
      ctx.lineWidth = globalLineWidth; // Use global width
      ctx.strokeStyle = globalColor;   // Use global color
      ctx.lineCap = 'round'; 
      ctx.globalCompositeOperation = 'source-over';
      ctx.setLineDash([]);
      ctx.shadowBlur = 5;
      ctx.shadowColor = globalColor;

      
    
      cursor.forEach(c => {
        c.style.display = "none";
      });
      const BRUSH = document.querySelector(".BRUSH");
      BRUSH.style.display = "block";
      document.addEventListener("mousemove", (e) => {
        const pos = getMousePos(e); 
        BRUSH.style.left = pos.x - 27 + "px";
        BRUSH.style.top = pos.y - 38 + "px";
      });
      break;

    case 'feather':
      canvas.style.cursor = "none";
      ctx.lineWidth = globalLineWidth; // Use global width
      ctx.strokeStyle = globalColor;   // Use global color
      ctx.globalAlpha = 0.2; 
      ctx.globalCompositeOperation = 'source-over';
      ctx.setLineDash([]);
      ctx.shadowBlur = 3;

      // Handle feather cursor display
      cursor.forEach(c => {
        c.style.display = "none";
      });
      const FEATHER = document.querySelector(".FEATHER");
      FEATHER.style.display = "block";
      document.addEventListener("mousemove", (e) => {
        const pos = getMousePos(e); 
        FEATHER.style.left = pos.x - 16 + "px";
        FEATHER.style.top = pos.y - 64 + "px";
      });
      break;
      
    case 'eraser':
      canvas.style.cursor = "none";
      ctx.lineWidth = globalLineWidth; // Use global width
      ctx.globalCompositeOperation = 'destination-out'; 
      ctx.setLineDash([]);
      ctx.shadowBlur = 0; 
      ctx.globalAlpha = 1; 

      // Handle eraser cursor display
      cursor.forEach(c => {
        c.style.display = "none";
      });
      const ERASER = document.querySelector(".ERASER");
      ERASER.style.display = "block";
      document.addEventListener("mousemove", (e) => {
        const pos = getMousePos(e); 
        ERASER.style.left = pos.x - 10 + "px";
        ERASER.style.top = pos.y - 22 + "px";
      });
      break;
      case 'highlighter':
        canvas.style.cursor = "none";
      ctx.lineWidth = globalLineWidth * 20; // Increase line width for a more realistic highlighter
      ctx.strokeStyle = '#f8fc0044'; // Set the color to the desired highlight color
      ctx.globalCompositeOperation = 'source-over';
      ctx.setLineDash([]);
      ctx.shadowBlur = 20; // Larger blur for a stronger highlight
      ctx.shadowColor = '#f8fc0044'; 
      ctx.globalAlpha = 0.4; 

      
      cursor.forEach(c => {
        c.style.display = "none";
      });
        const HIGHLIGHTER = document.querySelector(".HIGHLIGHTER");
        HIGHLIGHTER.style.display = "block";
        document.addEventListener("mousemove", (e) => {
          const pos = getMousePos(e); 
          HIGHLIGHTER.style.left = pos.x - 25 + "px";
          HIGHLIGHTER.style.top = pos.y - 63 + "px";
        });
        break;
  }
}
const penToolbar = document.querySelector('.pen-toolbar');
let offsetX = 0, offsetY = 0;
let isDragging = false;
let hasDragged = false; 

// Prevent default drag behavior
penToolbar.addEventListener('dragstart', (e) => {
  e.preventDefault();
});

// Start dragging with custom events
penToolbar.addEventListener('mousedown', (e) => {
  isDragging = true;
  hasDragged = false; // Reset dragging flag on mousedown
  offsetX = e.clientX - penToolbar.getBoundingClientRect().left;
  offsetY = e.clientY - penToolbar.getBoundingClientRect().top;

  
  penToolbar.style.cursor = 'move';
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    hasDragged = true; 
    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;

    if (newX >= 0 && newX <= window.innerWidth - penToolbar.offsetWidth) {
      penToolbar.style.left = `${newX}px`;
    }
    if (newY >= 0 && newY <= window.innerHeight - penToolbar.offsetHeight) {
      penToolbar.style.top = `${newY}px`;
    }

  }
});

// Stop dragging
document.addEventListener('mouseup', () => {
  isDragging = false;
  penToolbar.style.cursor = 'default';

});

// Prevent click event from firing after dragging
const activePenToolbarButton = document.getElementById('activepentoolbar');
activePenToolbarButton.addEventListener('click', (e) => {
  if (hasDragged) {
    e.preventDefault();
    hasDragged = false;
  }
  else{
    const hiddenpart= document.querySelector(".hiddenpart");
    hiddenpart.classList.toggle('show');
  }
});
const colorButtons = document.querySelectorAll('.color');
colorButtons.forEach(button => {
  button.addEventListener('click', function() {
    globalColor = this.getAttribute('data-color'); 
    ctx.strokeStyle = globalColor; 
    ctx.shadowColor = globalColor; 
  });
});
const colorbar = document.querySelector("#colorbar");
const pencilcolor = document.querySelector(".pencilcolor");

colorbar.addEventListener('click', function(e) {
  const pencilcolor = document.querySelector(".pencilcolor");
  const pos = getMousePos(e); 
  const father = document.querySelector(".pencilcolor");
  
  let newLeft = pos.x - 400; 
  let newTop = pos.y - 100;
  
  // Get the window dimensions
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  

  if (newLeft + 325> windowWidth) {  
    newLeft = windowWidth - 325 - 10; 
  }
  
  
  if (newLeft < 0) {
    newLeft = 200; 
  }

  // Ensure it doesn't go outside the bottom side
  if (newTop + pencilcolor.offsetHeight > windowHeight) {
    newTop = windowHeight - pencilcolor.offsetHeight - 10; // Adjust if it exceeds window height
  }

  // Ensure it doesn't go outside the top side
  if (newTop < 0) {
    newTop = 10; // Minimum distance from the top
  }

  // Apply the adjusted position
  pencilcolor.style.left = newLeft + "px";
  pencilcolor.style.top = newTop + "px";
  pencilcolor.style.display = "block";
});

// Add an event listener to the document to hide the pencilcolor element
document.addEventListener('click', function(e) {
  // Check if the click was outside the colorbar and pencilcolor
  if (!colorbar.contains(e.target) && !pencilcolor.contains(e.target)) {
    pencilcolor.style.display = "none";
  }
});

pencilcolor.addEventListener('click', function(e) {
  e.stopPropagation();
});
const colorPicker=document.getElementById("colorPicker");

colorPicker.addEventListener('change', function(e) {
  globalColor = e.target.value; // Update global color from picker
  ctx.strokeStyle = globalColor;
  ctx.shadowColor = globalColor;

  // Add new color button to the toolbar (optional)
  const button = document.createElement("button");
  button.style.backgroundColor = globalColor;
  button.className = "color";
  button.setAttribute('data-color', globalColor);
  document.querySelector(".pencilcolor ul").appendChild(button);

  // Re-attach event listener to the new button
  button.addEventListener('click', function() {
    globalColor = this.getAttribute('data-color');
    ctx.strokeStyle = globalColor;
    ctx.shadowColor = globalColor;
  });
});
const rangePicker = document.getElementById('rangePicker');
const sliderValue = document.getElementById('sliderValue');

// Update the tooltip value as the slider is adjusted
rangePicker.addEventListener('input', function () {
    sliderValue.textContent = rangePicker.value;

    globalLineWidth = rangePicker.value; 
    ctx.lineWidth = globalLineWidth;
    const value = (rangePicker.value - rangePicker.min) / (rangePicker.max - rangePicker.min) * 100;
    sliderValue.style.left = `calc(${value}% + (${8 - value * 0.15}px))`;
});
const rangePicker2 = document.getElementById('rangePicker2');
const sliderValue2 = document.getElementById('sliderValue2');

// Update the tooltip value as the slider is adjusted
rangePicker2.addEventListener('input', function () {
    sliderValue2.textContent = rangePicker.value;
  
    const value = (rangePicker2.value - rangePicker2.min) / (rangePicker2.max - rangePicker2.min) * 100;
    sliderValue2.style.left = `calc(${value}% + (${8 - value * 0.15}px))`;
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const dataURL = canvas.toDataURL();
  shapetoolbar.style.opacity = 0;

  // Get all text elements
  const textElements = Array.from(document.querySelectorAll('#texth1')).map(el => ({
    text: el.textContent,
    left: el.style.left,
    top: el.style.top,
    fontSize: el.style.fontSize,
    color: el.style.color,
  }));

  // Save canvas and text elements to localStorage
  localStorage.setItem('savedCanvas', dataURL);
  localStorage.setItem('savedTextElements', JSON.stringify(textElements));
  alert('Canvas and text saved successfully!');
});


window.addEventListener('load', () => {
  const savedCanvas = localStorage.getItem('savedCanvas');
  const savedTextElements = localStorage.getItem('savedTextElements');

  if (savedCanvas) {
    const img = new Image();
    img.src = savedCanvas;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }

  if (savedTextElements) {
    const textElements = JSON.parse(savedTextElements);
    textElements.forEach(el => {
      let newh1 = document.createElement('h1');
      newh1.textContent = el.text;
      newh1.style.position = 'absolute';
      newh1.style.left = el.left;
      newh1.style.top = el.top;
      newh1.style.fontSize = el.fontSize;
      newh1.style.color = el.color;
      newh1.setAttribute('draggable', 'true');
      newh1.setAttribute('contenteditable', 'true');
      newh1.setAttribute('id', 'texth1');
      text.appendChild(newh1);
      dragh1(newh1);
      rightclick(newh1);
    });
  }
});
document.getElementById('trash').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  localStorage.removeItem('savedCanvas'); // Remove saved canvas from localStorage
  localStorage.removeItem('savedTextElements'); // Remove saved text elements from localStorage

  // Remove text elements from the DOM
  const textElements = document.querySelectorAll('#texth1');
  textElements.forEach(el => el.remove());

  alert('Canvas and text cleared, and localStorage data removed!');
});
function dragh1(h1){

let offsetX = 0, offsetY = 0;
let isDragging = false;
let hasDragged = false;
// Prevent default drag behavior
h1.addEventListener('dragstart', (e) => {
  e.preventDefault();
});


h1.addEventListener('mousedown', (e) => {
  isDragging = true;
  hasDragged = false; 
  offsetX = e.clientX - h1.getBoundingClientRect().left;
  offsetY = e.clientY - h1.getBoundingClientRect().top;

  h1.style.cursor = 'move';
});

// Handle dragging movement
document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    hasDragged = true; 
    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;

    if (newX >= 0 && newX <= window.innerWidth - h1.offsetWidth) {
      h1.style.left = `${newX}px`;
    }
    if (newY >= 0 && newY <= window.innerHeight - h1.offsetHeight) {
      h1.style.top = `${newY}px`;
    }
  
  }
});


document.addEventListener('mouseup', () => {
  isDragging = false;
  h1.style.cursor = 'default';

});
}
const text=document.querySelector('.text');
const textbtn=document.querySelector("#textbtn");
let selectedH1 = null; 

function rightclick(h1) {
  const menu = document.querySelector(".texteditBtn");
  
  h1.addEventListener('contextmenu', (event) => {
    event.preventDefault(); 
    menu.style.opacity = 1;
    menu.style.left = `${event.clientX - 100}px`;
    menu.style.top = `${event.clientY - 90}px`;
    selectedH1 = h1;
  });
  
  document.addEventListener('click', function(e) {
    
    if (!menu.contains(e.target)) {
      menu.style.opacity = 0;
    }
  });
}

function changecolor() {
  const color = document.querySelector('#textcolor');

  color.addEventListener('input', () => {
    if (selectedH1) {
      selectedH1.style.color = color.value;
    }
  });
}
function changefontsize() {
  const size = document.querySelector('#rangePicker2');
  const tooltip = document.querySelector('#sliderValue2');

  // Update font size when the range input changes
  size.addEventListener('input', () => {
    if (selectedH1) {
      selectedH1.style.fontSize = `${size.value}px`; // Set font size with 'px'
    }

   
    tooltip.textContent = size.value;
  });
}
changefontsize();
textbtn.addEventListener('click', () => {
  cursor.forEach(c => {
    c.style.display = "none";
  });
  shapetoolbar.style.opacity=0;
  const h1 = document.querySelectorAll('#texth1');
  h1.forEach(c => {
    c.style.pointerEvents = "default";
    c.style.cursor = "default";
  });

  const pentoolbar = document.querySelector('.pen-toolbar');
  pentoolbar.style.display = "none";
  canvas.style.cursor = "default";
  canvas.removeEventListener('mousedown', startDrawing);
  canvas.removeEventListener('mousemove', draw);
  canvas.removeEventListener('mouseup', stopDrawing);

  let newh1 = document.createElement('h1');
  newh1.textContent = "text";
  newh1.setAttribute("draggable", "true");
  newh1.setAttribute("contenteditable", "true");
  newh1.setAttribute("id", "texth1");
  
  text.appendChild(newh1);
  dragh1(newh1);
  rightclick(newh1);
});
changecolor();

let undoStack = [];
let redoStack = [];

// Save the initial state of the canvas (empty canvas)
function saveInitialState() {
  undoStack.push(canvas.toDataURL()); // Push the initial blank or pre-drawn canvas state
}

// Save the current state of the canvas
function saveState() {
  undoStack.push(canvas.toDataURL());
  redoStack = []; // Clear the redo stack on a new action
}

// Undo functionality
function undo() {
  if (undoStack.length > 1) { // Check if there's a state to undo to
    redoStack.push(undoStack.pop()); // Move current state to redo stack
    let canvasImage = new Image();
    canvasImage.src = undoStack[undoStack.length - 1]; // Load the previous state
    canvasImage.onload = function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      ctx.drawImage(canvasImage, 0, 0); // Restore the previous state
    };
  }
}

// Redo functionality
function redo() {
  if (redoStack.length > 0) { // Check if there's a state to redo to
    let canvasImage = new Image();
    canvasImage.src = redoStack.pop(); // Load the next state
    canvasImage.onload = function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      ctx.drawImage(canvasImage, 0, 0); // Restore the next state
    };
    undoStack.push(canvas.toDataURL()); // Move current state to undo stack
  }
}

// Add undo and redo buttons
document.getElementById('undoButton').addEventListener('click', undo);
document.getElementById('redoButton').addEventListener('click', redo);

// Save state after each drawing action (e.g., after drawing with mouse)

// Save the initial state once the canvas is set up
saveInitialState(); // Call this after the canvas is initialized (blank canvas or pre-drawing)

// Keyboard shortcuts for undo/redo
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'z') { // Ctrl+Z for undo
    undo();
  }
  if (e.ctrlKey && e.key === 'y') { // Ctrl+Y for redo
    redo();
  }
});
