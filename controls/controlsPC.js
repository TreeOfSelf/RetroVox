/*
RetroVox PC controls 9/24/2019

This file will contain all the keyboard / mouse controls 
*/

cursor_sendData = function(){
	meshWorker.worker.postMessage({
		id : 'cursorData',
		buildStrength : controls.buildStrength,
		buildType : controls.buildType,
		cursorChunk : controls.cursorChunk,
		cursorFixedPosition : controls.cursorFixedPosition
	});
}






//Key press event
document.onkeydown=function(e){
	e =  e || window.event;
	e.preventDefault(); e.stopPropagation();

	//File save
	if(e.key=='F1'){
		meshWorker.worker.postMessage({
			id : 'mapSave',
		});
	}
	
	//Pressure decrease
	if(e.key=='[' || e.key=='{'){
		if(controls.buildAmount>1){
			controls.buildAmount--;
			cursor_set_shape();
		}
	}

	//Pressure increase
	if(e.key==']' || e.key=='}'){
		if(controls.buildAmount<blockSettings.chunk.XYZ/2-2){
			controls.buildAmount++;
			cursor_set_shape();
		}
	}
	
	//Sprint
	if(controls.keys['SHIFT']==0){
		//Select block type
		if(parseInt(e.key)>=0){
			controls.buildType = parseInt(e.key);
			controls.cursorChunkType.fill(parseInt(e.key));
			cursor_draw();
		}
	}else{
		//Select cursor shape
		
		var num = parseInt(e.code[5]);
		if(num>=0){
			controls.cursorShape=num;
			cursor_set_shape();
			}
		}
	
	//move light
	if(e.key=='j' || e.key=='J'){
		var lookPosition = [player.position[0]+Math.sin(player.rotation[0])*Math.cos(player.rotation[1]) , 
		player.position[1]+Math.cos(player.rotation[0])*-Math.cos(player.rotation[1]),
		player.position[2]+Math.sin(player.rotation[1])];
		light.pos = [player.position[0],-player.position[2],player.position[1]];
		light.look = [lookPosition[0],-lookPosition[2],lookPosition[1]]
	}
	
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
		if(controls.cursorDistance>10.0){
			controls.cursorDistance=10.0;
		}
		if(controls.cursorDistance<1){
			controls.cursorDistance=1;
		}
	}
});




//Function ran every frame to check keyboard controls
keyboard_controls = function(){
	
	
	if(controls.keys['-'] || controls.keys['_']){
		if(controls.buildStrength>2){
			controls.buildStrength-=0.1;
		}
	}
	
	if(controls.keys['='] || controls.keys['+']){
		if(controls.buildStrength<20){
			controls.buildStrength+=0.1;
		}
	}
	
	
	if(controls.keys['SHIFT']!=1){
		if(controls.keys['CONTROL']==1){
			player.acceleration = 0.01;		
		}else{
			player.acceleration = 0.03;
		}
	}else{
		player.acceleration = 0.07;
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
	
	if(controls.keys['[']==1){
		time-=10;
	}
	if(controls.keys[']']==1){
		time+=10;
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
		player.position[2]-=player.acceleration*20.0;
	}
	if(controls.keys['P']==1){
		player.position[2]+=player.acceleration*20.0;
	}
	
	//Single build key
	if(controls.keys['E']==1){
		meshWorker.worker.postMessage({
			id : 'blockChange',
			cursorList : controls.cursorString,
			buildType : 0,
			cursorPosition : controls.cursorPosition
		});
	}

	//Single delete key
	if(controls.keys['C']==1){
		meshWorker.worker.postMessage({
			id : 'blockChange',
			cursorList : controls.cursorString,
			buildType : 1,
			cursorPosition : controls.cursorPosition,
		});
	}
//Camera constraints
	if(player.rotation[1]>1.57){
		player.rotation[1]=1.57;
	}

	if(player.rotation[1]<-1.57){
		player.rotation[1]=-1.57;
	}
}