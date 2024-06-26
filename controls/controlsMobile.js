/*
RetroVox Mobile Controls 10/21/2019

This file contins  touchscreen controls for mobile devices
*/



//0 = Look , 1 = Move
var touchSet=0;
var lookPosStart =[0,0];
var movePosStart=[0,0];
var lookPosEnd =[0,0];
var movePosEnd=[0,0];

//Mobile
canvas.ontouchstart = function(e){
		canvas.requestFullscreen();
}

document.body.ontouchstart = function(e){
	
	e.preventDefault();

	//If there is more than one touch
	for(var k=0;k<e.changedTouches.length;k++){
		if(e.changedTouches[k].screenX>window.innerWidth/2){
			lookPosEnd =[e.changedTouches[k].screenX,e.changedTouches[k].screenY];
			lookPosStart =[e.changedTouches[k].screenX,e.changedTouches[k].screenY];
		}else{
			movePosEnd =[e.changedTouches[k].screenX,e.changedTouches[k].screenY];
			movePosStart =[e.changedTouches[k].screenX,e.changedTouches[k].screenY];		
		}
	}
}

document.body.ontouchmove = function(e){
	e.preventDefault();
	for(var k=0;k<e.touches.length;k++){
		if(e.touches[k].screenX>window.innerWidth/2){
			lookPosEnd =[e.touches[k].screenX,e.touches[k].screenY];
		}else{
			movePosEnd =[e.touches[k].screenX,e.touches[k].screenY];	
		}
	}
}

document.body.ontouchend = function(e){
	for(var k=0;k<e.changedTouches.length;k++){
		if(e.changedTouches[k].screenX>window.innerWidth/2){
			lookPosStart = [0,0];
			lookPosEnd = [0,0];
		}else{
			movePosStart = [0,0];
			movePosEnd = [0,0];
		}
	}
}


function mobile_controls() {

player.rotation[0]-= (lookPosStart[0]-lookPosEnd[0])*0.0004;
player.rotation[1]-= (lookPosStart[1]-lookPosEnd[1])*0.0004;

player.momentum[1]-= (movePosStart[0]-movePosEnd[0])*0.0004;
player.momentum[0]-= (movePosStart[1]-movePosEnd[1])*0.0004;
}
