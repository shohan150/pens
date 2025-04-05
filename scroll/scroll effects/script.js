let currentSec = 1;
let currentImg = 1;
let isAnimating = false;

$(document).ready(function(){
  $('body').on('mousewheel DOMMouseScroll', function(e){
  if(typeof e.originalEvent.detail == 'number' && e.originalEvent.detail !== 0) {
    if(e.originalEvent.detail > 0) {
      if(!isAnimating)mouseDown();
    } else if(e.originalEvent.detail < 0){
        if(!isAnimating)mouseUp();
    }
  } else if (typeof e.originalEvent.wheelDelta == 'number') {
    if(e.originalEvent.wheelDelta < 0) {
       if(!isAnimating)mouseDown();
    } else if(e.originalEvent.wheelDelta > 0) {
        if(!isAnimating)mouseUp();
    }
  }
});
});

function mouseDown(){
  if(currentSec!=5){
    isAnimating = true;
    currentSec++;
    if(currentSec!=1)$("#sec"+(currentSec-1)).css("top","-150px");
    $("#sec"+currentSec).css("top","0px");
    if($("#sec"+currentSec).hasClass("change")){
      currentImg++;
      $("#art"+currentImg).css("top","0px");
       if(currentImg!=1)$("#art"+(currentImg-1)).css("top","-150px");
    }
    setTimeout(function(){isAnimating = false;},700);
  }
}

function mouseUp(){
  if(currentSec!=1){  
     isAnimating = true;
     if(currentSec!=1)$("#sec"+(currentSec-1)).css("top","0px");
    $("#sec"+currentSec).css("top","100vh");
    if($("#sec"+currentSec).hasClass("change")){     
      $("#art"+currentImg).css("top","100vh");
       if(currentImg!=1)$("#art"+(currentImg-1)).css("top","0");
      currentImg--;
    }
    currentSec--;
    setTimeout(function(){isAnimating = false;},700);
  }
}