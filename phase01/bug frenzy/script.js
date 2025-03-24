class BugSprayGame {
   constructor() {
     // Setup DOM elements
     this.root = document.getElementById('root');
     this.setupGameElements();
     
     // Game state
     this.gameActive = false;
     this.score = 0;
     // Make sure we get a valid number for the high score
 const savedHighScore = localStorage.getItem('bugspray_highscore');
 this.highScore = savedHighScore && !isNaN(parseInt(savedHighScore)) ? parseInt(savedHighScore) : 0;
     this.gasLeft = 100;
     this.bugsToKill = 30;
     this.bugsKilled = 0;
     this.bugs = [];
     this.isMouseDown = false;
     this.sprayInterval = null;
     this.spraySize = 1;
     this.cursorPos = { x: 0, y: 0 };
     this.gasClouds = [];
     this.gasSaved = 0;
     
     // Game settings
 this.settings = {
   maxBugsOnScreen: 16,     // Increased max bugs
   spawnRate: 700,          // Faster spawn rate
   gasCostPerSpray: 0.2,    // Very low gas cost
   initialGas: 100,
   maxClouds: 100,          // Maximum clouds for performance
   cloudGravity: 0.05,      // How fast clouds fall
   gasPreservationBonus: 100 // Points for each 1% gas preserved
 };
     
     // Bug types and their properties
 this.bugTypes = {
   fly: { points: 100, speed: 1.0, gasBonus: 0 },    // Medium speed
   gnat: { points: 50, speed: 2.5, gasBonus: 0 },    // Very fast but less points
   wasp: { points: 400, speed: 1.5, gasBonus: 0 },   // Fast and high points
   bigfly: { points: 200, speed: 0.7, gasBonus: 0 }  // Slow but good points
 };
     
     // Setup event listeners
     this.setupEventListeners();
     
     // Initialize spawn points
     this.initSpawnPoints();
     
     // Start animation loop for gas clouds
     this.lastTimestamp = 0;
     requestAnimationFrame(this.animate.bind(this));
   }
   
   setupGameElements() {
     // Create cursor (initially hidden until game starts)
 this.cursor = this.createEl('div', { 
   className: 'cursor',
   style: { 
     display: 'none'
   }
 });
     
     // Create title screen with button as its child
 const titleScreenDiv = document.createElement('div');
 titleScreenDiv.id = 'titleScreen';
 titleScreenDiv.style.position = 'absolute';
 titleScreenDiv.style.top = '50%';
 titleScreenDiv.style.left = '50%';
 titleScreenDiv.style.transform = 'translate(-50%, -50%)';
 titleScreenDiv.style.zIndex = '1000';
 titleScreenDiv.style.opacity = '1';
 titleScreenDiv.style.textAlign = 'center';
 this.root.appendChild(titleScreenDiv);
 
 // Create the title image
 const titleImg = document.createElement('img');
 titleImg.src = 'https://mattcannon.games/codepen/bugs/maintitle.png';
 titleImg.alt = 'Fumigation Frenzy';
 titleImg.style.maxWidth = '90vw';
 titleImg.style.height = 'auto';
 titleScreenDiv.appendChild(titleImg);
 
 // Create play button as a child of the title screen
 this.playBtn = document.createElement('button');
 this.playBtn.className = 'play-btn';
 this.playBtn.innerHTML = '<i class="fas fa-spray-can"></i>Start Frenzy!';
 this.playBtn.style.position = 'absolute';
 this.playBtn.style.bottom = '100px';
 this.playBtn.style.right = '90px';
 this.playBtn.style.opacity = '0';
 this.playBtn.style.pointerEvents = 'none';
 titleScreenDiv.appendChild(this.playBtn);
 
 
 
 this.titleScreen = titleScreenDiv;
     
     // Set timeout to show play button without fading title
 setTimeout(() => {
   // Keep title screen fully visible
   // Just fade in play button
   this.playBtn.style.transition = 'opacity 1s, transform 0.5s';
   this.playBtn.style.opacity = '1';
   this.playBtn.style.pointerEvents = 'auto';
   
   // Add keydown event listener for Enter key
   document.addEventListener('keydown', (event) => {
     if (event.key === 'Enter' && this.titleScreen.style.display !== 'none') {
       // Animate button press
       this.playBtn.style.transform = 'translateY(8px)';
       this.playBtn.style.boxShadow = '0 0 0 #333';
       
       // Short delay to show the animation
       setTimeout(() => {
         // Hide title screen immediately
         this.titleScreen.style.display = 'none';
         this.startGame();
       }, 150);
     }
   });
   
   // Make play button clickable
   this.playBtn.addEventListener('click', () => {
     // Hide title screen immediately
     this.titleScreen.style.display = 'none';
     this.startGame();
   });
   
 }, 500); // Changed from 2000 to 500 for much faster appearance
     
     // Create stats container
     this.statsContainer = this.createEl('div', {
       className: 'stats-container',
       style: { display: 'none' }
     });
     
     // Create score item
     const scoreItem = this.createEl('div', {
       className: 'stats-item'
     }, this.statsContainer);
     
     // Create score display
     this.scoreDisplay = this.createEl('div', {
       className: 'score-display',
       innerHTML: `<i class="fas fa-trophy"></i>SCORE: 0`
     }, scoreItem);
     
     // Create bugs left item
     const bugsLeftItem = this.createEl('div', {
       className: 'stats-item'
     }, this.statsContainer);
     
     // Create bugs left display
 this.bugsLeftDisplay = this.createEl('div', {
   className: 'bugs-left-display',
   innerHTML: `<i class="fas fa-bug"></i>BUGS LEFT: 30` // Hardcoded initial value to ensure it's always set
 }, bugsLeftItem);
     
     // Create gas item
     const gasItem = this.createEl('div', {
       className: 'stats-item gas-stat'
     }, this.statsContainer);
     
     // Create gas label with fixed width to prevent jumping
 this.gasLabel = this.createEl('div', {
   className: 'gas-label',
   innerHTML: '<i class="fas fa-gas-pump"></i>GAS:',
   style: {
     marginRight: '5px'
   }
 }, gasItem);
 
 // Create a separate element for the gas percentage
 this.gasPercentage = this.createEl('div', {
   className: 'gas-percentage',
   innerHTML: '100%',
   style: {
     display: 'inline-block',
     width: '60px',  // Fixed width to accommodate percentages
     marginRight: '15px',  // Add space after the percentage
     textAlign: 'left'
   }
 }, gasItem);
     
     // Create gas meter wrapper
     const gasWrapper = this.createEl('div', {
       className: 'gas-meter-wrapper'
     }, gasItem);
     
     // Create gas meter
     this.gasMeter = this.createEl('div', {
       className: 'gas-meter'
     }, gasWrapper);
     
     // Create high score item at the far right
     const highScoreItem = this.createEl('div', {
       className: 'stats-item'
     }, this.statsContainer);
     
     // Create high score display with a safe default value
   this.highScoreDisplay = this.createEl('div', {
     className: 'high-score-display',
     innerHTML: `<i class="fas fa-award"></i>HI-SCORE: ${this.highScore || 0}`
   }, highScoreItem);
   }
   
   setupEventListeners() {
     document.addEventListener('mousemove', this.handleMouseMove.bind(this));
     document.addEventListener('touchmove', this.handleTouchMove.bind(this));
     document.addEventListener('mousedown', this.handleMouseDown.bind(this));
     document.addEventListener('mouseup', this.handleMouseUp.bind(this));
     document.addEventListener('touchstart', this.handleMouseDown.bind(this));
     document.addEventListener('touchend', this.handleMouseUp.bind(this));
     window.addEventListener('resize', () => this.initSpawnPoints());
   }
   
   // Create element helper. Creates HTML elements with various properties and event listeners.
   createEl(tag, options = {}, parent = this.root) {
    // tag: The HTML tag name (e.g., 'div', 'span', 'button') of which the element to be created.
    // options: An optional object containing properties to set on the created element (e.g., className, id, style, event listeners). It defaults to an empty object {} if not provided.
    // parent: An optional DOM element to which the created element will be appended. It defaults to this.root (likely a property of the class containing this function) if not provided.
     const el = document.createElement(tag);
     if (options.className) el.className = options.className;
     if (options.id) el.id = options.id;
     if (options.innerHTML) el.innerHTML = options.innerHTML;
     if (options.textContent) el.textContent = options.textContent;
     if (options.style) Object.assign(el.style, options.style);  // Copies properties from a source object to a target object. Object.assign(target, source);
     if (options.events) {
       Object.entries(options.events).forEach(([event, handler]) => { // Object.entries returns an array of arrays, where each array contains the key/value pairs of an object
         el.addEventListener(event, handler);
       });
     }

     // checking. By default parent is root but in case user sets parent to null/undefined/an elment that does not exist.
     if (parent) parent.appendChild(el);
     return el;
   }
   
   // Initialize spawn points around the edges
 initSpawnPoints() {
   const width = window.innerWidth - 50;
   const height = window.innerHeight - 50;
   this.spawnPoints = [];
   
   // Add spawn points all around the edges of the screen, with more offscreen distance
   for (let x = 0; x < width; x += 80) { // More spawn points with smaller spacing
     this.spawnPoints.push({ x, y: -50, direction: 'down' });
     this.spawnPoints.push({ x, y: height + 50, direction: 'up' });
   }
   for (let y = 0; y < height; y += 80) {
     this.spawnPoints.push({ x: -50, y, direction: 'right' });
     this.spawnPoints.push({ x: width + 50, y, direction: 'left' });
   }
   
   // Add some corner spawn points for diagonal entry
   this.spawnPoints.push({ x: -50, y: -50, direction: 'diagonal-right-down' });
   this.spawnPoints.push({ x: width + 50, y: -50, direction: 'diagonal-left-down' });
   this.spawnPoints.push({ x: -50, y: height + 50, direction: 'diagonal-right-up' });
   this.spawnPoints.push({ x: width + 50, y: height + 50, direction: 'diagonal-left-up' });
 }
   
   // Animation loop for gas clouds
   animate(timestamp) {
     const deltaTime = timestamp - (this.lastTimestamp || timestamp);
     this.lastTimestamp = timestamp;
     
     // Update all gas clouds
     this.updateGasClouds(deltaTime);
     
     // Check for bug hits from existing clouds
     if (this.gameActive && this.gasClouds.length > 0) {
       this.checkCloudHits();
     }
     
     // Request next frame
     requestAnimationFrame(this.animate.bind(this));
   }
   
   // Update gas clouds positions and opacity
   updateGasClouds(deltaTime) {
     for (let i = this.gasClouds.length - 1; i >= 0; i--) {
       const cloud = this.gasClouds[i];
       
       // Apply gravity - clouds fall downward
       cloud.vy += this.settings.cloudGravity * (deltaTime / 16);
       
       // Update cloud position
       cloud.x += cloud.vx * (deltaTime / 16);
       cloud.y += cloud.vy * (deltaTime / 16);
       
       // Update opacity
       cloud.opacity -= cloud.fadeSpeed * (deltaTime / 16);
       
       // Remove clouds that have faded out
       if (cloud.opacity <= 0) {
         cloud.element.remove();
         this.gasClouds.splice(i, 1);
         continue;
       }
       
       // Apply changes
       cloud.element.style.left = `${cloud.x}px`;
       cloud.element.style.top = `${cloud.y}px`;
       cloud.element.style.opacity = cloud.opacity;
     }
   }
   
   // Start the game
 startGame() {
     this.gameActive = true;
     this.score = 0;
     this.gasLeft = this.settings.initialGas;
     this.bugsKilled = 0;
     this.activeBugCount = 0;
     
     // Clear any existing gas clouds
     this.gasClouds.forEach(cloud => cloud.element.remove());
     this.gasClouds = [];
     
     // Add game-active class to body to hide cursor
     document.body.classList.add('game-active');
     
     // Hide title screen elements, show UI and cursor
 this.titleScreen.style.display = 'none';
 this.statsContainer.style.display = 'flex';
 this.cursor.style.display = 'block';
     
     // Initially position the wand at the center of the screen
     const centerX = window.innerWidth / 2;
     const centerY = window.innerHeight / 2;
     this.cursor.style.left = `${centerX - 40}px`;
     this.cursor.style.top = `${centerY - 250}px`;
     
     // Clear any existing bugs
     this.bugs.forEach(bug => {
       clearInterval(bug.interval);
       bug.element.remove();
     });
     this.bugs = [];
     
     // Show "Get Ready" message
     const readyMsg = this.createEl('div', {
       className: 'ready-message',
       innerHTML: '<i class="fas fa-radiation"></i>GET READY!'
     });
     
     setTimeout(() => {
       readyMsg.remove();
       // Start spawning bugs
       this.spawnBugs();
     }, 1500);
   }
   
   // Spawn new bugs
   spawnBugs() {
     if (!this.gameActive) return;
     
     // Keep track of total bugs spawned
     const totalBugsSpawned = this.bugsKilled + this.bugs.length;
     
     // If we've already spawned all 30 bugs or reached max on screen, just check again later
     if (totalBugsSpawned >= this.bugsToKill || this.bugs.length >= this.settings.maxBugsOnScreen) {
       setTimeout(() => this.spawnBugs(), this.settings.spawnRate);
       return;
     }
     
     // Calculate how many bugs we can still spawn (out of 30 total)
     const bugsRemaining = this.bugsToKill - totalBugsSpawned;
     
     // Determine how many bugs to spawn (1-4, but more at the start)
     const initialSpawn = totalBugsSpawned < 5;
     const maxToSpawn = initialSpawn ? 8 : 4;
     const bugsToSpawn = Math.min(
       1 + Math.floor(Math.random() * maxToSpawn),  
       this.settings.maxBugsOnScreen - this.bugs.length,
       bugsRemaining
     );
     
     // Spawn the bugs
     for (let i = 0; i < bugsToSpawn; i++) {
       const type = this.getRandomBugType();
       const bug = this.createBug(type);
       this.bugs.push(bug);
       this.activeBugCount++;
     }
     
     // Update bugs left display
     this.updateBugsLeftDisplay();
     
     // Schedule next spawn
     const nextSpawnTime = initialSpawn ? 200 : this.settings.spawnRate; // Faster spawn at start
     setTimeout(() => this.spawnBugs(), nextSpawnTime);
   }
   
   // Get a random bug type based on probabilities
   getRandomBugType() {
     const rand = Math.random();
     
     if (rand < 0.15) return 'wasp';       // 15% chance
     if (rand < 0.40) return 'bigfly';     // 25% chance - increased big bugs
     if (rand < 0.65) return 'gnat';       // 25% chance
     return 'fly';                         // 35% chance
   }
   
   // Create a bug with animation and movement
   createBug(type) {
     // Choose a random spawn point
     const spawnPoint = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
     
     // Create bug element
     const bugEl = this.createEl('div', {
       className: `bug ${type}`
     });
     
     // Movement properties
     let x = spawnPoint.x;
     let y = spawnPoint.y;
     let xDir, yDir;
     
     // Set direction based on spawn point
 switch(spawnPoint.direction) {
   case 'right': xDir = 1; yDir = Math.random() > 0.5 ? 1 : -1; break;
   case 'left': xDir = -1; yDir = Math.random() > 0.5 ? 1 : -1; break;
   case 'down': yDir = 1; xDir = Math.random() > 0.5 ? 1 : -1; break;
   case 'up': yDir = -1; xDir = Math.random() > 0.5 ? 1 : -1; break;
   case 'diagonal-right-down': xDir = 1; yDir = 1; break;
   case 'diagonal-left-down': xDir = -1; yDir = 1; break;
   case 'diagonal-right-up': xDir = 1; yDir = -1; break;
   case 'diagonal-left-up': xDir = -1; yDir = -1; break;
 }
 
 // Add slight randomness to directions for more natural movement
 xDir += (Math.random() - 0.5) * 0.3;
 yDir += (Math.random() - 0.5) * 0.3;
     
     // Speed based on bug type with more variance
 const speed = (0.4 + Math.random() * 0.8) * this.bugTypes[type].speed;
 let xSpeed = speed * (xDir || 0.5);
 let ySpeed = speed * (yDir || 0.5);
     
 // Select a movement pattern like in original code
 const patterns = [
   {sin: 180, cos: 160}, 
   {sin: 270, cos: 360}, 
   {sin: 180, cos: 360}, 
   {sin: 270, cos: 270}, 
   {sin: 360, cos: 360}
 ];
 const pattern = patterns[Math.floor(Math.random() * patterns.length)];
     
 // Movement angle and size
 let angle = 0;
 const angleSpeed = (Math.random() * 0.3 + 0.2) * (Math.random() > 0.5 ? 1 : -1);
 const radius = 30 + Math.random() * 40; // Larger movement patterns
     
     // Movement interval
     const interval = setInterval(() => {
       if (!this.gameActive) {
         clearInterval(interval);
         return;
       }
       
       // Calculate position using sine/cosine for original pattern
       const left = radius * Math.sin(angle * Math.PI/pattern.sin) + x;
       const top = radius * Math.cos(angle * Math.PI/pattern.cos) + y;
       
       // Update position
       x += xSpeed;
       y += ySpeed;
       
       // Bounce off edges with direction change
       if (x <= 0) {
         xDir = 1;
         xSpeed = Math.abs(xSpeed);
       } else if (x >= window.innerWidth - 50) {
         xDir = -1;
         xSpeed = -Math.abs(xSpeed);
       }
       
       if (y <= 0) {
         yDir = 1;
         ySpeed = Math.abs(ySpeed);
       } else if (y >= window.innerHeight - 50) {
         yDir = -1;
         ySpeed = -Math.abs(ySpeed);
       }
       
       // Update angle for the movement pattern
       angle += angleSpeed;
       
       // Calculate final position and apply
       const pos_left = Math.max(0, Math.min(window.innerWidth, left));
       const pos_top = Math.max(0, Math.min(window.innerHeight, top));
       bugEl.style.left = `${pos_left}px`;
       bugEl.style.top = `${pos_top}px`;
     }, 20);
     
     return {
       element: bugEl,
       type: type,
       interval: interval,
       position: { x, y },
       properties: this.bugTypes[type],
       isDead: false
     };
   }
   
   // Create a gas cloud
   createGasCloud(x, y, size = 1) {
     // Create a more natural-looking cloud shape
     const cloudSize = 10 + Math.random() * 20 * size;
     
     // Create vibrant green color variations for toxic gas look
     const greenHue = 100 + Math.floor(Math.random() * 20); // More intense green
     const saturation = 95 + Math.floor(Math.random() * 5); // Very saturated
     const lightness = 45 + Math.floor(Math.random() * 15); // Bright but not too light
     
     // Create cloud element
     const cloudEl = this.createEl('div', {
       className: 'gas-particle',
       style: {
         left: `${x}px`,
         top: `${y}px`,
         width: `${cloudSize}px`,
         height: `${cloudSize}px`,
         backgroundColor: `hsla(${greenHue}, ${saturation}%, ${lightness}%, 0.9)`, // More opaque
         opacity: 0.9 + Math.random() * 0.1
       }
     });
     
     // Cloud physics properties - with slight downward drift
     const cloud = {
       element: cloudEl,
       x: x,
       y: y,
       size: cloudSize,
       // Random velocity in all directions, but with gravity pulling down
       vx: (Math.random() - 0.5) * 2 * size,
       vy: (Math.random() * 1 - 0.2) * size, // Slight initial upward drift
       opacity: 0.9 + Math.random() * 0.1,
       fadeSpeed: 0.001 + Math.random() * 0.002 // Very slow fade for long-lasting clouds
     };
     
     // Add to gas clouds array
     this.gasClouds.push(cloud);
     
     // Limit number of clouds for performance
     if (this.gasClouds.length > this.settings.maxClouds) {
       const removeCount = this.gasClouds.length - this.settings.maxClouds;
       for (let i = 0; i < removeCount; i++) {
         if (this.gasClouds[i] && this.gasClouds[i].element) {
           this.gasClouds[i].element.remove();
         }
       }
       this.gasClouds.splice(0, removeCount);
     }
     
     return cloud;
   }
   
   // Create spray effect when mouse is down
   startSpray(x, y) {
     if (!this.gameActive) return;
     
     this.isMouseDown = true;
     this.spraySize = 1;
     
     // Initial spray
     this.spray(x, y);
     
     // Continuous spray while mouse is down
     this.sprayInterval = setInterval(() => {
       if (this.isMouseDown) {
         // Increase spray size over time (max 3x)
         this.spraySize = Math.min(this.spraySize + 0.2, 3);
         this.spray(this.cursorPos.x, this.cursorPos.y);
       } else {
         this.stopSpray();
       }
     }, 100); // Faster intervals for smoother effect
   }
   
   // Stop spray when mouse is up
   stopSpray() {
     this.isMouseDown = false;
     if (this.sprayInterval) {
       clearInterval(this.sprayInterval);
       this.sprayInterval = null;
     }
     this.cursor.classList.remove('spray');
   }
   
   // Create spray effect and handle hits
   spray(x, y) {
     if (!this.gameActive || this.gasLeft <= 0) {
       this.stopSpray();
       return;
     }
     
     // Use gas based on spray size
     const gasUsed = this.settings.gasCostPerSpray * this.spraySize;
     this.gasLeft -= gasUsed;
     
     if (this.gasLeft <= 0) {
       this.gasLeft = 0;
       this.endGame('out-of-gas');
       return;
     }
     
     // Update gas meter
     this.updateGasDisplay();
     
     // Animate spray can
     this.cursor.classList.add('spray');
     
     // Create gas clouds for realistic effect
     const cloudCount = Math.floor(20 * this.spraySize); // More clouds for bigger spray
     
     // Spray nozzle position (tip of wand)
 const nozzleX = x - 20; // Offset to the left slightly
 const nozzleY = y - 150; // Position higher up to match wand tip
     
     for (let i = 0; i < cloudCount; i++) {
       // Spray cone shape with downward bias
       const angle = -Math.PI/2 + (Math.random() - 0.5) * Math.PI/2; // Wider spray cone
       const distance = 20 + Math.random() * 30 * this.spraySize;
       const cloudX = nozzleX + Math.cos(angle) * distance;
       const cloudY = nozzleY + Math.sin(angle) * distance;
       
       this.createGasCloud(cloudX, cloudY, this.spraySize);
     }
     
     // Check for bug hits
     this.checkHits(x, y);
   }
   
   // Check for bug hits from active gas clouds
   checkCloudHits() {
     // Only check every few frames for performance
     if (Math.random() > 0.3) return;
     
     for (let i = 0; i < this.bugs.length; i++) {
       const bug = this.bugs[i];
       if (!bug.element || bug.isDead) continue;
       
       const rect = bug.element.getBoundingClientRect();
       const bugX = rect.left + rect.width / 2;
       const bugY = rect.top + rect.height / 2;
       
       // Check if bug is in any gas cloud
       for (const cloud of this.gasClouds) {
         const dx = bugX - cloud.x;
         const dy = bugY - cloud.y;
         const distance = Math.sqrt(dx * dx + dy * dy);
         
         // If bug is in cloud, kill it
         if (distance < cloud.size + 10) {
           this.killBug(bug, cloud.x, cloud.y);
           break;
         }
       }
     }
   }
   
   // Check for direct hits from spray
   checkHits(x, y) {
     // Spray radius increases with spray size
     const hitRadius = 60 * this.spraySize;
     
     // Find bugs within radius
     const hitBugs = this.bugs.filter(bug => {
       if (!bug.element || bug.isDead) return false;
       
       const rect = bug.element.getBoundingClientRect();
       const bugX = rect.left + rect.width / 2;
       const bugY = rect.top + rect.height / 2;
       
       const dx = bugX - x;
       const dy = bugY - y;
       const distance = Math.sqrt(dx * dx + dy * dy);
       
       return distance < hitRadius;
     });
     
     if (hitBugs.length === 0) return;
     
     // Process all hit bugs
     hitBugs.forEach(bug => {
       this.killBug(bug, x, y);
     });
   }
   
   // Kill a bug and handle scoring
   killBug(bug, x, y) {
     // Check if bug is already dead
     if (bug.isDead) return;
     
     // Mark as dead to prevent double-counting
     bug.isDead = true;
     
     // Add points
     this.score += bug.properties.points;
     this.bugsKilled++;
     
     // Update displays
     this.updateDisplays();
     
     // Show point value
     this.showFloatingText(bug.properties.points, x, y - 20, 'points-text');
     
     // Create "death cloud" - bug emits green gas as it dies
     const rect = bug.element.getBoundingClientRect();
     const bugX = rect.left + rect.width / 2;
     const bugY = rect.top + rect.height / 2;
     
     // Create death cloud around the bug
     for (let i = 0; i < 30; i++) {
       const particleX = bugX + (Math.random() - 0.5) * 40;
       const particleY = bugY + (Math.random() - 0.5) * 40;
       this.createGasCloud(particleX, particleY, 0.8);
     }
     
     // Mark bug as dead
     bug.element.classList.add('dead');
     clearInterval(bug.interval);
     
     // Decrease active bug count
     this.activeBugCount--;
     
     // Schedule bug removal
     setTimeout(() => {
       if (bug.element) {
         bug.element.remove();
         const index = this.bugs.indexOf(bug);
         if (index !== -1) this.bugs.splice(index, 1);
       }
     }, 1000);
     
     // Check for win condition - end when all 30 bugs have been killed
   if (this.bugsKilled >= this.bugsToKill) {
     this.endGame('complete');
   }
   }
   
   // Update all UI displays
   updateDisplays() {
     // Update score
     this.scoreDisplay.innerHTML = `<i class="fas fa-trophy"></i>SCORE: ${this.score}`;
     
     // Update high score
     this.highScoreDisplay.innerHTML = `<i class="fas fa-award"></i>HI-SCORE: ${Math.max(this.score, this.highScore)}`;
     
     // Update bugs left display
     this.updateBugsLeftDisplay();
     
     // Update gas display
     this.updateGasDisplay();
   }
   
   // Update bugs left display
   updateBugsLeftDisplay() {
     const bugsLeft = this.bugsToKill - this.bugsKilled;
     this.bugsLeftDisplay.innerHTML = `<i class="fas fa-bug"></i>BUGS LEFT: ${Math.max(0, bugsLeft)}`;
     
     // Change color when almost done
     if (bugsLeft <= 5) {
       this.bugsLeftDisplay.querySelector('i').style.color = '#00ff00';
     } else {
       this.bugsLeftDisplay.querySelector('i').style.color = '#90ee90';
     }
   }
   
   // Update gas meter
 updateGasDisplay() {
   // Update only the percentage text
   const gasPercentage = Math.floor(this.gasLeft);
   const formattedGas = gasPercentage.toString().padStart(3, '0') + '%';
   this.gasPercentage.textContent = formattedGas;
   
   // Update the meter width
   this.gasMeter.style.width = `${this.gasLeft}%`;
   
   // Change color based on gas level
   if (this.gasLeft <= 20) {
     this.gasMeter.style.background = 'linear-gradient(to right, #ff4500, #ff8c00)';
   } else if (this.gasLeft <= 50) {
     this.gasMeter.style.background = 'linear-gradient(to right, #ffd700, #ffff00)';
   } else {
     this.gasMeter.style.background = 'linear-gradient(to right, #00cc00, #00ff00)';
   }
 }
   
   // Show floating text (points or gas)
   showFloatingText(text, x, y, className) {
     const textEl = this.createEl('div', {
       className: className,
       textContent: `+${text}`,
       style: { left: `${x}px`, top: `${y}px` }
     });
     
     // Remove after animation
     setTimeout(() => textEl.remove(), 1000);
   }
   
   // Show combo text
   showComboText(x, y, count) {
     const comboText = this.createEl('div', {
       className: 'combo-text',
       innerHTML: `<i class="fas fa-bolt"></i>${count}x COMBO!`,
       style: { left: `${x}px`, top: `${y}px` }
     });
     
     setTimeout(() => {
       comboText.style.opacity = '0';
       comboText.style.transform = 'translateY(-30px)';
       setTimeout(() => comboText.remove(), 500);
     }, 1000);
   }
   
   // End the game
 endGame(reason) {
     this.gameActive = false;
     
     // Remove game-active class from body to restore cursor
     document.body.classList.remove('game-active');
     
     // Clear any intervals
     if (this.sprayInterval) {
       clearInterval(this.sprayInterval);
       this.sprayInterval = null;
     }
     
     // Calculate gas preservation bonus
     let gasPreservationBonus = 0;
     if (reason === 'complete') {
       gasPreservationBonus = Math.floor(this.gasLeft * this.settings.gasPreservationBonus);
       this.score += gasPreservationBonus;
     }
     
     // Update high score
     if (this.score > this.highScore) {
       this.highScore = this.score;
       localStorage.setItem('bugspray_highscore', this.highScore);
     }
     
     // Show game over screen
     this.showGameOver(reason, gasPreservationBonus);
   }
   
   // Show game over screen
   showGameOver(reason, gasBonus = 0) {
     // Determine title based on reason
     const title = reason === 'complete' ? 'MISSION COMPLETE!' : 'OUT OF GAS!';
     const subtitle = reason === 'complete' 
       ? 'All bugs exterminated!' 
       : 'You ran out of fumigation spray!';
     
     // Calculate completion percentage
     const completion = Math.floor((this.bugsKilled / this.bugsToKill) * 100);
     
     // Create game over screen with bonus info
     let gameOverHTML = `
       <h2><i class="fas fa-${reason === 'complete' ? 'check-circle' : 'times-circle'}"></i> ${title}</h2>
       <p>${subtitle}</p>
       <p><i class="fas fa-trophy"></i> YOUR SCORE: <strong>${this.score}</strong></p>
       <p><i class="fas fa-award"></i> HIGH SCORE: <strong>${this.highScore}</strong></p>
       <p><i class="fas fa-bug"></i> BUGS KILLED: <strong>${this.bugsKilled}/${this.bugsToKill}</strong> (${completion}%)</p>
       <p><i class="fas fa-gas-pump"></i> GAS REMAINING: <strong>${Math.floor(this.gasLeft)}%</strong></p>`;
     
     // Add gas preservation bonus if applicable
     if (gasBonus > 0) {
       gameOverHTML += `<p><i class="fas fa-plus-circle"></i> GAS BONUS: <strong>+${gasBonus}</strong></p>`;
     }
     
     // Add play again button
     gameOverHTML += `<button class="play-btn"><i class="fas fa-redo"></i>SPRAY AGAIN</button>`;
     
     // Create game over element
     const gameOver = this.createEl('div', {
       className: 'game-over',
       innerHTML: gameOverHTML
     });
     
     // Add event listener to play button
     gameOver.querySelector('.play-btn').addEventListener('click', () => {
       gameOver.remove();
       this.startGame();
     });
   }
   
   // Event Handlers
   handleMouseMove(event) {
     // Store the cursor position
     const x = event.clientX;
     const y = event.clientY;
     
     // Position the wand image to serve as the cursor
     // Adjust the offsets to position the tip of the wand at the mouse position
     this.cursor.style.left = `${x - 40}px`;
     this.cursor.style.top = `${y - 250}px`;
     
     // Store current position for spray effects
     this.cursorPos = { x, y };
     
     // If mouse is down, continue spray at new position
     if (this.isMouseDown && this.gameActive) {
       this.spray(x, y);
     }
   }
   
   handleTouchMove(event) {
     event.preventDefault();
     const touch = event.touches[0];
     const x = touch.clientX;
     const y = touch.clientY;
     
     // Update cursor position with correct offset for touch devices
 this.cursor.style.left = `${x - 43}px`; // Same offset as mouse for consistency
 this.cursor.style.top = `${y - 280}px`; // Position wand tip near touch point
     
     // Store current position for spray
     this.cursorPos = { x, y };
     
     // If touch is active, continue spray
     if (this.isMouseDown && this.gameActive) {
       this.spray(x, y);
     }
   }
   
   handleMouseDown(event) {
     if (!this.gameActive) return;
     
     const x = event.touches ? event.touches[0].clientX : event.clientX;
     const y = event.touches ? event.touches[0].clientY : event.clientY;
     
     // Update stored position
     this.cursorPos = { x, y };
     
     this.startSpray(x, y);
   }
   
   handleMouseUp() {
     this.stopSpray();
   }
 }
 
 // Initialize game when DOM is loaded
 document.addEventListener('DOMContentLoaded', () => {
   new BugSprayGame();
 });