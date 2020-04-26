/*
 ____  ____  __  __  ___  ____  ____  __  __  __  __     ___  __  __  __    __    ____  _  _  ___ 
( ___)(  _ \(  )(  )/ __)(_  _)(  _ \(  )(  )(  \/  )   / __)(  )(  )(  )  (  )  (_  _)( \( )/ __)
 )__)  )   / )(__)( \__ \  )(   )   / )(__)(  )    (   ( (__  )(__)(  )(__  )(__  _)(_  )  (( (_-.
(__)  (_)\_)(______)(___/ (__) (_)\_)(______)(_/\/\_)   \___)(______)(____)(____)(____)(_)\_)\___/

Code for how the frustrum shape is created 


*/
var zNear=0.001;
var zFar=20000;
var up = glMatrix.vec3.fromValues(0,0,-1);

function create_frustrum(){

	//Near plane
	var nearSize=[];
	 nearSize[1]= 2 * Math.tan( (renderSettings.fov * Math.PI / 180) *0.64) * zNear; // Height
	 nearSize[0]= nearSize[1] * (gl.canvas.clientWidth / gl.canvas.clientHeight) //Width

	//Far planes
	var farSize=[];
	 farSize[1]= 2 * Math.tan( (renderSettings.fov  * Math.PI / 180) *0.64) * zFar; // Height
	 farSize[0]= farSize[1] * (gl.canvas.clientWidth / gl.canvas.clientHeight) //Width	
	//Direction vector
	var viewD =  glMatrix.vec3.fromValues(Math.sin(player.rotation[0])*Math.cos(player.rotation[1]),+Math.cos(player.rotation[0])*-Math.cos(player.rotation[1]),Math.sin(player.rotation[1]));
	//Cam vector
	var camv = glMatrix.vec3.fromValues(player.fixedPosition[0]*0.5,player.fixedPosition[1]*0.5,player.fixedPosition[2]*0.5);
	//Bring the camera back a bit from your viewing

	
	//glMatrix.vec3.subtract(camv,camv,viewD);
	//Normalize the Directional Vector
	glMatrix.vec3.normalize(viewD,viewD);

	//Right vector
	var right = glMatrix.vec3.create();
	glMatrix.vec3.cross(right,viewD,up);
	glMatrix.vec3.normalize(right,right);

	var reverse = glMatrix.vec3.fromValues( -(Math.sin(player.rotation[0])*Math.cos(player.rotation[1])) , -(Math.cos(player.rotation[0])*-Math.cos(player.rotation[1])) ,-Math.sin(player.rotation[1]));
	glMatrix.vec3.normalize(reverse,reverse);
	glMatrix.vec3.cross(up,reverse,up);
	glMatrix.vec3.cross(up,up,reverse);
	glMatrix.vec3.normalize(up,up);


	//View Direction Scaled Far
	var viewDSF = glMatrix.vec3.create();
	//Scaled Near
	var viewDSN = glMatrix.vec3.create();
	
	glMatrix.vec3.scale(viewDSF,viewD,zFar);	
	glMatrix.vec3.scale(viewDSN,viewD,zNear);	
	
	
	var farCorner = glMatrix.vec3.create();
	var nearCorner = glMatrix.vec3.create();
	

	glMatrix.vec3.add(farCorner,camv,viewDSF)
	glMatrix.vec3.add(nearCorner,camv,viewDSN)

	var valOne = glMatrix.vec3.fromValues(farSize[1]/2,farSize[1]/2,farSize[1]/2);
	glMatrix.vec3.multiply(valOne,valOne,up);
	
	var valTwo = glMatrix.vec3.fromValues(farSize[0]/2,farSize[0]/2,farSize[0]/2);	
	glMatrix.vec3.multiply(valTwo,valTwo,right);

	var valThree = glMatrix.vec3.fromValues(nearSize[1]/2,nearSize[1]/2,nearSize[1]/2);
	glMatrix.vec3.multiply(valThree,valThree,up);
	
	var valFour = glMatrix.vec3.fromValues(nearSize[0]/2,nearSize[0]/2,nearSize[0]/2);	
	glMatrix.vec3.multiply(valFour,valFour,right);
	


//FAR CORNERS

	var farTopLeft = glMatrix.vec3.create();	

	glMatrix.vec3.add(farTopLeft,farCorner, valOne);
	glMatrix.vec3.subtract(farTopLeft,farTopLeft,valTwo);
	
	var farTopRight = glMatrix.vec3.create();	

	glMatrix.vec3.add(farTopRight,farCorner, valOne);	
	glMatrix.vec3.add(farTopRight,farTopRight,valTwo);
	
	var farBottomLeft = glMatrix.vec3.create();	

	glMatrix.vec3.subtract(farBottomLeft,farCorner, valOne);	
	glMatrix.vec3.subtract(farBottomLeft,farBottomLeft,valTwo);	
	
	var farBottomRight = glMatrix.vec3.create();	

	glMatrix.vec3.subtract(farBottomRight,farCorner, valOne);	
	glMatrix.vec3.add(farBottomRight,farBottomRight,valTwo);	
	
//NEAR CORNERS
	var nearTopLeft = glMatrix.vec3.create();	

	glMatrix.vec3.add(nearTopLeft,nearCorner, valThree);
	glMatrix.vec3.subtract(nearTopLeft,nearTopLeft,valFour);
	
	var nearTopRight = glMatrix.vec3.create();	

	glMatrix.vec3.add(nearTopRight,nearCorner, valThree);	
	glMatrix.vec3.add(nearTopRight,nearTopRight,valFour);
	
	var nearBottomLeft = glMatrix.vec3.create();	

	glMatrix.vec3.subtract(nearBottomLeft,nearCorner, valThree);	
	glMatrix.vec3.subtract(nearBottomLeft,nearBottomLeft,valFour);	
	
	var nearBottomRight = glMatrix.vec3.create();	

	glMatrix.vec3.subtract(nearBottomRight,nearCorner, valThree);	
	glMatrix.vec3.add(nearBottomRight,nearBottomRight,valFour);	
		
//right

	var  v = glMatrix.vec3.create();
	glMatrix.vec3.subtract(v,farBottomRight,farTopRight);
	var u = glMatrix.vec3.create();
	glMatrix.vec3.subtract(u,nearBottomRight,farTopRight);
	 rightN = glMatrix.vec3.create();
	glMatrix.vec3.cross(rightN,v,u);
	glMatrix.vec3.normalize(rightN,rightN);
	 rightD =-glMatrix.vec3.dot(farTopRight,rightN);
	 
//left

	var  v = glMatrix.vec3.create();
	glMatrix.vec3.subtract(v,farBottomLeft,farTopLeft);
	var u = glMatrix.vec3.create();
	glMatrix.vec3.subtract(u,nearBottomLeft,farTopLeft);
	 leftN = glMatrix.vec3.create();
	glMatrix.vec3.cross(leftN,v,u);
	glMatrix.vec3.normalize(leftN,leftN);
	 leftD =-glMatrix.vec3.dot(farTopLeft,leftN);

//Front
	var  v = glMatrix.vec3.create();
	glMatrix.vec3.subtract(v,nearTopLeft,nearTopRight);
	var u = glMatrix.vec3.create();
	glMatrix.vec3.subtract(u,nearBottomRight,nearTopRight);
	 nearN = glMatrix.vec3.create();
	glMatrix.vec3.cross(nearN,v,u);
	glMatrix.vec3.normalize(nearN,nearN);
	 nearD = glMatrix.vec3.dot(nearTopRight,nearN);					
			
//Top
	var  v = glMatrix.vec3.create();
	glMatrix.vec3.subtract(v,farTopLeft,farTopRight);
	var u = glMatrix.vec3.create();
	glMatrix.vec3.subtract(u,nearTopRight,farTopRight);
	 topN = glMatrix.vec3.create();
	glMatrix.vec3.cross(topN,v,u);
	glMatrix.vec3.normalize(topN,topN);
	 topD = glMatrix.vec3.dot(farTopRight,topN);					

//Bottom
	var  v = glMatrix.vec3.create();
	glMatrix.vec3.subtract(v,farBottomLeft,farBottomRight);
	var u = glMatrix.vec3.create();
	glMatrix.vec3.subtract(u,nearBottomRight,farBottomRight);
	bottomN = glMatrix.vec3.create();
	glMatrix.vec3.cross(bottomN,v,u);
	glMatrix.vec3.normalize(bottomN,bottomN);
	bottomD = -glMatrix.vec3.dot(farBottomRight,bottomN);					
			
						
}




check_frustrum= function(point){
		var amountXY = -blockSettings.sector.XYZ*blockSettings.chunk.XYZ*0.55;
		var amountZ = -blockSettings.sector.XYZ*blockSettings.chunk.XYZ*0.4;

		//Position we are checking
		

		posVec = glMatrix.vec3.fromValues(point[0],point[1],point[2]);

		//If anything falls out of our view frustrum outside of padding
		if((-glMatrix.vec3.dot(leftN,posVec) - leftD)<amountXY ||  
		glMatrix.vec3.dot(rightN,posVec) + rightD<amountXY  || 
		(-glMatrix.vec3.dot(topN,posVec)+topD)<amountZ  ||  
		(glMatrix.vec3.dot(bottomN,posVec) + bottomD)<amountZ ||  
		(-glMatrix.vec3.dot(nearN,posVec) + nearD)<amountXY){
			return(0);
		}else{
			return(1);
		}
}