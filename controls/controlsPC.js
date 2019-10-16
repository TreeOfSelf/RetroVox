/*
RetroVox PC controls 9/24/2019

This file will contain all the keyboard / mouse controls 
*/



//Object containing the keyboard controls 
var controls = {
	//Key array, index is a string of the key, value 0 = not pressed 1 = pressed
	keys : [],
	//Position to build block at A.K.A cursor
	cursorPosition : [0,0,0],
	//Chunk of the cursor used to displace the cursor builds
	cursorChunk : [0,0,0],
	//Distance of cursor to camera 
	cursorDistance : 1,
	//Size of delete cursor
	deleteAmount : 5,
	//Size of create cursor
	createAmount : 5,
}



//Key press event
document.onkeydown=function(e){
	e =  e || window.event;
	e.preventDefault(); e.stopPropagation();
	
	//wireframe toggle
	if(e.key=='n' || e.key=='N'){
		if(renderSettings.wireframe==0){renderSettings.wireframe=1;
		}else{renderSettings.wireframe=0;}
	}
	
	//orthographic toggle
	if(e.key=='l' || e.key=='L'){
		if(renderSettings.orthographic==0){renderSettings.orthographic=1;
		}else{renderSettings.orthographic=0;}
	}
	
	//reset position
	if(e.key=='r' || e.key=='R'){
		player.position=defaultPosition.slice();
		player.rotation=[0,0];
	}
	
	
	//Full screen
	if(e.key=='Enter'){canvas.requestFullscreen();}
	
	
	//Make key upper case in our key array
	//So we don't have to check for uppercase or not.
	controls.keys[e.key.toUpperCase()]=1;
}

//Key up (release)
document.body.onkeyup=function(e){
	controls.keys[e.key.toUpperCase()]=0;
}


//Pointer lock
canvas.requestPointerLock = canvas.requestPointerLock ||canvas.mozRequestPointerLock;
canvas.addEventListener('click', function() {canvas.requestPointerLock(); }, false);

//Mouse look
canvas.addEventListener('mousemove', function(e) {
	//If pointer is locked
	if(document.pointerLockElement === canvas ||document.mozPointerLockElement === canvas) {
	   
		//Move camera rotations depending on mouse X&Y
		player.rotation[0]+=e.movementX*0.004;
		player.rotation[1]+=e.movementY*0.004;
	
	} 
}, false);

//Scroll wheel 
canvas.addEventListener('wheel', function(e) {
	//Prevent zooming while holding control
	e.preventDefault();	
	//Zoom orthographic view
	if(renderSettings.orthographic==1){
		renderSettings.zoom+=(e.deltaY*0.001)*renderSettings.zoom;
		if(renderSettings.zoom<1){
			renderSettings.zoom=1;
	}
	//Move cursor distance
	}else{
		controls.cursorDistance-=(e.deltaY*0.001)*controls.cursorDistance;		
	}
});




//Function ran every frame to check keyboard controls
keyboard_controls = function(){
	
	if(controls.keys['SHIFT']!=1){
		player.acceleration = 0.005;
	}else{
		player.acceleration = 0.015;		
	}
	
	//WASD MOVEMENT
	if(controls.keys['W']==1){
		player.momentum[0]-=player.acceleration;
	}
	if(controls.keys['S']==1){
		player.momentum[0]+=player.acceleration;
	}
	if(controls.keys['A']==1){
		player.momentum[1]-=player.acceleration;
	}
	if(controls.keys['D']==1){
		player.momentum[1]+=player.acceleration;
	}
	
	//ARROW KEY LOOKING
	if(controls.keys['ARROWUP']==1){
		player.rotation[1]-=0.01;
	}
	if(controls.keys['ARROWDOWN']==1){
		player.rotation[1]+=0.01;
	}
	if(controls.keys['ARROWLEFT']==1){
		player.rotation[0]-=0.01;
	}
	if(controls.keys['ARROWRIGHT']==1){
		player.rotation[0]+=0.01;
	}
	
	//Vertical movement
	if(controls.keys['O']==1){
		player.position[2]-=0.1;
	}
	if(controls.keys['P']==1){
		player.position[2]+=0.1;
	}
	
	//Build key
	if(controls.keys['E']==1){
		
		var blockLocation = [(Math.round(controls.cursorPosition[0]+controls.cursorChunk[0]*2)) - (controls.cursorChunk[0]*blockSettings.chunk.XYZ), (Math.round(controls.cursorPosition[1]+controls.cursorChunk[1]*2)) - (controls.cursorChunk[1]*blockSettings.chunk.XYZ),(Math.round(controls.cursorPosition[2]+controls.cursorChunk[2]*2)) - (controls.cursorChunk[2]*blockSettings.chunk.XYZ)]
		

		switch(blockLocation[0]){
				case 0:
					controls.cursorPosition[0]-=2;
				break;
		}
		switch(blockLocation[1]){
				case 0:
					controls.cursorPosition[1]-=2;
				break;
		}
		switch(blockLocation[2]){
				case 0:
					controls.cursorPosition[2]-=2;
				break;
		}

		//console.log("CONTORL",blockLocation,[Math.round(controls.cursorPosition[0]+controls.cursorChunk[0]*2),Math.round(controls.cursorPosition[1]),Math.round(controls.cursorPosition[2])],controls.cursorChunk);
		
		
		block_change(Math.round(controls.cursorPosition[0]+controls.cursorChunk[0]*2),Math.round(controls.cursorPosition[1]+controls.cursorChunk[1]*2),Math.round(controls.cursorPosition[2]+controls.cursorChunk[2]*2),0);
	}
	
}