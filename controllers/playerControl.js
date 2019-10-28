/*
RetroVox Main Render 9/23/2019

This file will contain everything relating to the player, physics, position, camera rotations, state
*/

//Starting position
var defaultPosition = [1,2,1]



//Object containing the keyboard control related variables
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
	cursorDistance : 3,
	//Size of build cursor
	buildAmount : 6,
	//Strength of build cursor
	buildStrength : 2,
	//Type of material we are building
	buildType : 1,
	//Current cursor shape
	cursorShape : 0,
	//Chunk data for cursor
	cursorChunkData : new Int16Array(Math.pow(blockSettings.chunk.XYZ,3)).fill(64), 
	//Type data for cursor (filled so that it actually meshes correctly)
	cursorChunkType : new Uint8Array(Math.pow(blockSettings.chunk.XYZ,3)).fill(127), 
	//List of coordinates to create blocks from using the cursor build/delete
	cursorList : [],
	//Draw data for cursor
	cursorDraw  : { 
		vao : gl.createVertexArray(), 
		size : 0,
		buffers : { 
			position : gl.createBuffer(),
			color : gl.createBuffer(),
			indice :  gl.createBuffer(),
		}
	}
}


//Set up vertex array object with our buffers for the controls.cursorDraw 
gl.bindVertexArray(controls.cursorDraw.vao);
gl.bindBuffer(gl.ARRAY_BUFFER,controls.cursorDraw.buffers.position);
gl.vertexAttribPointer(programInfo.attribLocations.position,3,dataTypeGL,false,0,0);
gl.enableVertexAttribArray(programInfo.attribLocations.position);	

gl.bindBuffer(gl.ARRAY_BUFFER, controls.cursorDraw.buffers.color);
gl.vertexAttribPointer(programInfo.attribLocations.color,3,gl.UNSIGNED_BYTE,false,0,0);
gl.enableVertexAttribArray(programInfo.attribLocations.color);


//Player object
var player = {
	rotation : [0,0],
	position : defaultPosition.slice(),
	chunk : [0,0,0],
	sector : [0,0,0],
		// forward,strafe
	momentum : [0,0],
	acceleration : 0.015,
}

var upVector = glMatrix.vec3.fromValues(0,0,1);
var rightVector = glMatrix.vec3.create();


//Function ran every frame to calculate player physics
function player_physics(){
		
	//Movement 	
	
	//Movement X/Y/Z forward
	player.position[0]-=Math.sin(player.rotation[0])* (player.momentum[0]);
	player.position[1]+=Math.cos(player.rotation[0])* (player.momentum[0]);
	player.position[2]-=Math.sin(player.rotation[1])* (player.momentum[0]);
	
	//Calculate forward vector
	var forwardVector = glMatrix.vec3.fromValues(-Math.sin(player.rotation[0]),Math.cos(player.rotation[0]),0)
	//Cross product forward/up to get strafe vector
	glMatrix.vec3.cross(rightVector,forwardVector,upVector);

	//Movement X/Y/Z strafe 
	player.position[0]+=rightVector[0]* (player.momentum[1]);
	player.position[1]+=rightVector[1]* (player.momentum[1]);
	player.position[2]+=rightVector[2]* (player.momentum[1]);
	
	
	//Slow acceleration for forward & strafe
	player.momentum[0]*=0.9;
	player.momentum[1]*=0.9;	
	
	//Set player chunk based on position
	player.chunk = chunk_get_no_border(player.position[0],player.position[1],player.position[2]);
	//Set player sector based on chunk
	player.sector = sector_get(player.chunk[0],player.chunk[1],player.chunk[2]);
	
	//Cursor positioning based on forward vector and build distance
	
	//Distance changed for bigger builds
	var displacedDistance = controls.cursorDistance;
	
	switch(controls.cursorShape){
		case 2:
		displacedDistance*=6.66;
		break;
		case 3:
		displacedDistance*=6.66;
		break;
	}
	
	controls.cursorPosition = [player.position[0]+Math.sin(player.rotation[0])*Math.cos(player.rotation[1]) * displacedDistance, 
	player.position[1]+Math.cos(player.rotation[0])*-Math.cos(player.rotation[1]) * displacedDistance,
	player.position[2]+Math.sin(player.rotation[1]) * displacedDistance];
	
	

	//Snap cursor position to grid and shift to center
	controls.cursorPosition = [Math.round(controls.cursorPosition[0]),Math.round(controls.cursorPosition[1]),Math.round(controls.cursorPosition[2])];

	
	//Set the cursor chunk 
	controls.cursorChunk = chunk_get_no_border(Math.round(controls.cursorPosition[0]),Math.round(controls.cursorPosition[1]),Math.round(controls.cursorPosition[2]));

	//Set the cursor fixed position (where it is in game space)
	controls.cursorFixedPosition =[controls.cursorPosition[0]+controls.cursorChunk[0]*2,controls.cursorPosition[1]+controls.cursorChunk[1]*2,controls.cursorPosition[2]+controls.cursorChunk[2]*2];
		

}


render();