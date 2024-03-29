/*
RetroVox Main Render 9/23/2019

This file will contain everything relating to the player, physics, position, camera rotations, state
*/

//Starting position
var defaultPosition = [-6,2,1]



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
	buildStrength : 1,
	//Type of material we are building
	buildType : 1,
	//Current cursor shape
	cursorShape : 0,
	//Chunk data for cursor
	cursorChunkData : new Float32Array(Math.pow(blockSettings.chunk.XYZ,3)).fill(255), 
	//Type data for cursor (filled so that it actually meshes correctly)
	cursorChunkType : new Uint8Array(Math.pow(blockSettings.chunk.XYZ,3)).fill(127), 
	//List of coordinates to create blocks from using the cursor build/delete
	cursorList : [],
	//Cursor string 
	cursorString : "",
	//Draw data for cursor
	cursorDraw  : { 
		vao : gl.createVertexArray(), 
		size : 0,
		buffers : { 
			position : gl.createBuffer(),
			texture : gl.createBuffer(),
			type : gl.createBuffer(),
		}
	}
}


//Set up vertex array object with our buffers for the controls.cursorDraw 
gl.bindVertexArray(controls.cursorDraw.vao);
gl.bindBuffer(gl.ARRAY_BUFFER,controls.cursorDraw.buffers.position);
gl.vertexAttribPointer(programInfo.attribLocations.position,3,gl.FLOAT,false,0,0);
gl.enableVertexAttribArray(programInfo.attribLocations.position);	



gl.bindBuffer(gl.ARRAY_BUFFER, controls.cursorDraw.buffers.texture);
gl.vertexAttribPointer(programInfo.attribLocations.texture,3,gl.FLOAT,false,0,0);
gl.enableVertexAttribArray(programInfo.attribLocations.texture);

gl.bindBuffer(gl.ARRAY_BUFFER, controls.cursorDraw.buffers.type);
gl.vertexAttribPointer(programInfo.attribLocations.type,1,gl.UNSIGNED_BYTE,false,0,0);
gl.enableVertexAttribArray(programInfo.attribLocations.type);


//Player object
player = {
	rotation : [0,0],
	position : defaultPosition.slice(),
	chunk : [0,0,0],
	sector : [0,0,0],
		// forward,strafe,gravity
	momentum : [0,0,0],
	acceleration : 0.015,
}

var upVector = glMatrix.vec3.fromValues(0,0,1);
var rightVector = glMatrix.vec3.create();


