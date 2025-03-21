const ant = "<svg xmlns='http://www.w3.org/2000/svg' xml:space='preserve' width='46' height='73' fill-rule='evenodd' clip-rule='evenodd' image-rendering='optimizeQuality' shape-rendering='geometricPrecision' text-rendering='geometricPrecision' viewBox='0 0 10.12 15.93'><g id='Layer_x0020_1'><path id='tl' d='m4.32 6.76.01.22-1.16-1.27c-.28-.58-.11-1.73-.26-2.2l-.03.06-.06.22-.01.05-.01.04c-.53-.61-.74-.47-1.24-1.11-.27-.35-.14-.36-.47-.33.03.3.67.91.91 1.11.79.65.58.24.71 1.38a2.84 2.84 0 0 0 1.8 2.44l-.19-.61z'/><path id='bl' d='m4.72 9-.01.65c-.61.09-.96.74-2.35 1.35a6 6 0 0 0 .11 1.59c.34 1.49-.43 1.15-.78 2.23-.18.57-.07.81-.48 1.11h-.05c.09-.43.55-1.77.75-2.01.75-.88.07-.82.14-2.36.06-1.25 1.22-1.49 2.34-2.25l.1-.06c.13-.1.1-.07.18-.17L4.72 9z'/><path id='ml' d='M4.31 8.77c.24.08.1.04.26.26.16-.16.24-.29.49-.3l-.45-.36c-1.46.08-2.47-1.1-2.89.95-.21 1.08.32.98-.62 1.56-.31.19-.3.24-.56.49l-.26.25c-.23.24-.15.11-.28.4.37-.07.98-.69 1.26-.98.18-.18.27-.19.44-.34.45-.39.22-.61.38-1.12.06-.2.34-.9.45-1.02.08-.01 1.78.21 1.78.21z'/><path d='M5.46 9.65h-.02l.03.18c.05.36.01.29.46.46.42.17.45.11.65.51.28.56.34 1.35.22 2.01-.16.86-.83 2.02-1.72 2.41v.01l-.01-.01-.01.01v-.01c-.89-.39-1.55-1.55-1.71-2.41a3.33 3.33 0 0 1 .22-2.01c.19-.4.23-.34.65-.51.45-.17.41-.1.46-.46l.03-.18h-.02L4.7 9l.21-.27-.45-.36c.12-.41.14-.52.05-.88l-.02-.11-.01-.01-.19-.61c-.01-.61.01-.77.53-1.08-.84-.04-.54-.04-1.11-.34-.16-1.58.16-1.47.46-2.13-.36-.4-1.34-.19-1.86-.36-.18-.42-.22-.99-.44-1.48S1.36.57 1.27 0c.84.27.92 1.88 1.24 2.64.87.04 1.12.09 1.88.33.23-.48.45-.77.68-.73.24-.04.46.25.69.73.76-.24 1-.29 1.88-.33.32-.76.4-2.37 1.24-2.64-.09.57-.38.88-.6 1.37-.22.49-.27 1.06-.44 1.48-.52.17-1.5-.04-1.87.36.31.66.63.55.47 2.13-.57.3-.27.3-1.11.34.52.31.54.47.53 1.08l-.19.61-.01.01-.02.11c-.09.36-.07.47.05.88l-.45.36.21.27.01.65zm1.5-2.16z' /><path id='tr' d='M5.79 6.76v.22l1.16-1.27c.28-.58.11-1.73.26-2.2l.03.06.06.22.01.05.01.04c.53-.61.73-.47 1.24-1.11.26-.35.14-.36.46-.33-.02.3-.67.91-.9 1.11-.79.65-.58.24-.71 1.38-.22 1.88-1.69 2.4-1.8 2.44l.18-.61z'/><path id='br' d='m5.4 9 .01.65c.61.09.96.74 2.35 1.35.02.54 0 1.08-.11 1.59-.34 1.49.42 1.15.77 2.23.19.57.08.81.49 1.11h.05a9.06 9.06 0 0 0-.75-2.01c-.75-.88-.07-.82-.14-2.36-.06-1.25-1.23-1.49-2.34-2.25l-.11-.06c-.12-.1-.1-.07-.18-.17L5.4 9z'/>   <path id='mr' d='M5.81 8.77c-.24.08-.1.04-.26.26-.17-.16-.24-.29-.49-.3l.44-.36c1.46.08 2.47-1.1 2.89.95.22 1.08-.31.98.63 1.56.31.19.3.24.55.49l.27.25c.23.24.15.11.28.4-.37-.07-.98-.69-1.27-.98-.17-.18-.26-.19-.44-.34-.44-.39-.22-.61-.37-1.12-.06-.2-.34-.9-.46-1.02-.07-.01-1.77.21-1.77.21z'/></g></svg>"

