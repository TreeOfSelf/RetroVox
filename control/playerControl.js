/*
  ___  __   __ _  ____  ____   __   __    ____ 
 / __)/  \ (  ( \(_  _)(  _ \ /  \ (  )  / ___)
( (__(  O )/    /  )(   )   /(  O )/ (_/\\___ \
 \___)\__/ \_)__) (__) (__\_) \__/ \____/(____/    
All user interactions, including pointer lock

*/

//Definitions

//Camera position
var cam=[0,0,0];
//Camera X/Y rotation
var camRotate=[0,0];


//Keyboard controls 
var keys=[];

//Cam height modifier for crouching / proning
var camHeightChange=0;

//Whether you are unplayerCrouched, playerCrouched, or proned
var playerCrouched=0;

//Whether you are wallrunning
var playerWallRunning=0;

//The blocks playerAbove your head, 0 for non-solid, 1 for solid
var playerAbove = [0,0,0]

//Position infront of you to build
var buildPos=[0,0,0];

//Whether or not you are in block placing mode
var buildMode=0;

//Offset for the build positions
var buildOffset = [0,0,0]


//distance from camera to build at
var buildDistance=1;

//Gravity toggle
var gravity =0;


//How many blocks to build at once
var blockBuild=16;
//How many blocks to delete at once
var blockDel=3;



//Player max speed
var pspeed = 0.15;
//Player acceleration
var accel = 0.01;

//Forward speed
var forwardSpeed=0.0;
//Strafe speed
var strafeSpeed=0.0;


//Vertical momemntum
var mom=0;

//Whether or not on solid ground
var solid=0;


//Function used to move the player in a X/Y direction. 
function move_player(speedCheckX,speedCheckY,camChange){
	var bottom=0;
	var loc=-1;

	//If gravity is on check for blocks infront
	if(gravity==1){
		var loc = check_block(Math.round(cam[0]-Math.sin(camRotate[0]+camChange)*speedCheckX*forwardChange),Math.round(cam[1]	+Math.cos(camRotate[0]+camChange)*speedCheckY*forwardChange),Math.round(cam[2]));
		if(loc==-1 || playerCrouched>0){
			loc = check_block(Math.round(cam[0]-Math.sin(camRotate[0]+camChange)*speedCheckX*forwardChange),Math.round(cam[1]	+Math.cos(camRotate[0]+camChange)*speedCheckY*forwardChange),Math.round(cam[2]+1));
			if(loc==-1 || (playerCrouched>1)){
				loc = check_block(Math.round(cam[0]-Math.sin(camRotate[0]+camChange)*speedCheckX*forwardChange),Math.round(cam[1]	+Math.cos(camRotate[0]+camChange)*speedCheckY*forwardChange),Math.round(cam[2]+2));
				if(loc==-1 || (playerCrouched>1 && loc==-1) ){
					bottom=1;
					loc = check_block(Math.round(cam[0]-Math.sin(camRotate[0]+camChange)*speedCheckX*forwardChange),Math.round(cam[1]+Math.cos(camRotate[0]+camChange)*speedCheckY*forwardChange),Math.round(cam[2]+3));
				}
			}
		}
	}
	
	if(loc==-1){
	cam[0]-=Math.sin(camRotate[0]+camChange)*speedCheckX;
	cam[1]+=Math.cos(camRotate[0]+camChange)*speedCheckY;
	if(gravity==0 && camChange==0){
	cam[2]-=Math.sin(camRotate[1])*(speedCheckX);
	}
	}else{
		if(bottom==1){
			cam[2]-=1;
			cam[0]-=Math.sin(camRotate[0]+camChange)*forwardSpeed;
			cam[1]+=Math.cos(camRotate[0]+camChange)*forwardSpeed;

		}else{;
			forwardSpeed*=0.99;
			strafeSpeed*=0.99;
		}
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
	e.preventDefault();	
	if(ortho==1){
		orthoView+=(e.deltaY*0.001)*orthoView;
		if(orthoView<1){
			orthoView=1;
		}
	}
});


//Mouse look
canvas.addEventListener('mousemove', function(e) {
	//If pointer is locked
	//if(document.pointerLockElement === canvas ||document.mozPointerLockElement === canvas) {
   
	//Move camera rotations depending on mouse X&Y
	camRotate[0]+=e.movementX*0.004;
	camRotate[1]+=e.movementY*0.004;
	
	//BHOP momentum if you are not prone and are on solid ground
	/*if(solid==0 && playerCrouched!=2){
		if(Math.abs(forwardSpeed)>0.01){
		if(forwardSpeed>=0){
		forwardSpeed+=Math.abs(e.movementX)*0.00002
		}else{
		forwardSpeed-=Math.abs(e.movementX)*0.00002
		}
		}
	}*/
//} 
	}, false);

 


