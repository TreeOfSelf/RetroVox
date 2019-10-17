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
	//Position in game space 
	cursorFixedPosition : [0,0,0],
	//Distance of cursor to camera 
	cursorDistance : 1,
	//Size of delete cursor
	deleteAmount : 3,
	//Size of build cursor
	buildAmount : 4,
	//Strength of delete cursor
	deleteStrength : 0.0025,
	//Strength of build cursor
	buildStrength : 0.005,
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
	
	//Single build key
	if(controls.keys['E']==1){
		block_build(controls.cursorPosition[0],controls.cursorPosition[1],controls.cursorPosition[2],0);
	}

	//Single delete key
	if(controls.keys['V']==1){
		block_build(controls.cursorPosition[0],controls.cursorPosition[1],controls.cursorPosition[2],1);	
	}
	
	//Cube build key
	if(controls.keys['T']==1){
		
		for(var xx=-controls.buildAmount ; xx<=controls.buildAmount ; xx++){
		for(var yy=-controls.buildAmount ; yy<=controls.buildAmount ; yy++){
		for(var zz=-controls.buildAmount ; zz<=controls.buildAmount ; zz++){
			block_build(controls.cursorPosition[0]+xx,controls.cursorPosition[1]+yy,controls.cursorPosition[2]+zz,0);
		}
		}
		}
	}
	
	
	//Cube delete key
	if(controls.keys['B']==1){
		
		for(var xx=-controls.deleteAmount ; xx<=controls.deleteAmount ; xx++){
		for(var yy=-controls.deleteAmount ; yy<=controls.deleteAmount ; yy++){
		for(var zz=-controls.deleteAmount ; zz<=controls.deleteAmount ; zz++){
			block_build(controls.cursorPosition[0]+xx,controls.cursorPosition[1]+yy,controls.cursorPosition[2]+zz,1);
		}
		}
		}
	}
	
	//Sphere build key
	if(controls.keys['F']==1){
		
		for(var xx=-controls.buildAmount ; xx<=controls.buildAmount ; xx++){
		for(var yy=-controls.buildAmount ; yy<=controls.buildAmount ; yy++){
		for(var zz=-controls.buildAmount ; zz<=controls.buildAmount ; zz++){
			var dist = distance_3d([controls.cursorPosition[0]+xx,controls.cursorPosition[1]+yy,controls.cursorPosition[2]+zz],controls.cursorPosition);
			if(dist<controls.buildAmount*1.2){
				block_build(controls.cursorPosition[0]+xx,controls.cursorPosition[1]+yy,controls.cursorPosition[2]+zz,0);
			}
		}
		}
		}
	}
	
	//Sphere delete key
	if(controls.keys['C']==1){
		
		for(var xx=-controls.deleteAmount ; xx<=controls.deleteAmount ; xx++){
		for(var yy=-controls.deleteAmount ; yy<=controls.deleteAmount ; yy++){
		for(var zz=-controls.deleteAmount ; zz<=controls.deleteAmount ; zz++){
			var dist = distance_3d([controls.cursorPosition[0]+xx,controls.cursorPosition[1]+yy,controls.cursorPosition[2]+zz],controls.cursorPosition);
			if(dist<controls.deleteAmount*1.2){
				block_build(controls.cursorPosition[0]+xx,controls.cursorPosition[1]+yy,controls.cursorPosition[2]+zz,1);
			}
		}
		}
		}
	}
	
	
}