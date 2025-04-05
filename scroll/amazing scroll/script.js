
function normalizeWheel(/*object*/ event) /*object*/ {
   var PIXEL_STEP = 10;
 var LINE_HEIGHT = 40;
 var PAGE_HEIGHT = 800;
   var sX = 0,
     sY = 0, // spinX, spinY
     pX = 0,
     pY = 0; // pixelX, pixelY
 
   // Legacy
   if ("detail" in event) {
     sY = event.detail;
   }
   if ("wheelDelta" in event) {
     sY = -event.wheelDelta / 120;
   }
   if ("wheelDeltaY" in event) {
     sY = -event.wheelDeltaY / 120;
   }
   if ("wheelDeltaX" in event) {
     sX = -event.wheelDeltaX / 120;
   }
 
   // side scrolling on FF with DOMMouseScroll
   if ("axis" in event && event.axis === event.HORIZONTAL_AXIS) {
     sX = sY;
     sY = 0;
   }
 
   pX = sX * PIXEL_STEP;
   pY = sY * PIXEL_STEP;
 
   if ("deltaY" in event) {
     pY = event.deltaY;
   }
   if ("deltaX" in event) {
     pX = event.deltaX;
   }
 
   if ((pX || pY) && event.deltaMode) {
     if (event.deltaMode === 1) {
       // delta in LINE units
       pX *= LINE_HEIGHT;
       pY *= LINE_HEIGHT;
     } else {
       // delta in PAGE units
       pX *= PAGE_HEIGHT;
       pY *= PAGE_HEIGHT;
     }
   }
 
   // Fall-back if spin cannot be determined
   if (pX && !sX) {
     sX = pX < 1 ? -1 : 1;
   }
   if (pY && !sY) {
     sY = pY < 1 ? -1 : 1;
   }
 
   return {
     spinX: sX,
     spinY: sY,
     pixelX: pX,
     pixelY: pY
   };
 }
 
 const getHeight = () => {
   var body = document.body,
     html = document.documentElement;
 
   var height = Math.max(
     body.scrollHeight,
     body.offsetHeight,
     html.clientHeight,
     html.scrollHeight,
     html.offsetHeight
   );
   return height;
 };
 let t1 = TweenLite;
 let curScroll = 0;
 const lineHeight = 150;
 let fullHeight = getHeight();
 let mainH = $(".main").height();
 let wH = window.innerHeight;
 let width = $(window).width();
 let isScrolling = false;
 let lastScroll = 0;
 let lastTime = 0;
 let topp = (wH - lineHeight) / 2;
 let factor =  $(window).height()/ lineHeight;
 let windowHeight = $(window).height();
 let maxScroll = (fullHeight - windowHeight)/factor;
 let clip = `rect(${topp}px,${width}px,${topp + lineHeight}px,0)`
 $(".nav ul").css("top", `${topp}px`);
 $(".nav__2").css('clip',clip)
 
 //     clip: rect(298px,1000px,471px,0);
 // }
 document.addEventListener("wheel", function(e) {
   if (!isScrolling) isScrolling = true;
   const norm = normalizeWheel(e);
   curScroll += norm.spinY * 50;
   if (curScroll > maxScroll) curScroll = maxScroll;
   if (curScroll <= 0) curScroll = 0;
   t1.to(".main", 0.5, {
     y: -curScroll*factor,
     overflow: 5,
     onUpdate: e => {
       TweenLite.to('.nav ul',.2,{
         y:-curScroll,
         overflow:5
       })
     },
     onComplete: e => {
       isScrolling = false;
       goToClosest();
     }
   });
 });
 
 
 
 
 function goToClosest(){
   const closest = Math.round((curScroll / lineHeight));
   goTo(closest);
 }
 
 
 function goTo(n){
   curScroll = n*lineHeight;
    t1.to(".main", 0.5, {
     y: -curScroll*factor,
     overflow: 5,
     onComplete: e => {
       isScrolling = false;
     }
   });
   
 }
 function Velocity(e) {
   if (isScrolling) {
     let speed = (curScroll - lastScroll) / (e - lastTime);
     if (speed < -5) speed = -5;
     if (speed > 5) speed = 5;
     TweenLite.to("li", 1, {
       skewY: -speed * 20
     });
     lastScroll = curScroll;
     lastTime = e;
   }
   window.requestAnimationFrame(Velocity);
 }
 
 Velocity();
 