/*
RetroVox PC controls 9/24/2019

This file will contain all the keyboard / mouse controls 
*/

cursor_sendData = function(){
	meshWorker.worker.postMessage({
		id : 'cursorData',
		buildStrength : controls.buildStrength,
		buildType : controls.buildType,
	});
}

var viewDistanceSlider = document.getElementById('viewDistance');
var viewDistanceOutput = document.getElementById('viewDistanceOutput');
viewDistanceSlider.oninput = function(){
	renderSettings.viewDistance.XY = this.value;
	renderSettings.viewDistance.Z = this.value;
	viewDistanceOutput.innerHTML = "View Distance: "+this.value;
}

var resolutionSlider = document.getElementById('resolution');
var resolutionOutput = document.getElementById('resolutionOutput');
resolutionSlider.oninput = function(){
	renderSettings.resolution = this.value / 100;
	resolutionOutput.innerHTML = "Resolution: "+this.value+'%';
}

var sectorDelaySlider = document.getElementById('sectorDelay');
var sectorDelayOutput = document.getElementById('sectorDelayOutput');
sectorDelaySlider.oninput = function(){
	
	meshWorker.worker.postMessage({
		id : 'sectorDelay',
		delay : this.value,
	});
	sectorDelayOutput.innerHTML = "Sector Delay: "+this.value+'ms';
}

var processDistanceSlider = document.getElementById('processDistance');
var processDistanceOutput = document.getElementById('processDistanceOutput');
processDistanceSlider.oninput = function(){
	
	meshWorker.worker.postMessage({
		id : 'processDistance',
		distance : this.value,
	});
	processDistanceOutput.innerHTML = "Process Distance: "+this.value;
}




var loadMap = document.getElementById('loadMap');


//On file change for the map loading
loadMap.onchange=function(e){
	//Reset all chunk/sector data
	chunk = [];
	sector = [];
	activeChunks=[];
	activeSectors=[];
	mesh_start();
	
  var fileToLoad = loadMap.files[0];
  var fileReader = new FileReader();
  fileReader.onload = function(fileLoadedEvent){
      meshWorker.worker.postMessage({
		id : 'loadMap',
		text: fileLoadedEvent.target.result,
	  });
  };

  fileReader.readAsText(fileToLoad, "UTF-8");
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
	
	
	if(controls.keys['-'] || controls.keys['_']){
		if(controls.buildStrength>2){
			controls.buildStrength-=1;
		}
	}
	
	if(controls.keys['='] || controls.keys['+']){
		if(controls.buildStrength<20){
			controls.buildStrength+=1;
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

	
}