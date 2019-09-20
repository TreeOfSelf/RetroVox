/*
 ____  ____  __ _  ____  ____  ____ 
(  _ \(  __)(  ( \(    \(  __)(  _ \
 )   / ) _) /    / ) D ( ) _)  )   /
(__\_)(____)\_)__)(____/(____)(__\_)
All main drawing code 
*/


//Definitions 
var screenSize=[0,0]
var prevSize=[-1,-1];



//Flag for drawing smooth
var drawSmooth=1;

//Wireframe toggle
var wireFrame=0;
//Orthographic toggle
var ortho = 0;
//Orthographic zoom
var orthoView=75.0;
//Field of view
var fov=95;

//Resolution scale
var resolution = 1;

//How far of a view to render
var viewDist = 3;
//How far down and up to render 
var zView = 3;




//FPS
let then = 0;
var fps=0;
var fpsReal;
var fpsTotal=0;
var fpsCount=0;
var deltaTime = 0;

//Indice amount 
var drawLength = 0;

//Variables for the frustrum culling
zFar = 5000.0;
zNear = 0.0001;

canvas = document.getElementById("pandaCanvas");

//Current chunk
var camChunk = [0,0];
//Set resolution scale to pixelated
canvas.style.imageRendering='pixelated';


//Depth testing
gl.enable(gl.DEPTH_TEST);

//Back face culling   
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
//No alpha blending          
gl.disable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
//Create drawing buffers


//Premade indice buffer

var indexBuffer = gl.createBuffer();



//Premade indice buffer
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
var indice=[];
for(var k=0;k<=999999;k++){
	var q=k*4;
	indice.push(q,q+1,q+2,q,q+2,q+3);
}
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indice), gl.STATIC_DRAW)

//Background color
gl.clearColor(0.10, 0.0, 0.1, 1.0);  


//Building buffer for the block infront of you
blockBuildVao = gl.createVertexArray();
blockBuildPos = gl.createBuffer();
blockBuildCol = gl.createBuffer();

gl.bindVertexArray(blockBuildVao);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

gl.bindBuffer(gl.ARRAY_BUFFER,blockBuildPos);
gl.vertexAttribPointer(programInfoCube.attribLocations.voxelPosition,3,gl.FLOAT,false,0,0);
gl.enableVertexAttribArray(programInfoCube.attribLocations.voxelPosition);	

gl.bindBuffer(gl.ARRAY_BUFFER,blockBuildCol);
gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array([
90,90,90,90,90,90,90,90,90,90,90,90,150,150,150,150,150,150,150,150,150,150,150,150,50,50,50,50,50,50,50,50,50,50,50,50,110,110,110,110,110,110,110,110,110,170,170,170,170,170,170,170,170,170,170,170,170,210,210,210,210,210,210,210,210,210,210,210,210,
]),gl.DYNAMIC_DRAW);
gl.vertexAttribPointer(programInfoCube.attribLocations.voxelColor,3,gl.UNSIGNED_BYTE,false,0,0);
gl.enableVertexAttribArray(programInfoCube.attribLocations.voxelColor);



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

