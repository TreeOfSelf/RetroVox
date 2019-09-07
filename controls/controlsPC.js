/*
  ___  __   __ _  ____  ____   __   __    ____ 
 / __)/  \ (  ( \(_  _)(  _ \ /  \ (  )  / ___)
( (__(  O )/    /  )(   )   /(  O )/ (_/\\___ \
 \___)\__/ \_)__) (__) (__\_) \__/ \____/(____/    
 
All user interactions, including pointer lock
Also handles physics/collisions

*/

//Definitions

//Camera position
var cam=[0,0,0];
//Camera X/Y rotation
var camRotate=[0,0];


//Keyboard controls 
var keys=[];

//Position infront of you to build
var buildPos=[0,0,0];

//distance from camera to build at
var buildDistance=1;



//How many blocks to build at once
var blockBuild=8;
//How many blocks to delete at once
var blockDel=8;


//Player max speed
var pspeed = 0.15;
//Player acceleration
var accel = 0.01;

//Forward speed
var forwardSpeed=0.0;
//Strafe speed
var strafeSpeed=0.0;

//Vertical momemntum
var momentum=0;

//Function used to move the player in a X/Y direction. 
function move_player(speedCheckX,speedCheckY,camChange,zChange){
		cam[0]-=Math.sin(camRotate[0]+camChange)*speedCheckX;
		cam[1]+=Math.cos(camRotate[0]+camChange)*speedCheckY;
		
		if(zChange==1){
			cam[2]-=Math.sin(camRotate[1])*(speedCheckX);
		}
}



//3D distance 
function distance( v1, v2 )
{
    var dx = v1[0] - v2[0];
    var dy = v1[1] - v2[1];
    var dz = v1[2] - v2[2];

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}



//Pointer lock
canvas.requestPointerLock = canvas.requestPointerLock ||canvas.mozRequestPointerLock;
canvas.addEventListener('click', function() {canvas.requestPointerLock(); }, false);

//Scroll
canvas.addEventListener('wheel', function(e) {
	//Prevent zooming while holding control
	e.preventDefault();	
	//Zoom orthographic view
	if(ortho==1){
		orthoView+=(e.deltaY*0.001)*orthoView;
		if(orthoView<1){
			orthoView=1;
		}
	//Move build distance
	}else{
		buildDistance-=(e.deltaY*0.001)*buildDistance;		
	}
});



//Mouse look
canvas.addEventListener('mousemove', function(e) {
	//If pointer is locked
	if(document.pointerLockElement === canvas ||document.mozPointerLockElement === canvas) {
	   
		//Move camera rotations depending on mouse X&Y
		camRotate[0]+=e.movementX*0.004;
		camRotate[1]+=e.movementY*0.004;
	
	} 
}, false);

 


//Keyboard keydown  (press)
document.onkeydown=function(e){
	e =  e || window.event;
	e.preventDefault(); e.stopPropagation();
	
	//wireFrame toggle
	if(e.key=='n' || e.key=='N'){
		if(wireFrame==0){
			wireFrame=1;
		}else{
			wireFrame=0;
		}
	}
	
	//smooth drawing toggle
	if(e.key=='k' || e.key=='K'){
		if(drawSmooth==0){
			drawSmooth=1;
		}else{
			drawSmooth=0;
		}
	}
	
	if(e.key=='j' || e.key=='J'){
		var chunkGrab  = 	getChunksInside(cam,[blockBuild*6,blockBuild*6,blockBuild*6]);
		var messageBase = {
			id : 'buildSphere',
			chunkList : chunkGrab,
			position : buildPos,
			blockBuild : blockBuild*12,
		}
		var transferList=[];
		for(var k=0;k<chunkGrab.length;k++){
			if(chunk[chunkGrab[k]]!=null && chunk[chunkGrab[k]].proccessing==0){
			messageBase[k]=chunk[chunkGrab[k]].blockList.buffer;
			transferList.push(chunk[chunkGrab[k]].blockList.buffer);
			chunk[chunkGrab[k]].proccessing=1;
			//chunk[chunkGrab[k]].saveBlockList = new Uint8Array(chunk[chunkGrab[k]].blockList);
			}else{
				messageBase[k]=0;
			}
		}
		if(chunkGrab.length>0){
		
			buildWorker[buildIndex][0].postMessage(messageBase,transferList);
			
		}
	}

	if(e.key=='q' || e.key=='Q'){
		console.time();
		var chunkGrab  = 	getChunksInside(cam,[blockBuild*6,blockBuild*6,blockBuild*6]);
		var messageBase = {
			id : 'buildBlock',
			chunkList : chunkGrab,
			position : buildPos,
			blockBuild : blockBuild*12,
		}
		var transferList=[];
		for(var k=0;k<chunkGrab.length;k++){
			if(chunk[chunkGrab[k]]!=null && chunk[chunkGrab[k]].proccessing==0){
			messageBase[k]=chunk[chunkGrab[k]].blockList.buffer;
			transferList.push(chunk[chunkGrab[k]].blockList.buffer);
			chunk[chunkGrab[k]].proccessing=1;
			//chunk[chunkGrab[k]].saveBlockList = new Uint8Array(chunk[chunkGrab[k]].blockList);
			}else{
				messageBase[k]=0;
			}
		}
		buildWorker[buildIndex][0].postMessage(messageBase,transferList);
			
		
		console.timeEnd();
	}
	
	//Reset player position & camera
	if(e.key=='r' || e.key=='R'){
		camRotate=[0,0];
		cam=[0,0,0];
	}

	//Prone
	if(e.key=='z' || e.key=='Z'){
		
		//Go prone 
		if(playerCrouched!=2){
			playerCrouched=2;
		//If already prone
		}else{
			//Test blocks playerAbove make sure it is clear
			if(playerAbove[0]==0){
			if(playerAbove[1]==0){
			//If both blocks playerAbove are clear fully unprone
			playerCrouched=0;
			}else{
			//Set to crouch if only 1 block is free playerAbove
			playerCrouched=1;
			}
			}
		}
	}

	


	//Full screen
	if(e.key=='Enter'){
	canvas.requestFullscreen();
	}
	

	//Orthographic view toggle
	if(e.key=='l' || e.key=='L'){
		if(ortho==0){
			ortho=1;
		}else{
			ortho=0;
		}
	}
	
	
	//Gravity toggle
	if(e.key=='M' || e.key=='m'){
		momentum=0;
		if(gravity==0){
			gravity=1;
		}else{
			gravity=0;
		}
	}
	
	//Make key upper case in our key array
	//So we don't have to check for uppercase or not.
	keys[e.key.toUpperCase()]=1;

}


