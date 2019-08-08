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


//Set resolution scale to pixelated
canvas.style.imageRendering='pixelated';


//Functions


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

//Drawing the scene


//Fps timing variables

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


var indexBuffer = gl.createBuffer();

//Premade indice buffer
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
var indice=[];
for(var k=0;k<=99999;k++){
	var q=k*4;
	indice.push(q,q+1,q+2,q,q+2,q+3);
}
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indice), gl.STATIC_DRAW)

//Background color
gl.clearColor(0.10, 0.0, 0.1, 1.0);  


//FPS
let then = 0;
var fps=0;
var fpsReal;
var fpsTotal=0;
var fpsCount=0;
var deltaTime = 0;
drawLength = 0;

//Variables for the frustrum culling
zFar = 5000.0;
zNear = 0.0001;


//Current chunk
var camChunk = [0,0];

//Set view distance
function set_distance(viewDistt){
	viewDist=viewDistt;
}


//Main render
function drawScene(now) {
	
	//Time the renderer
	startTime = new Date();
	
	//Run player controls
	playerControl();

	
	//Set canvas size if it has changed
	if(window.innerWidth!=prevSize[0] || window.innerHeight!=prevSize[1]){
		
		
		//Set screen size
		prevSize = [window.innerWidth,window.innerHeight];
		screenSize = [Math.round(window.innerWidth*(0.97*resolution)),Math.round(window.innerHeight*(0.93*resolution))];
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
	glMatrix.mat4.translate(projectionMatrix,projectionMatrix,[-cam[0],cam[2]+camHeightChange,-cam[1]]);

	//Use cube shader and set uniforms
	gl.useProgram(programInfoCube.program);

	//Set uniforms
	gl.uniformMatrix4fv(programInfoCube.uniformLocations.projectionMatrix,false,projectionMatrix);
	gl.uniform3fv(programInfoCube.uniformLocations.cam,[cam[0],cam[1],cam[2]+camHeightChange]);
	gl.uniform1i(programInfoCube.uniformLocations.ortho,ortho);	
	
	//Get camera chunk and sector
	camChunk = chunk_get(cam[0],cam[1],cam[2]);	
	camSector = sector_get(camChunk[0],camChunk[1],camChunk[2]);


	//Reset drawLength and the drawList 
	drawLength=0;
	drawList=[];
	
	
	//Create frustrum for culling
	create_frustrum();
	
	//Loop through nearby sectors based on view distances
	for(var xCheck=-viewDist;xCheck<=viewDist;xCheck++){
	for(var yCheck=-viewDist;yCheck<=viewDist;yCheck++){
	for(var zCheck=-zView;zCheck<=zView;zCheck++){
		
		
		//Get coordinates of current sector
		sectorCoords =[ camSector[0]+xCheck, camSector[1]+yCheck,camSector[2]+zCheck];
		//Return ID for the sector
		var sectorID = return_sectorID(sectorCoords[0],sectorCoords[1],sectorCoords[2]);

		//If the sector exists
		if(sector[sectorID]!=null){
				
				//Redraw sector if it needs to be updated
				if(sector[sectorID].reDraw==1){
					sector[sectorID].reDraw=0;
					draw_sector(sectorCoords[0],sectorCoords[1],sectorCoords[2]);
				}
				
			//Get sector position in chunk space
			var sectorPos = [sector[sectorID].coords[0]*sectorXY,sector[sectorID].coords[1]*sectorXY,sector[sectorID].coords[2]*sectorZ];
			var sectorRef=sector[sectorID];
			
			//Dont frustrum cull in orthographic view 
			if(ortho==1){      //Sector ID      Distance from camera
				drawList.push([sectorID,distance(sectorCoords,camSector)]);
			}else{
				//Distance from camera
				var dist=distance(sectorCoords,camSector);
				
				//Don't cull out sectors that are super close
				if(dist <=1.0 ||
				//If sector is within view frustrum
					check_frustrum( [(sectorPos[0]*chunkXY)+chunkXY/2,(sectorPos[1]*chunkXY)+chunkXY/2,(sectorPos[2]*chunkZ)+(chunkZ)/2])==true){
				//Add sector to drawList
									//ID    distance to camera
					drawList.push([sectorID,dist]);	
				}

			}
		}
	}}}


	//Sort the draw list by distance 
	drawList.sort(function(a,b){
		return(a[1]-b[1]);
	});
	
	//Loop through view
	for(var i=0;i<drawList.length;i++){
			//Get sector reference from draw list
			var sectorRef = sector[drawList[i][0]];
			//If sector is drawn
			if (sectorRef.buffers.size!=0){
				//Add to draw length
				drawLength+=sectorRef.buffers.size;
				//Bind VAO
				gl.bindVertexArray(sectorRef.vao);
				//Draw
				gl.drawElements(gl.TRIANGLES, sectorRef.buffers.size,gl.UNSIGNED_SHORT,0);
			}
		
	}

	//Send buffers 
	buffers_send();
	
	//Check date now to find out ms pased
	endTime = new Date();
	endTime-=startTime;
	//Print ms if the timing is under 60fps
	if(endTime>16.2){
			console.log("%c Render took!: %c"+ endTime+'ms','color:red; font-weight:bold;','color:black; font-weight:bold;');
	}
	//Request to render next frame
	requestAnimationFrame(drawScene);

}



