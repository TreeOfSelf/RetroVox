/*
 ____  ____  __ _  ____  ____  ____ 
(  _ \(  __)(  ( \(    \(  __)(  _ \
 )   / ) _) /    / ) D ( ) _)  )   /
(__\_)(____)\_)__)(____/(____)(__\_)
All main drawing code 
*/
var subData=1;
//Definitions 
var screenSize=[0,0]
var prevSize=[-1,-1];

//List of sectors we are drawing + their distance to the camera 
var drawList=[];

//How many verts we are drawing
var drawLength=0;


//Orthographic toggle
var ortho = 0;
//Orthographic zoom
var orthoView=75.0;
//Field of view
var fov=95;

//Resolution scale
var resolution = 1;

//How far of a view to render
var viewDist = 1;
//How far down and up to render 
var zView = 1;

canvas.style.imageRendering='pixelated';


//Functions

function create_frustrum(){
	
	//Direction vector
	var viewD =  glMatrix.vec3.fromValues(Math.sin(camRotate[0])*Math.cos(camRotate[1]),+Math.cos(camRotate[0])*-Math.cos(camRotate[1]),Math.sin(camRotate[1]));
	//Cam vector
	var camv = glMatrix.vec3.fromValues(cam[0],cam[1],cam[2]);
	//Bring the camera back a bit from your viewing
	glMatrix.vec3.subtract(camv,camv,viewD);
	//Normalize the Directional Vector
	glMatrix.vec3.normalize(viewD,viewD);

	//Right vector
	var right = glMatrix.vec3.create();
	glMatrix.vec3.cross(right,viewD,up);
	glMatrix.vec3.normalize(right,right);

	var reverse = glMatrix.vec3.fromValues( -(Math.sin(camRotate[0])*Math.cos(camRotate[1])) , -(Math.cos(camRotate[0])*-Math.cos(camRotate[1])) ,-Math.sin(camRotate[1]));
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

//Load Texture
function loadTexture(gl,url){
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,255,255]));
	const image = new Image();
	image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D,texture);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
	}
	image.src = url;
	return texture;
}

const voxelTexture = loadTexture(gl, 'render/voxelTex.png');
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, voxelTexture);

//Drawing the scene

let then = 0;
var fps=0;

//Things that don't need to be done every frame

//Depth testing
gl.enable(gl.DEPTH_TEST);
 
//Back face culling   
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);

//No alpha blending          
gl.disable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);


//Create drawing buffers

var positionBuffer = gl.createBuffer();
var colorBuffer = gl.createBuffer();
var indexBuffer = gl.createBuffer();


gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
var indice=[];
for(var k=0;k<=9999;k++){
	var q=k*4;
	indice.push(q,q+1,q+2,q,q+2,q+3);
}
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indice), gl.STATIC_DRAW)



//How to read the position & color buffer
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(programInfoCube.attribLocations.voxelPosition,3,gl.SHORT,false,0,0);
gl.enableVertexAttribArray(programInfoCube.attribLocations.voxelPosition);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(programInfoCube.attribLocations.voxelColor,3,gl.UNSIGNED_BYTE,false,0,0);
gl.enableVertexAttribArray(programInfoCube.attribLocations.voxelColor);

//Background color
gl.clearColor(0.10, 0.0, 0.1, 1.0);  



//FPS
var fpsReal;
var fpsTotal=0;
var fpsCount=0;
var deltaTime = 0;


//Current chunk
var camChunk = [0,0];

//Set view distance
function set_distance(viewDistt){
	viewDist=viewDistt;
}


//Create draw buffer 
var drawLimit=100000000;
drawLength = 0;
var byteAtPos = 0;
var byteAtCol=0;

var byteAtBufferPos=0;
var byteAtBufferCol=0;
//Voxel Position
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER,drawLimit,gl.DYNAMIC_DRAW);
//Voxel Color
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER,drawLimit/2,gl.DYNAMIC_DRAW);