//Keyboard keydown  (press)
document.onkeydown=function(e){
	e =  e || window.event;
	e.preventDefault(); e.stopPropagation();
	

	//Generate test cluster on culling Worker
	if(e.key=='h' || e.key=='H'){
		cullWorker.postMessage({
		id : 'generate',
	});
	}
	
	
	//Buildmode toggle
	if(e.key=='n' || e.key=='N'){
		if(buildMode==0){
			buildMode=1;
		}else{
			buildMode=0;
		}
	}
	
	if(e.key=='c' || e.key=='C'){
		create_frustrum();
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
	//Massive block
	if(e.key=='Q' || e.key=='q'){
		
		cullWorker.postMessage({
			id : "bigBlock",
			blockBuild : Math.round(blockBuild*6.25),
			cam : cam,
		});

		
		
	}	
	
	
	//Fatty block
	if(e.key=='T' || e.key=='t'){
		
		cullWorker.postMessage({
			id : "bigBlock",
			blockBuild : blockBuild,
			cam : cam,
		});

		
		
	}
	
	
	
	//Full screen
	if(e.key=='Enter'){
	canvas.requestFullscreen();
	}
	
	

	
	//Isometric view toggle
	if(e.key=='l' || e.key=='L'){
		if(ortho==0){
			ortho=1;
		}else{
			ortho=0;
		}
	}
	
	
	//Gravity toggle
	if(e.key=='M' || e.key=='m'){
		mom=0;
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
	
	//Turn off playerWallRunning (will be set to 1 again if you continue to run on the wall)
	playerWallRunning=0;
	
	buildPos=[Math.round(cam[0]+buildOffset[0]+Math.sin(camRotate[0])*buildDistance),Math.round(cam[1]+buildOffset[1]-Math.cos(camRotate[0])*buildDistance),Math.round(cam[2]+buildOffset[2]+(camRotate[1]*buildDistance))]
	
	
		
	//Camera constraint
	
	//Loop camera X if over or under max
	if(camRotate[0]>6.28319){camRotate[0]=0;}
	if(camRotate[0]<-6.28319){camRotate[0]=0;}
	
	//Constrain camera Y so you can't roll your head backwards
	camRotate[1]=Math.max(Math.min(1.55,camRotate[1]),-1.55);


	//Check for blocks playerAbove you for crouching and proning
	
	if(playerCrouched!=0){
		//Clear playerAbove list
		playerAbove=[0,0,0]
		
		//Check range around you
		for(var xTest=-1;xTest<=1;xTest++){
		for(var yTest=-1;yTest<=1;yTest++){

		var count=0;
		//Check blocks playerAbove your head
		for(var k=1; k>=-3;k--){
			//Block playerAbove you
			if(playerAbove[count]!=1){
			var loc = check_block(Math.round(cam[0]+xTest),Math.round(cam[1]+yTest),Math.floor(cam[2]+k))
			if(loc==1){
				playerAbove[count]=1;
			}
			count+=1;
			}
		}
		}}
	}
	

	//Block Build Single
	if(keys['E']==1){
		block_create(Math.round(buildPos[0]),Math.round(buildPos[1]),Math.round(buildPos[2]),0);
	}
	
	
	//Crouch
	
	//If you are not prone
	if(playerCrouched!=2){
		if(keys['CONTROL']==1){
			playerCrouched=1;
		}else{
			//If blocks above you are free to uncrouch
			if(playerAbove[0]==0 && playerAbove[1]==0 ){
			playerCrouched=0;
			}
		}
	}
	
	//Sphere draw
	if(keys['F']==1){
		cullWorker.postMessage({
			id : "bigSphere",
			blockBuild : blockBuild,
			cam : cam,
		});
	}
	
	//Jump
	if(keys[' ']==1){
		//If you are on solid ground
		if(solid==1){
			switch(playerCrouched){
			//Uncrouched
			case 0:
			mom=-0.5;solid=0;
			break;
			//Crouched
			case 1:
			mom-=0.7;solid=0;
			break;
			//Proned
			case 2:
			mom-=0.2;solid=0;
			break;
			}
		}
	}
	
	//Delete single
	if(keys['V']==1){
		block_delete(Math.round(buildPos[0]),Math.round(buildPos[1]),Math.round(buildPos[2]));
	}
	
	//Delete cube
	if(keys['B']==1){
		cullWorker.postMessage({
			id : "bigDelete",
			blockDel : blockDel,
			cam : cam,
		});
	}
	
	//Move camera for crouching/proning & uncrouching 
	
	switch(playerCrouched){
		case 0:
			if(camHeightChange>0){
				camHeightChange-=0.1;
			}
		break;
		case 1:
			if(camHeightChange<1.5){
				camHeightChange+=0.1;
			}
			if(camHeightChange>1.5){
				camHeightChange-=0.1;
			}
		break;
		case 2:
			if(camHeightChange<2.3){
				camHeightChange+=0.1;
			}
		break;
		
		
	}


	//Arrow key look

	if(buildMode==0){
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
	
	//Build offset
	}else{
		if(keys['ARROWLEFT']==1){
			buildOffset[0]-=Math.sin(camRotate[0]+1.57)*0.07;
			buildOffset[1]+=Math.cos(camRotate[0]+1.57)*0.07;
		}
		if(keys['ARROWRIGHT']==1){
			buildOffset[0]+=Math.sin(camRotate[0]+1.57)*0.07;
			buildOffset[1]-=Math.cos(camRotate[0]+1.57)*0.07;
		}
		if(keys['ARROWDOWN']==1){
			buildOffset[2]+=0.07;
		}
		if(keys['ARROWUP']==1){
			buildOffset[2]-=0.07;
		}	
	}

	//Sprint
	var speed=pspeed;

	//Sprint if uncrouched & on solid ground
	if(playerCrouched==0 && solid==1.0){
		if(keys['SHIFT']==1 || keys['Q']==1){
			 speed=pspeed*1.5;
		}
	}
	
	
	if(playerCrouched==1 && solid==1.0){
		speed*=0.6;
	}
	if(playerCrouched==2){
		speed*=0.3;
	}


	//Cam Up
	if(gravity==0){
	if(keys['O']==1){
		cam[2]-=speed;

	}

	//Cam Down
	if(keys['P']==1){
		cam[2]+=speed;

	}
	}


	//WASD on ground & noClipped
	if(solid==1 || gravity==0){
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
	}
	
	
	//WASD falling 
	if(solid==0 && gravity==1){
		if(playerWallRunning==1.0){
			if(forwardSpeed> -speed){	
				forwardSpeed-=Math.abs(forwardSpeed/25)+accel;
			}
		}
			if(keys['S']){
			if(forwardSpeed<speed){	
				forwardSpeed+=Math.abs(forwardSpeed/25)+accel;
			}
		}
		if(keys['A']){
			if(strafeSpeed<speed){	
				strafeSpeed+=Math.abs(strafeSpeed/25)+accel;
			}
		}	
		if(keys['D']){
			if(strafeSpeed> -speed){	
				strafeSpeed-=Math.abs(strafeSpeed/25)+accel;
			}
		}
	}


	//Slow speed momentum if on ground or noclipping
	if(solid==1 || gravity==0){
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
	}
	


	forwardChange=Math.abs(1/forwardSpeed);
	move_player(forwardSpeed,0.0,0.0);
	move_player(0.0,forwardSpeed,0.0);
	forwardChange=Math.abs(1/strafeSpeed);
	move_player(strafeSpeed,0.0,1.57);
	move_player(0.0,strafeSpeed,1.57);

	
	//Test surrounding blocks for collision, it checks a 3x3 block around the player for top and bottom collisions
	
	for(var xTest=-1;xTest<=1;xTest++){
	for(var yTest=-1;yTest<=1;yTest++){


	//If falling down
	if(gravity==1 && mom>=0){	
		//Block below your feet
		var loc = check_block(Math.round(cam[0]+xTest),Math.round(cam[1]+yTest),Math.ceil(cam[2]+3))
		//Block playerAbove that one
		var loc2 = check_block(Math.round(cam[0]+xTest),Math.round(cam[1]+yTest),Math.ceil(cam[2]+2))
		//If there is no block below you, Or there is a block playerAbove the block below you
		if(loc==-1 || loc2!=-1){
			if(playerWallRunning==0 || forwardSpeed==0.0){
			mom+=0.001;
			}else{
			mom+=Math.min(0.00005/Math.abs(forwardSpeed),0.001)
			}
			solid=0;
			if(mom>0.7){
				mom=0.7;
			}
		}else{
		//If there is a block
			//Stop vertical momenum
			mom=0;
			cam[2]=Math.round(cam[2])+0.2;
			//Set solid ground to 1
			solid=1;
			//Stop the test
			xTest=9;
			yTest=9;
			}
	}
	
	//If jumping up
	if(gravity==1 && mom<0){
		//Block playerAbove you
		var loc = check_block(Math.round(cam[0]+xTest),Math.round(cam[1]+yTest),Math.floor(cam[2]+Math.ceil(camHeightChange)))
		//Block below that block playerAbove you
		var loc2 = check_block(Math.round(cam[0]+xTest),Math.round(cam[1]+yTest),Math.floor(cam[2]+1+Math.ceil(camHeightChange)))
		//If there is no block playerAbove you or there is a block below the block playerAbove you
		if(loc==1 && loc2!=1){
		//If thee is a block playerAbove you
			//Stop vertical momentum	
			mom=0;
			//Stop the test
			xTest=9;
			yTest=9;
		}
	}

	}}


	//if gravity is enabled
	if(gravity==1){
		
		//Gravity cap
		if(mom>5){
			mom=5;
		}
		
		//Do gravity
		cam[2]+=mom;
		
		//Slow down gravity from juump
		if(mom<0){
		mom*=0.88;
		}
	
		//Set gravity to 0 when its really low
		if(mom<0 && mom>-0.05){
			mom=0;
		}
	}
	
}




