class Quiz {
   constructor() {
     this.questions = [
       {
         question: "Name the planet known as the 'Red Planet':",
         answers: ["Mars", "Venus", "Jupiter", "Saturn"],
         correct: 0
       },
       {
         question: "How many planets are in our solar system?",
         answers: ["8", "9", "7", "10"],
         correct: 0
       },
       {
         question: "First man-made object to leave the solar system:",
         answers: ["Voyager", "Apollo", "Sputnik", "Hubble"],
         correct: 0
       },
       {
         question: "Largest moon in our solar system:",
         answers: ["Ganymede", "Titan", "Luna", "Io"],
         correct: 0
       },
       {
         question: "Year when humans first walked on the Moon:",
         answers: ["1969", "1971", "1965", "1973"],
         correct: 0
       },
       {
         question: "Galaxy containing our solar system:",
         answers: ["Milky Way", "Andromeda", "Triangulum", "Centaurus"],
         correct: 0
       },
       {
         question: "Coldest planet in our solar system:",
         answers: ["Neptune", "Uranus", "Pluto", "Saturn"],
         correct: 0
       },
       {
         question: "NASA's current Mars rover:",
         answers: ["Perseverance", "Curiosity", "Opportunity", "Spirit"],
         correct: 0
       },
       {
         question: "Number of people who have walked on the Moon:",
         answers: ["12", "7", "15", "20"],
         correct: 0
       },
       {
         question: "Nearest star to our solar system:",
         answers: [
           "Proxima Centauri",
           "Sirius",
           "Alpha Centauri A",
           "Betelgeuse"
         ],
         correct: 0
       }
     ];
     this.currentQuestion = 0;
     this.score = 0;
   }
 
   getCurrentQuestion() {
     return this.questions[this.currentQuestion];
   }
 
   checkAnswer(answerIndex) {
     const correct =
       this.questions[this.currentQuestion].correct === answerIndex;
     this.score += correct ? 10 : -5;
     this.currentQuestion++;
     return correct;
   }
 