var startTime = [];
var chunkTick=0;
//Main render
function drawScene(now) {
	//Time the renderer
	startTime['total'] = new Date();
	//Run player controls
	
	playerControl();

	chunk_process();

	//Set canvas size if it has changed
	if(window.innerWidth!=prevSize[0] || window.innerHeight!=prevSize[1]){
		
		//Set screen size
		prevSize = [window.innerWidth,window.innerHeight];
		screenSize = [Math.round(window.innerWidth*(resolution)),Math.round(window.innerHeight*(resolution))];
		canvas.width = screenSize[0];
		canvas.height = screenSize[1];
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		//Set frustrum culling variables
		
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
		gl.clearDepth(9999999); 	   		//     FOV                                       ASPECT                               NEAR FAR
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
	glMatrix.mat4.translate(projectionMatrix,projectionMatrix,[-(cam[0]),(cam[2]),-(cam[1])]);

	//Use cube shader and set uniforms
	gl.useProgram(programInfoCube.program);

	//Set uniforms
	gl.uniformMatrix4fv(programInfoCube.uniformLocations.projectionMatrix,false,projectionMatrix);
	gl.uniform3fv(programInfoCube.uniformLocations.cam,[cam[0],cam[1],cam[2]]);
	gl.uniform1i(programInfoCube.uniformLocations.ortho,ortho);	
	
	//Get camera chunk and sector
	camChunk = chunk_get(cam[0],cam[1],cam[2]);	
	camSector = sector_get(camChunk[0],camChunk[1],camChunk[2]);


	//Reset drawLength and the drawList 
	drawLength=0;
	var drawList=[];
	
	
	
		
    startTime['drawSectors']=new Date();
	//Create frustrum for culling
	create_frustrum();
		
	var drawn=0;
	//Loop through nearby sectors based on view distances
	
	//Single check 
	
	for(var xCheck=-viewDist;xCheck<=viewDist;xCheck++){
	for(var yCheck=-viewDist;yCheck<=viewDist;yCheck++){
	for(var zCheck=-zView;zCheck<=zView;zCheck++){

		
		//Get coordinates of current sector
		var sectorCoords =[ camSector[0]+xCheck, camSector[1]+yCheck,camSector[2]+zCheck];
		//Return ID for the sector
		var sectorID = return_sectorID(sectorCoords[0],sectorCoords[1],sectorCoords[2]);

		//If the sector exists
		if(sector[sectorID]!=null){
			
				
			
			//Get sector position in chunk space
			var sectorPos = [sector[sectorID].coords[0]*sectorXY,sector[sectorID].coords[1]*sectorXY,sector[sectorID].coords[2]*sectorZ];
			
			
			//Dont frustrum cull in orthographic view 
			if(ortho==1){      //Sector ID      Distance from camera
				drawList.push([sectorID,1]);
			}else{
				//Distance from camera
				var dist=distance(sectorCoords,camSector);
				
				//Don't cull out sectors that are super close
				//if(dist <=1.0 ||
				//If sector is within view frustrum
					//check_frustrum( [(sectorPos[0]*chunkXYZ)+chunkXYZ/2,(sectorPos[1]*chunkXYZ)+chunkXYZ/2,(sectorPos[2]*chunkXYZ)+(chunkXYZ)/2])==true){
				//Add sector to drawList
									//ID    distance to camera
					drawList.push([sectorID,dist]);	
				//}

			}
		}
	}}}

	if(ortho==0){
	//Sort the draw list by distance 
	drawList.sort(function(a,b){
		return(a[1]-b[1]);
	});
	}
		
	startTime['drawSectors'] = new Date() - startTime['drawSectors'];	
	//Loop through view
	for(var i=0;i<drawList.length;i++){
			//Get sector reference from draw list
			//If sector is drawn
				//Add to draw length
				
				if(drawSmooth==0){
				
					drawLength+=sector[drawList[i][0]].buffers.size;
					//Bind VAO
					
					gl.bindVertexArray(sector[drawList[i][0]].vao);
					//Draw
					if(wireFrame==0){		
						gl.drawElements(gl.TRIANGLES, sector[drawList[i][0]].buffers.size,gl.UNSIGNED_SHORT,0);
					}else{
						gl.lineWidth(15.0);
						gl.drawElements(gl.LINES, sector[drawList[i][0]].buffers.size,gl.UNSIGNED_SHORT,0);				
							
					}
					
					
				}else{
					
					drawLength+=sector[drawList[i][0]].buffers.size;
					//Bind VAO
					
					gl.bindVertexArray(sector[drawList[i][0]].vao);

					//Draw
					if(wireFrame==0){		
						
						gl.drawElements(gl.TRIANGLES, sector[drawList[i][0]].buffers.size,gl.UNSIGNED_INT,0);
					}else{
						gl.lineWidth(15.0);
						gl.drawElements(gl.LINES, sector[drawList[i][0]].buffers.size,gl.UNSIGNED_INT,0);				
							
					}	
				}
		
	}

	//Draw block infront where you will build

	//if(ortho==0){
		gl.bindVertexArray(blockBuildVao);
		gl.bindBuffer(gl.ARRAY_BUFFER, blockBuildPos);
		gl.bufferData(gl.ARRAY_BUFFER,buildArrayPos,gl.DYNAMIC_DRAW);
		//gl.depthFunc(gl.LEQUAL);
		gl.drawElements(gl.LINES, 35,gl.UNSIGNED_SHORT,0);	
	//}
	
	indexBufferSmooth = gl.createBuffer();
	positionBuffer = gl.createBuffer();
	colorBuffer = gl.createBuffer();

	
	
	if(startTime['drawSectors']>14){
	console.log(startTime['drawSectors']);
	}

	//Check date now to find out ms pased
	startTime['total'] = new Date()-startTime['total'];
	//Print ms if the timing is under 60fps
	if(startTime['total']>16.2){
			console.log("%c Render took!: %c"+ startTime['total']+'ms','color:red; font-weight:bold;','color:black; font-weight:bold;');
	}
	//Request to render next frame
	requestAnimationFrame(drawScene);

}






