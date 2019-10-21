/*
RetroVox Main Render 9/20/2019

This file will contain the main webGL related code relating to the canvas, shaders, textures, matrixes..ect 
*/



//Definitions 


//Object containing settings used at render time
var renderSettings = {
	screenSize : [0,0],
	wireframe : 0,
	orthographic : 0,
	zoom : 75.0,
	fov : 95,
	resolution : 1,
	lightIntensity : 0.01,
	//First index is XY view, second is the Z view. 
	viewDistance : {
		XY : 3,
		Z  : 3,
	},
}


//Object containing attributes related to frames per second, delta timing, and the amount of indices drawn
var fps = {
	 then : 0,
	 fps:0,
	 fpsReal:0,
	 fpsTotal:0,
	 fpsCount:0,
	 deltaTime : 0,
	//Amount of indices we are rendering
	 drawLength : 0,
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



//Init (things that only need to be ran once at the beginning) 

canvas = document.getElementById("retroCanvas");
const gl = canvas.getContext("webgl2",{
	alpha: false,
	antialias : false,
});
canvas.style.imageRendering='pixelated';
//Depth testing
gl.enable(gl.DEPTH_TEST);  
//Culling
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
gl.lineWidth(15.0);
gl.clearColor(Math.random()*0.5+0.1,Math.random()*0.2,Math.random()*0.7+0.3,0.1);

//Load Texture




//This is the main drawing function. It is ran once per frame to determine the image output. It also encapsulates the functions to run physics.

function render(now){
	
	keyboard_controls();
	player_physics();
	chunk_process();
	
	//Test to see if the browser window has changed from our set size
	if(window.innerWidth*renderSettings.resolution!=renderSettings.screenSize[0] || window.innerHeight*renderSettings.resolution!=renderSettings.screenSize[1]){
		
		//Update screen size, canvas, viewport
		renderSettings.screenSize = [window.innerWidth*renderSettings.resolution,window.innerHeight*renderSettings.resolution];
		canvas.width = renderSettings.screenSize[0];
		canvas.height = renderSettings.screenSize[1];
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		
	}
	
	//Calculate FPS + delta time
	now *= 0.001;fps.deltaTime = now - fps.then;  fps.then = now; fps.fps = 1 / fps.deltaTime; 
	fps.deltaTime =Math.min(fps.deltaTime*100,20);fps.fpsTotal+=fps.fps;fps.fpsCount+=1;
	//Set the average FPS after 60 frames
	if(fps.fpsCount==60){fps.fpsReal=fps.fpsTotal/fps.fpsCount;fps.fpsTotal=0;fps.fpsCount=0;}
	
	
	//Clear previous canvas from last frame
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


	//Create projection matrix
	projectionMatrix = glMatrix.mat4.create();

	//Perspective
	if(renderSettings.orthographic==0){ 	
		gl.depthFunc(gl.LESS)
		gl.clearDepth(9999999); 	   		//     FOV                                       ASPECT                               NEAR FAR
		glMatrix.mat4.perspective(projectionMatrix,renderSettings.fov * Math.PI / 180,gl.canvas.clientWidth / gl.canvas.clientHeight,0.01,9999999999);

	//Orthographic
	}else{
		gl.depthFunc(gl.GREATER)
		gl.clearDepth(0); 
		glMatrix.mat4.ortho(projectionMatrix, -renderSettings.zoom*(gl.canvas.clientWidth / gl.canvas.clientHeight),renderSettings.zoom*(gl.canvas.clientWidth / gl.canvas.clientHeight),-renderSettings.zoom,renderSettings.zoom,99999,0.0001);
	}

	//Rotate camera
	glMatrix.mat4.rotate(projectionMatrix,projectionMatrix,player.rotation[1],[1,0,0]);
	glMatrix.mat4.rotate(projectionMatrix,projectionMatrix,player.rotation[0],[0,1,0]);
	//Translate Camera
	glMatrix.mat4.translate(projectionMatrix,projectionMatrix,[-(player.position[0]),(player.position[2]),-(player.position[1])]);


	
	//Model Matrix
	modelMatrix = glMatrix.mat4.create();

	//Set program
	gl.useProgram(programInfo.program);



	//Set uniforms
	gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,false,projectionMatrix);
	gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix,false,modelMatrix);
	gl.uniform3fv(programInfo.uniformLocations.cam,player.position);
	gl.uniform1i(programInfo.uniformLocations.ortho,renderSettings.orthographic);	
	gl.uniform1f(programInfo.uniformLocations.light,renderSettings.lightIntensity);

	//Loop through nearby sectors 
	
	for(var xCheck=-renderSettings.viewDistance.XY;xCheck<=renderSettings.viewDistance.XY;xCheck++){
	for(var yCheck=-renderSettings.viewDistance.XY;yCheck<=renderSettings.viewDistance.XY;yCheck++){
	for(var zCheck=-renderSettings.viewDistance.Z;zCheck<=renderSettings.viewDistance.Z;zCheck++){

		//Get coordinates of current sector using offset
		var sectorCoords =[ player.sector[0]+xCheck, player.sector[1]+yCheck,player.sector[2]+zCheck];
		//Return ID for the sector
		var sectorID = sector_returnID(sectorCoords[0],sectorCoords[1],sectorCoords[2]);
		//If the sector exists
		if(sector[sectorID]!=null && sector[sectorID].buffers.size>0){
			
			//drawLength+=sector[sectorID].buffers.size;
			//Bind VAO
			gl.bindVertexArray(sector[sectorID].vao);

			//Draw the triangles 
			if(renderSettings.wireframe==0){		
				gl.drawElements(gl.TRIANGLES, sector[sectorID].buffers.size,gl.UNSIGNED_INT,0);
			//Draw wireframe
			}else{
				gl.drawElements(gl.LINES, sector[sectorID].buffers.size,gl.UNSIGNED_INT,0);					
			}	
		
		}

	}
	}
	}
	//gl.depthFunc(gl.LESS);
	//Draw cursor
	gl.bindVertexArray(blockBuildVao);
	gl.drawElements(gl.LINES, 35,gl.UNSIGNED_SHORT,0);	
	
	//Create animation of render function
	requestAnimationFrame(render);
}
