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
	cursorDistance : 1,
	//Size of delete cursor
	deleteAmount : 3,
	//Size of build cursor
	buildAmount : 6,
	//Strength of delete cursor
	deleteStrength : 0.003,
	//Strength of build cursor
	buildStrength : 0.005,
	//Type of material we are building
	buildType : 1,
}


//Player object
var player = {
	startPosition [0,0,0],
	rotation : [0,0],
	position : defaultPosition.slice(),
	chunk : [0,0,0],
	sector : [0,0,0],
		// forward,strafe
	momentum : [0,0],
	acceleration : 0.005,
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
	
	controls.cursorPosition = [player.position[0]+Math.sin(player.rotation[0])*Math.cos(player.rotation[1]) * controls.cursorDistance, 
	player.position[1]+Math.cos(player.rotation[0])*-Math.cos(player.rotation[1]) * controls.cursorDistance,
	player.position[2]+Math.sin(player.rotation[1]) * controls.cursorDistance];
	
	

	//Snap cursor position to grid and shift to center
	controls.cursorPosition = [Math.round(controls.cursorPosition[0]),Math.round(controls.cursorPosition[1]),Math.round(controls.cursorPosition[2])];

	
	//Set the cursor chunk 
	controls.cursorChunk = chunk_get_no_border(Math.round(controls.cursorPosition[0]),Math.round(controls.cursorPosition[1]),Math.round(controls.cursorPosition[2]));

	//Set the cursor fixed position (where it is in game space)
	controls.cursorFixedPosition =[controls.cursorPosition[0]+controls.cursorChunk[0]*2,controls.cursorPosition[1]+controls.cursorChunk[1]*2,controls.cursorPosition[2]+controls.cursorChunk[2]*2];

	//Check which block our cursor lines up on relative inside the cursor chunk
	var blockLocation = [(Math.round(controls.cursorFixedPosition[0])) - (controls.cursorChunk[0]*blockSettings.chunk.XYZ), (Math.round(controls.cursorFixedPosition[1])) - (controls.cursorChunk[1]*blockSettings.chunk.XYZ),(Math.round(controls.cursorFixedPosition[2])) - (controls.cursorChunk[2]*blockSettings.chunk.XYZ)];

	//Set the position buffer for the cursor and draw cube 
	
	blockBuildPositionData = new Float32Array([
	
	controls.cursorPosition[0]-0.5,  controls.cursorPosition[1]-0.5, controls.cursorPosition[2]-0.5,
	controls.cursorPosition[0]-0.5,  controls.cursorPosition[1]-0.5+1.0,controls.cursorPosition[2]-0.5,
	controls.cursorPosition[0]-0.5+1.0,  controls.cursorPosition[1]-0.5+1.0,controls.cursorPosition[2]-0.5,
	controls.cursorPosition[0]-0.5+1.0,  controls.cursorPosition[1]-0.5, controls.cursorPosition[2]-0.5,

	// Back face
	controls.cursorPosition[0]-0.5,  controls.cursorPosition[1]-0.5, controls.cursorPosition[2]-0.5+1.0,
	controls.cursorPosition[0]-0.5,  controls.cursorPosition[1]-0.5+1.0,controls.cursorPosition[2]-0.5+1.0,
	controls.cursorPosition[0]-0.5+1.0,  controls.cursorPosition[1]-0.5+1.0,controls.cursorPosition[2]-0.5+1.0,
	controls.cursorPosition[0]-0.5+1.0,  controls.cursorPosition[1]-0.5, controls.cursorPosition[2]-0.5+1.0,


	// Top face
	controls.cursorPosition[0]-0.5,  controls.cursorPosition[1]-0.5+1.0, controls.cursorPosition[2]-0.5,
	controls.cursorPosition[0]-0.5,  controls.cursorPosition[1]-0.5+1.0,controls.cursorPosition[2]-0.5+1.0,
	controls.cursorPosition[0]-0.5+1.0,  controls.cursorPosition[1]-0.5+1.0,controls.cursorPosition[2]-0.5+1.0,
	controls.cursorPosition[0]-0.5+1.0,  controls.cursorPosition[1]-0.5+1.0, controls.cursorPosition[2]-0.5,

	// Bottom face
	controls.cursorPosition[0]-0.5, controls.cursorPosition[1]-0.5, controls.cursorPosition[2]-0.5,
	controls.cursorPosition[0]-0.5+1.0, controls.cursorPosition[1]-0.5, controls.cursorPosition[2]-0.5,
	controls.cursorPosition[0]-0.5+1.0, controls.cursorPosition[1]-0.5,controls.cursorPosition[2]-0.5+1.0,
	controls.cursorPosition[0]-0.5, controls.cursorPosition[1]-0.5,controls.cursorPosition[2]-0.5+1.0,

	// Right face
	controls.cursorPosition[0]-0.5+1.0, controls.cursorPosition[1]-0.5,controls.cursorPosition[2]-0.5,
	controls.cursorPosition[0]-0.5+1.0, controls.cursorPosition[1]-0.5+1.0, controls.cursorPosition[2]-0.5,
	controls.cursorPosition[0]-0.5+1.0, controls.cursorPosition[1]-0.5+1.0,controls.cursorPosition[2]-0.5+1.0,
	controls.cursorPosition[0]-0.5+1.0, controls.cursorPosition[1]-0.5,controls.cursorPosition[2]-0.5+1.0,

	// Left face
	controls.cursorPosition[0]-0.5, controls.cursorPosition[1]-0.5, controls.cursorPosition[2]-0.5,
	controls.cursorPosition[0]-0.5, controls.cursorPosition[1]-0.5,controls.cursorPosition[2]-0.5+1.0,
	controls.cursorPosition[0]-0.5, controls.cursorPosition[1]-0.5+1.0,controls.cursorPosition[2]-0.5+1.0,
	controls.cursorPosition[0]-0.5, controls.cursorPosition[1]-0.5+1.0, controls.cursorPosition[2]-0.5,
	]);
	
	
	

	
	//Set data to buffer
	
	gl.bindBuffer(gl.ARRAY_BUFFER,blockBuildPosition);
	gl.bufferData(gl.ARRAY_BUFFER,blockBuildPositionData,gl.DYNAMIC_DRAW);
	
}


render();