   isGameOver() {
     return this.currentQuestion >= this.questions.length;
   }
 }
 
 class Trail {
   constructor(options) {
     this.x = options.x;
     this.y = options.y;
     this.width = 12;
     this.height = 10;
     this.moveSpeed = getRandom(5, 10);
     this.shrinkSpeed = getRandom(0.1, 0.2);
     this.fadeSpeed = 0.05;
     this.opacity = 1;
     this.el = this.createElement(options.parentContainer);
   }
 
   createElement(parentContainer) {
     const el = $("<div class='trail-point'></div>");
     parentContainer.append(el);
     return el;
   }
 
   update() {
     this.el.css({
       left: this.x,
       top: this.y,
       opacity: this.opacity,
       width: this.width,
       height: this.height
     });
     this.x -= this.moveSpeed;
     this.opacity -= this.fadeSpeed;
     this.width -= this.shrinkSpeed;
     this.height -= this.shrinkSpeed;
 
     if (this.width <= 0 || this.opacity <= 0) {
       this.el.remove();
       this.delete = true;
     }
   }
 }
 
 class Bullet {
   constructor(options) {
     this.x = options.x;
     this.y = options.y;
     this.speed = 13;
     this.width = 25;
     this.height = 15;
     this.dir = options.dir;
     this.game = options.game;
     this.el = this.createElement(options.parentContainer);
     options.startUpdating(this.update.bind(this));
   }
 
   createElement(parentContainer) {
     const el = $("<div class='bullet'></div>");
     parentContainer.append(el);
     el.css({
       left: this.x,
       top: this.y,
       width: this.width,
       height: this.height,
       transform: `translateX(-50%) translateY(-50%) rotate(${this.dir}rad)`
     });
     this.createFlash(parentContainer);
     return el;
   }
 
   createFlash(parentContainer) {
     const el = $("<div class='flash'></div>");
     el.css({
       position: "absolute",
       top: this.y,
       left: this.x,
       borderRadius: "50%",
       width: 35,
       height: 35,
       background: "#FFFED1",
       transform: "translate(-50%, -50%)"
     });
     parentContainer.append(el);
     setTimeout(() => el.remove(), 5);
   }
 
   update() {
     this.x += Math.cos(this.dir) * this.speed;
     this.y += Math.sin(this.dir) * this.speed;
     this.el.css({
       left: this.x,
       top: this.y,
       transform: `translateY(-50%) rotate(${this.dir}rad)`
     });
     this.checkCollision();
   }
 
   checkCollision() {
     $(".answer").each((index, answer) => {
       const rect = answer.getBoundingClientRect();
       if (
         this.x >= rect.left &&
         this.x <= rect.right &&
         this.y >= rect.top &&
         this.y <= rect.bottom
       ) {
         this.game.checkAnswer(index, { x: this.x, y: this.y });
         this.el.remove();
         return false;
       }
     });
   }
 }
 
 class Player {
   constructor(options) {
     this.controls = options.controls;
     this.startUpdating = options.startUpdating;
     this.parentContainer = options.parentContainer;
     this.game = options.game;
     this.x = 150;
     this.y = window.innerHeight / 2;
     this.width = 100;
     this.height = 100;
     this.mouthHeight = 2;
     this.mouthShrinkSpeed = 1;
     this.xvel = 0;
     this.yvel = 0;
     this.friction = 0.9;
     this.speed = 1.5;
     this.rotation = 0;
     this.trail = [];
     this.trailTimer = 0;
     this.trailSpawnRate = 1;
     this.shootDown = false;
     this.el = this.createElement(options.parentContainer);
     this.startUpdating(this.update.bind(this));
   }
 
   createElement(parentContainer) {
     const el = $(`
             <div class='player'>
                 <img src="https://mattcannon.games/codepen/quiz/rocket2.gif" alt="Rocket Ship">
             </div>
         `);
     parentContainer.append(el);
     el.css({
       left: this.x,
       top: this.y,
       width: this.width,
       height: this.height
     });
     return el;
   }
 
   update() {
     this.y += this.yvel;
     this.x += this.xvel;
     this.xvel *= this.friction;
     this.yvel *= this.friction;
     this.rotation = this.yvel / 50;
 
     if (this.controls["up"].isDown) this.yvel -= this.speed;
     if (this.controls["down"].isDown) this.yvel += this.speed;
     if (this.controls["right"].isDown) this.xvel += this.speed;
     if (this.controls["left"].isDown) this.xvel -= this.speed;
 
     if (this.y < 0) this.y = 0;
     else if (this.y > window.innerHeight) this.y = window.innerHeight;
     if (this.x < 0) this.x = 0;
     else if (this.x > window.innerWidth) this.x = window.innerWidth;
 
     if (this.mouthHeight > 2) this.mouthHeight -= this.mouthShrinkSpeed;
     else this.mouthHeight = 2;
 
     if (this.controls["space"].isDown && !this.shootDown) {
       this.shoot();
       this.shootDown = true;
     }
     if (!this.controls["space"].isDown) this.shootDown = false;
 
     this.handleTrail();
     this.setValues();
   }
 
   handleTrail() {
     this.trailTimer++;
     if (this.trailTimer >= this.trailSpawnRate) {
       const backPosition = {
         x: this.x - Math.cos(this.rotation) * (this.width / 2),
         y: this.y - Math.sin(this.rotation) * (this.height / 2)
       };
       this.trail.push(
         new Trail({
           parentContainer: this.parentContainer,
           x: backPosition.x,
           y: backPosition.y
         })
       );
       this.trailTimer = 0;
     }
 
     for (let i = 0; i < this.trail.length; i++) {
       this.trail[i].update();
       if (this.trail[i].delete) {
         this.trail.splice(i, 1);
         i--;
       }
     }
   }
 
   shoot() {
     const position = {
       x: this.x + Math.cos(this.rotation) * (this.width / 2),
       y: this.y + Math.sin(this.rotation) * (this.height / 2)
     };
     new Bullet({
       parentContainer: this.parentContainer,
       dir: this.rotation,
       x: position.x,
       y: position.y,
       startUpdating: this.startUpdating,
       game: this.game
     });
     this.xvel -= Math.cos(this.rotation) * 3;
     this.yvel -= Math.sin(this.rotation) * 3;
     this.mouthHeight = 12;
   }
 
   setValues() {
     this.el.css({
       left: this.x,
       top: this.y,
       transform: `translateX(-50%) translateY(-50%) rotate(${this.rotation}rad)`
     });
   }
 }
 
 class Controls {
   constructor() {
     this.right = { isDown: false, keyCode: 39 };
     this.down = { isDown: false, keyCode: 40 };
     this.left = { isDown: false, keyCode: 37 };
     this.up = { isDown: false, keyCode: 38 };
     this.space = { isDown: false, keyCode: 32 };
 
     $(window).on("keydown", (e) => this.toggle(e.which, true));
     $(window).on("keyup", (e) => this.toggle(e.which, false));
   }
 
   toggle(keyCode, isDown) {
     const keys = ["left", "down", "right", "up", "space"];
     const key = keys.find((k) => this[k].keyCode === keyCode);
     if (key) this[key].isDown = isDown;
   }
 }
 
 class Game {
   constructor() {
     this.updateFuncs = [];
     this.container = $("#game-container");
     this.controls = new Controls();
     this.quiz = new Quiz();
     this.timeLeft = 20;
     this.canAnswer = true;
 
     // Load background and planets during intro screen
     this.createSpaceBackground();
 
     // Show intro screen with click-to-start
     this.showIntroScreen();
   }
 
   showIntroScreen() {
     // Display the intro screen and handle click to start the game
     const introContainer = $("#intro-container");
     const introImage = $("#intro-image");
 
     // Add a click event to hide the intro screen and start the game
     introImage.on("click", () => {
       introContainer.fadeOut(500, () => {
         // Start the game after intro screen fades out
         this.startGame();
       });
     });
   }
 
   startGame() {
     // Initialize player and start displaying elements after intro
     this.player = new Player({
       controls: this.controls,
       parentContainer: this.container,
       startUpdating: this.startUpdating.bind(this),
       game: this
     });
 
     // Show the game interface after the intro
     this.displayScore();
     this.displayQuestionCount();
     this.displayQuestion();
     this.update();
   }
   createSpaceBackground() {
     this.spaceBackground = $('<div id="space-background"></div>');
     this.container.append(this.spaceBackground);
 
     for (let layer = 0; layer < 3; layer++) {
       const starLayer = $(
         `<div class="star-layer" id="star-layer-${layer}"></div>`
       );
       this.spaceBackground.append(starLayer);
 
       for (let i = 0; i < 200; i++) {
         const star = $('<div class="star"></div>');
         star.css({
           left: Math.random() * 200 + "%",
           top: Math.random() * 100 + "%",
           opacity: Math.random() * 0.5 + 0.5
         });
         starLayer.append(star);
       }
     }
 
     const planetLayers = [
       {
         planets: [
           "https://mattcannon.games/codepen/quiz/pluto.png",
           "https://mattcannon.games/codepen/quiz/jupiter.png",
           "https://mattcannon.games/codepen/quiz/mars.png"
         ],
         sizeRange: [30, 60],
         animationDuration: "25s"
       },
       {
         planets: [
           "https://mattcannon.games/codepen/quiz/moon.png",
           "https://mattcannon.games/codepen/quiz/neptune.png"
         ],
         sizeRange: [60, 100],
         animationDuration: "15s"
       },
       {
         planets: [
           "https://mattcannon.games/codepen/quiz/earth.png",
           "https://mattcannon.games/codepen/quiz/uranus.png"
         ],
         sizeRange: [100, 150],
         animationDuration: "8s"
       }
     ];
 
     planetLayers.forEach((layer, layerIndex) => {
       layer.planets.forEach((planetUrl, planetIndex) => {
         const planet = $(
           `<div class="planet planet-${layerIndex}-${planetIndex}"></div>`
         );
         const planetSize =
           Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]) +
           layer.sizeRange[0];
         planet.css({
           left: Math.random() * window.innerWidth,
           top: Math.random() * window.innerHeight,
           width: planetSize,
           height: planetSize,
           backgroundImage: `url(${planetUrl})`,
           animationDuration: layer.animationDuration
         });
         this.spaceBackground.append(planet);
       });
     });
   }
 
   update() {
     this.updateFuncs.forEach((func) => func());
     window.requestAnimationFrame(this.update.bind(this));
   }
 
   startUpdating(func) {
     this.updateFuncs.push(func);
   }
 
   displayQuestion() {
     if (this.quiz.isGameOver()) {
       this.endGame();
       return;
     }
 
     const question = this.quiz.getCurrentQuestion();
     const questionEl = $(
       "<div class='question'>" + question.question + "</div>"
     );
     this.container.append(questionEl);
 
     const answerImages = [
       "https://mattcannon.games/codepen/quiz/astroid-a.png",
       "https://mattcannon.games/codepen/quiz/astroid-b.png",
       "https://mattcannon.games/codepen/quiz/astroid-c.png",
       "https://mattcannon.games/codepen/quiz/astroid-d.png"
     ];
 
     question.answers.forEach((answer, index) => {
       const answerEl = $(`
                 <div class='answer answer-${index}' data-index='${index}'>
                     <span class="answer-title">${answer}</span>
                 </div>
             `);
       answerEl.css({
         left: Math.random() * (window.innerWidth - 150) + 75,
         top: Math.random() * (window.innerHeight - 150) + 75,
         backgroundImage: `url(${answerImages[index]})`,
         backgroundSize: "cover",
         width: "100px",
         height: "100px",
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
         textAlign: "center",
         color: "#ffffff",
         fontWeight: "bold",
         borderRadius: "10px"
       });
       this.container.append(answerEl);
       this.floatAnswer(answerEl);
     });
 
     this.resetTimer();
     this.displayQuestionCount();
     this.canAnswer = true;
   }
 
   floatAnswer(answerEl) {
     const floatAnimation = () => {
       const newX = Math.random() * (window.innerWidth - 150) + 75;
       const newY = Math.random() * (window.innerHeight - 150) + 75;
       answerEl.animate(
         { left: newX, top: newY },
         5000,
         "linear",
         floatAnimation
       );
     };
     floatAnimation();
   }
 
   checkAnswer(answerIndex, bulletPosition) {
     if (!this.canAnswer) return; // Prevent multiple answers on the same question
     this.canAnswer = false; // Lock answering until current one is processed
 
     const question = this.quiz.getCurrentQuestion();
     const correctAnswerIndex = question.correct; // Fetch correct answer index
     const $answer = $(`.answer[data-index='${answerIndex}']`);
 
     console.log("Selected:", answerIndex, "Correct:", correctAnswerIndex); // Debugging log
 
     if (answerIndex === correctAnswerIndex) {
       // Correct answer
       this.quiz.score += 10; // Add points
       this.displayFeedback("Correct! +10", true, bulletPosition); // Display correct feedback
       $answer.css("animation", "correct 0.5s"); // Animate the correct answer
       setTimeout(() => {
         this.clearQuestion(); // Clear current question
         this.quiz.currentQuestion++; // Move to the next question
         if (!this.quiz.isGameOver()) {
           this.displayQuestion(); // Display the next question if the game isn't over
           this.canAnswer = true; // Re-enable answering for the new question
         } else {
           this.endGame(); // End game if no more questions
         }
       }, 1000);
     } else {
       // Incorrect answer
       this.quiz.score -= 5; // Subtract points
       this.displayFeedback("Incorrect! -5", false, bulletPosition); // Display incorrect feedback
       $answer.css("animation", "explode 0.5s forwards"); // Animate the explosion
       setTimeout(() => {
         $answer.remove(); // Remove wrong answer
         this.canAnswer = true; // Re-enable answering
       }, 500);
     }
 
     this.displayScore(); // Update the score display
   }
 
   displayFeedback(text, correct, position) {
     const feedbackEl = $("<div class='feedback'>" + text + "</div>");
     feedbackEl.css({
       left: position.x,
       top: position.y,
       color: correct ? "#00ff00" : "#ff0000"
     });
     this.container.append(feedbackEl);
     setTimeout(() => feedbackEl.remove(), 1000);
   }
 
   clearQuestion() {
     $(".question, .answer").remove(); // Clear out both the question and answers
   }
 
   startTimer() {
     this.timeLeft = 20;
     this.timerInterval = setInterval(() => {
       this.timeLeft--;
       if (this.timeLeft <= 0) {
         this.handleTimeUp();
       }
     }, 1000);
   }
 
   handleTimeUp() {
     clearInterval(this.timerInterval);
     this.displayFeedback("Time's up!", false, {
       x: window.innerWidth / 2,
       y: window.innerHeight / 2
     });
     setTimeout(() => {
       this.clearQuestion();
       this.quiz.currentQuestion++;
       if (!this.quiz.isGameOver()) {
         this.displayQuestion();
         this.startTimer();
       } else {
         this.endGame();
       }
     }, 1000);
   }
 
   resetTimer() {
     clearInterval(this.timerInterval);
     this.startTimer();
   }
 
   displayScore() {
     $(".score").remove();
     const scoreEl = $(
       "<div class='score'>Score: " + this.quiz.score + "</div>"
     );
     this.container.append(scoreEl);
   }
 
   displayQuestionCount() {
     $(".question-count").remove();
     const countEl = $(
       "<div class='question-count'>Question: " +
         (this.quiz.currentQuestion + 1) +
         "/10</div>"
     );
     this.container.append(countEl);
   }
 
   endGame() {
     const gameOverEl = $(
       "<div class='game-over'><p>Final Score: " + this.quiz.score + "</p></div>"
     );
     this.container.append(gameOverEl);
   }
 }
 
 function getRandom(min, max) {
   return Math.random() * (max - min) + min;
 }
 
 $(document).ready(function () {
   new Game();
 });
 