// store the mouse cursor's X and Y coordinates. They're initialized to a large negative value to ensure the ants don't immediately react to the mouse when the page loads.
let mousex = -1000;
let mousey = -1000;
const ants = [];
const numAnts = 40;
const antSize = 20; 
const avoidRadius = 20; //the distance at which ants start avoiding each other
const followRadius = 150; // the distance at which ants start following the mouse cursor

// create the ants
for (let i = 0; i < numAnts; i++) {
  const antElem = new DOMParser().parseFromString(ant, 'image/svg+xml').documentElement; // takes an SVG string (stored in the ant variable) and converts it into a DOM element that can be manipulated by JavaScript. Details at the end.
  antElem.style.position = 'absolute';
  antElem.setAttribute('width', `${antSize}px`);  
  antElem.setAttribute('height', `${(antSize * 73 / 46)}px`); // Maintain aspect ratio
  antElem.style.transformOrigin = 'center center'; //Sets the transform origin, so that the ant rotates around its center.

  document.body.appendChild(antElem);

  ants.push({
    element: antElem,
    x: Math.random() * (window.innerWidth - antSize),
    y: Math.random() * (window.innerHeight - (antSize * 73 / 46)),
    angle: Math.random() * 360,
    speed: 1 + Math.random() * 2,
    followMouse: false,
  });
}
// karon,
// left: 0; is okay
// left: 100% is not okay. sejonno, 
// left: calc(100% - antSize); is okay because it keeps the element visible.

// on mouse move and leave update the mouse co-ordinates
document.addEventListener('mousemove', (event) => {
  mousex = event.clientX;
  mousey = event.clientY;
});

document.addEventListener('mouseout', () => {
  mousex = -1000;
  mousey = -1000;
});

