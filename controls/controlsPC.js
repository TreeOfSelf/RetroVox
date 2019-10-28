/*
RetroVox PC controls 9/24/2019

This file will contain all the keyboard / mouse controls 
*/



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
      var textFromFileLoaded = fileLoadedEvent.target.result;
      var loadObject = JSON.parse(textFromFileLoaded);
	  //Loop through save object
	  for(var k = 0 ; k<loadObject.length; k++){
		  console.log(k+1+'/'+loadObject.length);
		  var chunkID = chunk_returnID(loadObject[k][0][0],loadObject[k][0][1],loadObject[k][0][2]);
		  chunk_create(loadObject[k][0][0],loadObject[k][0][1],loadObject[k][0][2]);
		  //Decompress data and flag chunk to reDraw
		  chunk[chunkID].blockArray = new Int8Array(LZString.decompress(loadObject[k][1]).split(','));
		  chunk[chunkID].blockType = new Uint8Array(LZString.decompress(loadObject[k][2]).split(','));
		  chunk[chunkID].flags.reDraw=1;
	  }
  };

  fileReader.readAsText(fileToLoad, "UTF-8");
}


//Key press event
document.onkeydown=function(e){
	e =  e || window.event;
	e.preventDefault(); e.stopPropagation();

	//File save
	if(e.key=='F1'){
		var saveArray = [];
		//Loop through active chunks
		for(var k = 0 ; k<activeChunks.length; k++){
			console.log(k+1+'/'+activeChunks.length);
			
			//Compress data and save to array
			var blockArray = LZString.compress(chunk[activeChunks[k]].blockArray.toString());
			var typeArray = LZString.compress(chunk[activeChunks[k]].blockType.toString());
			
			saveArray.push([chunk[activeChunks[k]].coords,blockArray,typeArray]);
		}
		//Download text file of map save
		download(JSON.stringify(saveArray),'saveOne');

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
		player.acceleration = 0.015;
	}else{
		player.acceleration = 0.05;		
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
		player.position[2]-=player.acceleration;
	}
	if(controls.keys['P']==1){
		player.position[2]+=player.acceleration;
	}
	
	//Single build key
	if(controls.keys['E']==1){
		var loopLen=controls.cursorList.length;
		for(var k=0; k<loopLen; k++){
			block_build(controls.cursorPosition[0]+controls.cursorList[k][0],controls.cursorPosition[1]+controls.cursorList[k][1],controls.cursorPosition[2]+controls.cursorList[k][2],0);
		}
	}

	//Single delete key
	if(controls.keys['C']==1){
		var loopLen=controls.cursorList.length;
		for(var k=0; k<loopLen; k++){
			block_build(controls.cursorPosition[0]+controls.cursorList[k][0],controls.cursorPosition[1]+controls.cursorList[k][1],controls.cursorPosition[2]+controls.cursorList[k][2],1);
		}
	}

	
}