//Function ran every frame to calculate players goto position
player_movement=function(){
		
	
	//Get vector of player position 
	var positionVector = glMatrix.vec3.fromValues(player.position[0],player.position[1],player.position[2]);
	
	
	//Movement X/Y/Z forward
	


	//Calculate forward movement 
	var forwardMovement = glMatrix.vec3.fromValues(
	player.position[0]-Math.sin(player.rotation[0])* (player.momentum[0]),
	player.position[1]+Math.cos(player.rotation[0])* (player.momentum[0]),
	player.position[2]);
	
	
	//Get vector pointing from original point to forward movement point and normalize to get a ray in that direction
	forwardMovementNormal =  glMatrix.vec3.create();

	glMatrix.vec3.subtract(forwardMovementNormal,forwardMovement,positionVector);
	glMatrix.vec3.normalize(forwardMovementNormal,forwardMovementNormal);

	
	//Set offsets to later offset position if that place is freer
	forwardMovement = glMatrix.vec3.fromValues(
	-Math.sin(player.rotation[0])* (player.momentum[0]),
	Math.cos(player.rotation[0])* (player.momentum[0]),
	0);
		
	

	//Free cam movement 
	//player.position[2]-=Math.sin(player.rotation[1])* (player.momentum[0]);
	
	
	//Calculate forward vector
	var forwardVector = glMatrix.vec3.fromValues(-Math.sin(player.rotation[0]),Math.cos(player.rotation[0]),0)
	//Cross product forward/up to get strafe vector
	glMatrix.vec3.cross(rightVector,forwardVector,upVector);

	//Movement X/Y/Z strafe 
	//Calculate forward movement 
	var strafeMovement = glMatrix.vec3.fromValues(
	player.position[0]+rightVector[0]* (player.momentum[1]),
	player.position[1]+rightVector[1]* (player.momentum[1]),
	player.position[2]);
	
	
	//Get vector pointing from original point to forward movement point and normalize to get a ray in that direction
	strafeMovementNormal =  glMatrix.vec3.create();

	glMatrix.vec3.subtract(strafeMovementNormal,strafeMovement,positionVector);
	glMatrix.vec3.normalize(strafeMovementNormal,strafeMovementNormal);

	
	//Set offsets to later offset position if that place is freer
	strafeMovement = glMatrix.vec3.fromValues(
	rightVector[0]* (player.momentum[1]),
	rightVector[1]* (player.momentum[1]),
	0);
			
	
	/*
	if(physics_infront(

	)==false){
		
	player.position[0]+=rightVector[0]* (player.momentum[1]);
	player.position[1]+=rightVector[1]* (player.momentum[1]);
	
	}*/
	

	//player.position[2]+=rightVector[2]* (player.momentum[1]);
	
	

	var triangleList = physics_getTriangles(player.chunk[0],player.chunk[1],player.chunk[2]);


	//Test each triangle
	var forwardFree=true;
	if(player.momentum[2]>=0){
	var gravityFree=true;
	}else{
	var ceilingFree=true;
	}
	var strafeFree=true;
	for(var l=0;l<triangleList.length;l++){
		//Forward test 
		//console.log(distance_3d(triangleList[l][0],[player.position[0],player.position[2],player.position[1]]),player.momentum[0]);
		if(forwardFree==true && distance_3d(triangleList[l][0],[player.position[0],player.position[1],player.position[2]])<=Math.abs(player.momentum[0]*3)+1.0){
			var pointHit  = intersectTriangle([],[player.position[0],player.position[1],player.position[2]],forwardMovementNormal,triangleList[l]);
			if(pointHit==null){
				pointHit  = intersectTriangle([],[player.position[0],player.position[1],player.position[2]+1],forwardMovementNormal,triangleList[l]);
			}
			if(pointHit==null){
				pointHit  = intersectTriangle([],[player.position[0],player.position[1],player.position[2]+2],forwardMovementNormal,triangleList[l]);
			}
			if(pointHit!=null){
				forwardFree=null;
			}
		}
		
		if(strafeFree==true && distance_3d(triangleList[l][0],[player.position[0],player.position[1],player.position[2]])<=Math.abs(player.momentum[1]*3)+1.0){
			var pointHit  = intersectTriangle([],[player.position[0],player.position[1],player.position[2]],strafeMovementNormal,triangleList[l]);
			if(pointHit==null){
				pointHit  = intersectTriangle([],[player.position[0],player.position[1],player.position[2]+1],strafeMovementNormal,triangleList[l]);
			}
			if(pointHit==null){
				pointHit  = intersectTriangle([],[player.position[0],player.position[1],player.position[2]+2],strafeMovementNormal,triangleList[l]);
			}
			if(pointHit!=null){
				strafeFree=null;
			}
		}
		
		
		if(gravityFree==true && distance_3d(triangleList[l][0],[player.position[0],player.position[1],player.position[2]+3])<=Math.abs(player.momentum[2]*3)+2.0){
			//Shoot ray down
			var pointHit  = intersectTriangle([],[player.position[0],player.position[1],player.position[2]+3],[0,0,1],triangleList[l]);
			if(pointHit!=null){
				if( Math.abs(triangleList[l][0][2]-player.position[2])<=3.3){
				gravityFree=null;
				player.position[2]=pointHit[2]-3;
				player.momentum[2]=0;
				}else{
					player.momentum[2]*=0.99;
				}
			}
		}
		
		if(ceilingFree==true && distance_3d(triangleList[l][0],[player.position[0],player.position[1],player.position[2]-1])<=Math.abs(player.momentum[2]*3)+0.1){
			//Shoot ray down
			var pointHit  = intersectTriangle([],[player.position[0],player.position[1],player.position[2]],[0,0,-1],triangleList[l]);
			if(pointHit!=null){
				ceilingFree=null;
				player.momentum[2]=0.01;
			}
		}
	}
	//Move forward if it isnt blocked
	//console.log(forwardFree,forwardMovement,forwardMovementNormal);
	if(forwardFree==true){
		player.position[0]+=forwardMovement[0];
		player.position[1]+=forwardMovement[1];
	}
	if(strafeFree==true){
		player.position[0]+=strafeMovement[0];
		player.position[1]+=strafeMovement[1];
	}
	
	if(gravityFree==true){
		player.momentum[2]+=0.01;
		if(player.momentum[2]>=1.5){
			player.momentum[2]=1.5;
		}
		player.position[2]+=player.momentum[2];
		
	}
	if(ceilingFree==true){
		player.position[2]+=player.momentum[2];
		player.momentum[2]*=0.95;
		player.momentum[2]+=0.01;
	}

	
	
	//Slow acceleration for forward & strafe
	player.momentum[0]*=0.9;
	player.momentum[1]*=0.9;	
	
	//Set player chunk based on position
	player.chunk = chunk_get_no_border(player.position[0],player.position[1],player.position[2]);
	//Set player sector based on chunk
	player.sector = sector_get(player.chunk[0],player.chunk[1],player.chunk[2]);


	//Set the cursor fixed position (where it is in game space)
	player.fixedPosition =[player.position[0]+player.chunk[0]*2,player.position[1]+player.chunk[1]*2,player.position[2]+player.chunk[2]*2];

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

mesh_start();
meshWorker.worker.postMessage({
	id : 'generate_world',
});
render();