//Main render
function drawScene(now) {
	
	startTime = new Date();
	
	//Run player controls
	playerControl();

	
	//Set canvas size 
	if(window.innerWidth!=prevSize[0] || window.innerHeight!=prevSize[1]){
		
		
		prevSize = [window.innerWidth,window.innerHeight];
		screenSize = [Math.round(window.innerWidth*(0.97*resolution)),Math.round(window.innerHeight*(0.93*resolution))];
		canvas.width = screenSize[0];
		canvas.height = screenSize[1];
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		zFar = 5000.0;
		zNear = 0.0001;
		
		//Near plane
		nearSize=[];
		nearSize[1]= 2 * Math.tan( (fov * Math.PI / 180) *0.64) * zNear; // Height
		nearSize[0]= nearSize[1] * (gl.canvas.clientWidth / gl.canvas.clientHeight) //Width
		
		//Far planes
		farSize=[];
		farSize[1]= 2 * Math.tan( (fov * Math.PI / 180) *0.64) * zFar; // Height
		farSize[0]= farSize[1] * (gl.canvas.clientWidth / gl.canvas.clientHeight) //Width
		//Up  vector
		up = glMatrix.vec3.fromValues(0,0,-1);
	
	
	
	}

	//Calculate FPS + delta Time
	now *= 0.001;deltaTime = now - then;  then = now; fps = 1 / deltaTime; 
	deltaTime =Math.min(deltaTime*100,20);fpsTotal+=fps;fpsCount+=1;
	//Average FPS
	if(fpsCount==60){fpsReal=fpsTotal/fpsCount;fpsTotal=0;fpsCount=0;}
	
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//Create projection matrix
	projectionMatrix = glMatrix.mat4.create();

	//Perspective
	if(ortho==0){ 	
	gl.depthFunc(gl.LESS)
	gl.clearDepth(9999999); 
					   		//     FOV                                       ASPECT                               NEAR FAR
		glMatrix.mat4.perspective(projectionMatrix,fov * Math.PI / 180,gl.canvas.clientWidth / gl.canvas.clientHeight,0.01,9999999999);
	
	
	//Orthographic
	}else{
		gl.depthFunc(gl.GREATER)
		gl.clearDepth(0); 
		glMatrix.mat4.ortho(projectionMatrix, -orthoView*(gl.canvas.clientWidth / gl.canvas.clientHeight),orthoView*(gl.canvas.clientWidth / gl.canvas.clientHeight),-orthoView,orthoView,99999,0.0001);
	}
	//Rotate Camera
	glMatrix.mat4.rotate(projectionMatrix,projectionMatrix,camRotate[1],[1,0,0]);
	glMatrix.mat4.rotate(projectionMatrix,projectionMatrix,camRotate[0],[0,1,0]);
	//Translate Camera
	glMatrix.mat4.translate(projectionMatrix,projectionMatrix,[-cam[0],cam[2]+camHeightChange,-cam[1]]);


	//Use cube shader and set uniforms
	gl.useProgram(programInfoCube.program);

	gl.uniformMatrix4fv(programInfoCube.uniformLocations.projectionMatrix,false,projectionMatrix);
	gl.uniform3fv(programInfoCube.uniformLocations.cam,[cam[0],cam[1],cam[2]+camHeightChange]);
	gl.uniform1i(programInfoCube.uniformLocations.ortho,ortho);	
	camChunk = chunk_get(cam[0],cam[1],cam[2]);	
	camSector = sector_get(camChunk[0],camChunk[1],camChunk[2]);
	byteAtPos=0;
	byteAtCol=0;
	byteAtBufferPos=0;
	byteAtBufferCol=0;

	drawLength=0;

	drawList=[];
	
	
	

	create_frustrum();
	
	var camSec= sector_get(camChunk[0],camChunk[1],camChunk[2]);
	for(var xCheck=-viewDist;xCheck<=viewDist;xCheck++){
	for(var yCheck=-viewDist;yCheck<=viewDist;yCheck++){
	for(var zCheck=-zView;zCheck<=zView;zCheck++){
		
		
		
		sectorCoords =[ camSector[0]+xCheck, camSector[1]+yCheck,camSector[2]+zCheck];
		var sectorID = return_sectorID(sectorCoords[0],sectorCoords[1],sectorCoords[2]);
		
		if(sector[sectorID]!=null){
				
				if(sector[sectorID].reDraw==1){
					sector[sectorID].reDraw=0;
					draw_sector(sectorCoords[0],sectorCoords[1],sectorCoords[2]);
					
				}
				
			//Get sector position in chunk space
			var sectorPos = [sector[sectorID].coords[0]*sectorXY,sector[sectorID].coords[1]*sectorXY,sector[sectorID].coords[2]*sectorZ];
			var sectorRef=sector[sectorID];
			
			//Dont frustrum cull in orthographic view 
			if(ortho==1){
				drawList.push([sectorID,distance(sectorCoords,camSec)]);
			}else{
				var dist=distance(sectorCoords,
				camSec);
				
				

				if(dist <=1.0 ||
				check_frustrum( [(sectorPos[0]*chunkXY)+chunkXY/2,(sectorPos[1]*chunkXY)+chunkXY/2,(sectorPos[2]*chunkZ)+(chunkZ)/2])==true){
				//if(true){
				drawList.push([
				sectorID,
				dist]);	
				}

			}
		}
	}}}

	drawList.sort(function(a,b){
		return(a[1]-b[1]);
	});
	
	//Loop through view

	

	for(var i=0;i<drawList.length;i++){
			
			var sectorRef = sector[drawList[i][0]];
				if (sectorRef.buffers.size!=0){
				drawLength+=sectorRef.buffers.size;
				gl.bindVertexArray(sectorRef.vao);
				gl.drawElements(gl.TRIANGLES, sectorRef.buffers.size,gl.UNSIGNED_SHORT,0);
				}		
		
	}

	
	
		
	
	
	buffers_send();
	

	endTime = new Date();
	endTime-=startTime;
	if(endTime>16.2){
			console.log("%c Render took!: %c"+ endTime+'ms','color:red; font-weight:bold;','color:black; font-weight:bold;');
	}

	//Request to render next frame
	requestAnimationFrame(drawScene);

}