function updateAnts() {
  ants.forEach((ant, index) => {
    let dx = 0;
    let dy = 0;

    // ant's x and y coordinates for the current animation frame
    const antCenterX = ant.x + antSize / 2;
    const antCenterY = ant.y + (antSize * 73 / 46) / 2; 

    // calculate the center coordinates of the ant SVG for distance calculations and rotation.
    const distanceToMouse = Math.sqrt(Math.pow(mousex - antCenterX, 2) + Math.pow(mousey - antCenterY, 2));
    
    if (distanceToMouse <= followRadius) {
      // move towards mouse
      const randomFactor = 0.01 + Math.random() * 0.01; // Randomize movement speed slightly. This determinues movement speed towards mouse.
      dx = (mousex - antCenterX) * randomFactor; // Move towards the mouse slowly
      dy = (mousey - antCenterY) * randomFactor;
      ant.angle = Math.atan2(dy, dx) * 180 / Math.PI; // Face the mouse
    } else {
      // random movement logic. Calculate the probable change in x and y coordinates based on the ant's current angle and speed. Then randomly changes the ant's angle, making it wander.
      dx = Math.cos(ant.angle * Math.PI / 180) * ant.speed;
      dy = Math.sin(ant.angle * Math.PI / 180) * ant.speed;
      ant.angle += (Math.random() - 0.5) * 10;
    }

    ants.forEach((otherAnt, otherIndex) => {
      // ensures that an ant doesn't try to avoid itself
      if (index !== otherIndex) {
        const otherAntCenterX = otherAnt.x + antSize / 2;
        const otherAntCenterY = otherAnt.y + (antSize * 73 / 46) / 2;
        // Calculates the distance between the current ant and the other ant.
        const dist = Math.sqrt(Math.pow(antCenterX - otherAntCenterX, 2) + Math.pow(antCenterY - otherAntCenterY, 2));
        // Checks if the other ant is within the avoidRadius. Calculates a strength factor based on the distance, making the avoidance stronger when ants are closer. Adjusts the ant's dx and dy to move it away from the other ant.
        if (dist < avoidRadius) {
          const avoidStrength = (avoidRadius - dist) / avoidRadius;
          dx -= (otherAntCenterX - antCenterX) / dist * avoidStrength * 3;
          dy -= (otherAntCenterY - antCenterY) / dist * avoidStrength * 3;
        }
      }
    });

    //Updates the ant's x and y coordinates based on the calculated changes.
    ant.x += dx;
    ant.y += dy;

    // Handle edge collisions. Checks if the ant has moved beyond the screen boundaries. If so, it reverses the ant's angle and clamps its position to stay within the screen.
    if (ant.x < 0 || ant.x > window.innerWidth - antSize || ant.y < 0 || ant.y > window.innerHeight - (antSize * 73 / 46)) {
      ant.angle += 180; // Turn around
      ant.x = Math.max(0, Math.min(ant.x, window.innerWidth - antSize));
      ant.y = Math.max(0, Math.min(ant.y, window.innerHeight - (antSize * 73 / 46)));
    }

    ant.element.style.left = `${ant.x}px`;
    ant.element.style.top = `${ant.y}px`;

    let angle = ant.angle + 90; // Adjust the rotation
    ant.element.style.transform = `rotate(${angle}deg)`;
  });
   // Schedules the updateAnts function to be called again on the next animation frame, creating the continuous animation loop.
  requestAnimationFrame(updateAnts);
}

updateAnts();



// const antElem = new DOMParser().parseFromString(ant, 'image/svg+xml').documentElement;

// SVG code is just a string. To display and manipulate it on a webpage, it needs to be converted into a DOM element that the browser can understand and render.
// The DOMParser provides a convenient way to perform this conversion.

// Example: If the ant variable contains:
// const ant = "<svg width='100' height='100'><circle cx='50' cy='50' r='40' fill='red' /></svg>";

// Then, after executing the code, antElem will be a DOM <svg> element that represents the circle. You can then do things like:

// antElem.style.position = 'absolute';
// antElem.style.left = '100px';
// document.body.appendChild(antElem);

// This would position the red circle at 100px from the left of the page and add it to the document.


// DOMParser is a built-in browser object that allows to parse XML or HTML strings into DOM documents. Then, calls the parseFromString() method of the DOMParser object.

// ant: This is the string containing the SVG code.
// 'image/svg+xml': This is the MIME type of the content being parsed. It tells the parser that the string contains SVG data.
// This method parses the SVG string and returns a Document object representing the parsed SVG.
// .documentElement:

// Accesses the documentElement property of the Document object returned by parseFromString().
// The documentElement property represents the root element of the parsed document, which in this case is the <svg> element itself.
// Because the parseFromString method returns a full document, and we only want the svg element, we need to extract that element.

// const antElem = ...: Assigns the resulting <svg> element to the antElem constant.
// Now, antElem holds a reference to the SVG element, which you can manipulate using JavaScript (e.g., set attributes, styles, append it to the DOM).


// In essence, this line of code: Takes the SVG string from the ant variable. Parses it into a DOM <svg> element. Stores that <svg> element in the antElem variable.