//Key up (release)
document.body.onkeyup=function(e){
	keys[e.key.toUpperCase()]=0;
}


//Player control function ran each frame


function playerControl(){
	
	camRotate[0]-= (lookPosStart[0]-lookPosEnd[0])*0.0004;
	camRotate[1]-= (lookPosStart[1]-lookPosEnd[1])*0.0004;

	strafeSpeed+= (movePosStart[0]-movePosEnd[0])*0.0004;
	forwardSpeed-= (movePosStart[1]-movePosEnd[1])*0.0004;
				
	
	
	//Set build position based on camera view and buildDistance
	//buildPos=[Math.round(cam[0]+buildOffset[0]+Math.sin(camRotate[0])*buildDistance),Math.round(cam[1]+buildOffset[1]-Math.cos(camRotate[0])*buildDistance),Math.round(cam[2]+buildOffset[2]+(camRotate[1]*buildDistance))]
	buildPos=[(cam[0]+(Math.sin(camRotate[0])*Math.cos(camRotate[1]))*buildDistance), (cam[1]+(Math.cos(camRotate[0])*-Math.cos(camRotate[1])) *buildDistance), (cam[2]+Math.sin(camRotate[1])*buildDistance)]
	buildPosReal=[buildPos[0]+camChunk[0]*2,buildPos[1]+camChunk[1]*2,buildPos[2]+camChunk[2]*2];
	buildArrayPos = new Float32Array([
	
	buildPos[0],  buildPos[1], buildPos[2],
	buildPos[0],  buildPos[1]+1.0,buildPos[2],
	buildPos[0]+1.0,  buildPos[1]+1.0,buildPos[2],
	buildPos[0]+1.0,  buildPos[1], buildPos[2],

	// Back face
	buildPos[0],  buildPos[1], buildPos[2]+1.0,
	buildPos[0],  buildPos[1]+1.0,buildPos[2]+1.0,
	buildPos[0]+1.0,  buildPos[1]+1.0,buildPos[2]+1.0,
	buildPos[0]+1.0,  buildPos[1], buildPos[2]+1.0,


	// Top face
	buildPos[0],  buildPos[1]+1.0, buildPos[2],
	buildPos[0],  buildPos[1]+1.0,buildPos[2]+1.0,
	buildPos[0]+1.0,  buildPos[1]+1.0,buildPos[2]+1.0,
	buildPos[0]+1.0,  buildPos[1]+1.0, buildPos[2],

	// Bottom face
	buildPos[0], buildPos[1], buildPos[2],
	buildPos[0]+1.0, buildPos[1], buildPos[2],
	buildPos[0]+1.0, buildPos[1],buildPos[2]+1.0,
	buildPos[0], buildPos[1],buildPos[2]+1.0,

	// Right face
	buildPos[0]+1.0, buildPos[1],buildPos[2],
	buildPos[0]+1.0, buildPos[1]+1.0, buildPos[2],
	buildPos[0]+1.0, buildPos[1]+1.0,buildPos[2]+1.0,
	buildPos[0]+1.0, buildPos[1],buildPos[2]+1.0,

	// Left face
	buildPos[0], buildPos[1], buildPos[2],
	buildPos[0], buildPos[1],buildPos[2]+1.0,
	buildPos[0], buildPos[1]+1.0,buildPos[2]+1.0,
	buildPos[0], buildPos[1]+1.0, buildPos[2],
	]);

			
	//Camera constraint
	
	//Loop camera X if over or under max
	if(camRotate[0]>6.28319){camRotate[0]=0;}
	if(camRotate[0]<-6.28319){camRotate[0]=0;}
	
	//Constrain camera Y so you can't roll your head backwards
	camRotate[1]=Math.max(Math.min(1.55,camRotate[1]),-1.55);
	

	//Block Build Single
	if(keys['E']==1){
		block_create(Math.round(buildPosReal[0]),Math.round(buildPosReal[1]),Math.round(buildPosReal[2]),1);
	}
	
	
	
	//Sphere draw
	if(keys['F']==1){

		for(var xx=-blockBuild;xx<=blockBuild;xx++){
		for(var yy=-blockBuild;yy<=blockBuild;yy++){
		for(var zz=-blockBuild;zz<=blockBuild;zz++){
			var dist=distance([0,0,0],[xx,yy,zz]);
			if(dist<blockBuild){
				
				if(dist>=blockBuild-1){
				block_create(Math.round(buildPosReal[0]+xx),Math.round(buildPosReal[1]+yy),Math.round(buildPosReal[2]+zz),(dist/blockDel)*0.2);
				}else{
				block_create(Math.round(buildPosReal[0]+xx),Math.round(buildPosReal[1]+yy),Math.round(buildPosReal[2]+zz),(dist/blockDel)*0.2);				
				}
			}
		}}}
	}
	
	//Sphere delete
	if(keys['C']==1){


		for(var xx=-blockDel;xx<=blockDel;xx++){
		for(var yy=-blockDel;yy<=blockDel;yy++){
		for(var zz=-blockDel;zz<=blockDel;zz++){
			var dist=distance([0,0,0],[xx,yy,zz]);
			if(dist<blockDel){
				block_delete(Math.round(buildPosReal[0]+xx),Math.round(buildPosReal[1]+yy),Math.round(buildPosReal[2]+zz,dist/blockDel));				
			}
		}}}
	}
	
	
	
	//Delete single
	if(keys['V']==1){
		block_delete(Math.round(buildPosReal[0]),Math.round(buildPosReal[1]),Math.round(buildPosReal[2]));
	}
	
	//Fatty block
	if(keys['T']){
			
			
			for(var xx=-blockBuild;xx<=blockBuild;xx++){
				for(var yy=-blockBuild;yy<=blockBuild;yy++){
					for(var zz=0;zz<=blockBuild;zz++){
						block_create(Math.round(buildPosReal[0]+xx),Math.round(buildPosReal[1]+yy),Math.round(buildPosReal[2]+zz));
				}
				}
			}
	}
	
	//Delete cube
	if(keys['B']==1){
		
		
		for(var xx=-blockDel;xx<=blockDel;xx++){
			for(var yy=-blockDel;yy<=blockDel;yy++){
				for(var zz=-blockDel;zz<=blockDel;zz++){
					block_delete(Math.round(buildPosReal[0]+xx),Math.round(buildPosReal[1]+yy),Math.round(buildPosReal[2]+1+zz));
				}
			}
		}
	}
	


	//Arrow key look

		if(keys['ARROWLEFT']==1){
			camRotate[0]-=0.02;
		}
		if(keys['ARROWRIGHT']==1){
			camRotate[0]+=0.02;
		}
		if(keys['ARROWDOWN']==1){
			camRotate[1]+=0.02;
		}
		if(keys['ARROWUP']==1){
			camRotate[1]-=0.02;
		}
	//Sprint
	var speed=pspeed;

	
	//Speed modifiers for sprinting
	if(keys['SHIFT']==1){
		speed=pspeed*5.0;	
	}



//Cam Up 
	if(keys['O']==1){
		cam[2]-=speed;
	}

//Cam Down
	if(keys['P']==1){
		cam[2]+=speed;
	}


	if(keys['W']){		
		if(forwardSpeed> -speed){	
			forwardSpeed-=Math.abs(forwardSpeed/5)+accel;
		}
	}
	if(keys['S']){
		if(forwardSpeed<speed){	
			forwardSpeed+=Math.abs(forwardSpeed/5)+accel;
		}
	}
	if(keys['A']){
		if(strafeSpeed<speed){	
			strafeSpeed+=Math.abs(strafeSpeed/5)+accel;
		}
	}
	if(keys['D']){
		if(strafeSpeed> -speed){	
			strafeSpeed-=Math.abs(strafeSpeed/5)+accel;
		}
	}



	if(Math.abs(strafeSpeed)<0.01){
		strafeSpeed=0;
	}else{
		
		strafeSpeed*=0.9
		
	}
	if(Math.abs(forwardSpeed)<0.01){
		forwardSpeed=0;
	}else{
		
		forwardSpeed*=0.9
		
		
	}
	
	

	//Move player on X,Y forward
	forwardChange=Math.abs(1/forwardSpeed);
	move_player(forwardSpeed,0.0,0.0,1);
	move_player(0.0,forwardSpeed,0.0,1);
	//Move player on X,Y strafe
	forwardChange=Math.abs(1/strafeSpeed);
	move_player(strafeSpeed,0.0,1.57,0);
	move_player(0.0,strafeSpeed,1.57,0);

	
	
}