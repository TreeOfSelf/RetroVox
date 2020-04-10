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
	fov : 80,
	resolution : 0.5,
	lightIntensity : 0.0005,
	//First index is XY view, second is the Z view. 
	viewDistance : {
		XY : 1,
		Z  : 1,
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
	antialias : true,
	//premultipliedAlpha: false, 
});

const texture = loadTexture(gl,'grass.png');

canvas.style.imageRendering='pixelated';
//Depth testing
gl.enable(gl.DEPTH_TEST);  
//Culling
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
//Alpha blending
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.lineWidth(15.0);

var d = new Date();
var day = d.getDate();
var mont = d.getMonth();
var seconds = d.getTime();

var color = [noise.perlin3(mont/10,day/100,seconds/400000),noise.perlin3(day/100,mont/10,seconds/400000),noise.perlin3(seconds/400000,day/100,mont/10)];
color = [Math.abs(color[0]),Math.abs(color[1]),Math.abs(color[2])];
gl.clearColor(color[0],color[1],color[2],1.0);


renderSettings.lightIntensity = (1 - ((color[0]+color[1]+color[2])/3))*0.0009


//Set background color based on time

setInterval(function(){
d = new Date();
var day = d.getDate();
var mont = d.getMonth();
var seconds = d.getTime();


var color = [noise.perlin3(mont/10,day/100,seconds/400000),noise.perlin3(day/100,mont/10,seconds/400000),noise.perlin3(seconds/400000,day/100,mont/10)];
color = [Math.abs(color[0]),Math.abs(color[1]),Math.abs(color[2])];
gl.clearColor(color[0],color[1],color[2],1.0);


renderSettings.lightIntensity = (1 - ((color[0]+color[1]+color[2])/3))*0.0009


},2000);

//Load Texture




//This is the main drawing function. It is ran once per frame to determine the image output. It also encapsulates the functions to run physics.

function render(now){
	var time = Date.now();
	fps.drawLength=0;
	
	gl.disable(gl.BLEND);
	keyboard_controls();
	mobile_controls();
	player_physics();
	//chunk_process();
	
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
	gl.uniform1f(programInfo.uniformLocations.transparency,1);

	var processList = [];
	
	for(var xx=-renderSettings.viewDistance.XY;xx<=renderSettings.viewDistance.XY;xx++){
	for(var yy=-renderSettings.viewDistance.XY;yy<=renderSettings.viewDistance.XY;yy++){
	for(var zz=-renderSettings.viewDistance.XY;zz<=renderSettings.viewDistance.XY;zz++){
		var sectorPos = [xx+player.sector[0],yy+player.sector[1],zz+player.sector[2]];
		var sectorID = sector_returnID(sectorPos[0],sectorPos[1],sectorPos[2]);
	
		if(sector[sectorID]!=null){
			processList.push([sectorID,distance_3d(sector[sectorID].coords,player.sector)]);	
		}
		
	}}}
	
	//Sort the list of chunks by distance
	processList.sort(function(a,b){
		return(a[1]-b[1]);
	});
	
	//Loop through active sectors 
	
	
	for(var k=0 ; k<processList.length ; k++){
		var sectorID = processList[k][0];
		if(sector[sectorID].buffers.size>0){
			gl.bindVertexArray(sector[sectorID].vao);
			fps.drawLength+=sector[sectorID].buffers.size;
			//Draw the triangles 
			if(renderSettings.wireframe==0){		
		
				gl.drawElements(gl.TRIANGLES, sector[sectorID].buffers.size,gl.UNSIGNED_INT,0);
			//Draw wireframe
			}else{
				gl.drawElements(gl.LINES, sector[sectorID].buffers.size,gl.UNSIGNED_INT,0);					
			}			
		}
	

	}
	
	
	//If there is a cursor to be drawn
	if(controls.cursorDraw.size!=0){
		//gl.enable(gl.BLEND);
		//Displace cursor 
		glMatrix.mat4.translate(modelMatrix,modelMatrix ,[controls.cursorPosition[0] - blockSettings.chunk.XYZ/2,-controls.cursorPosition[2]+ blockSettings.chunk.XYZ/2  ,controls.cursorPosition[1]-blockSettings.chunk.XYZ/2]);
		gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix,false,modelMatrix);
		gl.uniform1f(programInfo.uniformLocations.transparency,controls.buildStrength/30);
		//Draw cursor
		gl.bindVertexArray(controls.cursorDraw.vao);
		//gl.drawElements(gl.TRIANGLES, controls.cursorDraw.size ,gl.UNSIGNED_INT,0);	
		//gl.disable(gl.BLEND);
		gl.drawElements(gl.LINES, controls.cursorDraw.size ,gl.UNSIGNED_INT,0);	
	}
	
	//Create animation of render function
	requestAnimationFrame(render);
	
	var result = Date.now() - time;
	if(result>16){
		console.log("FRAME TOOK: "+result);
	}
}
