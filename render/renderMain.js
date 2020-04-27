/*
RetroVox Main Render 9/20/2019

This file will contain the main webGL related code relating to the canvas, shaders, textures, matrixes..ect 
*/



//Object containing settings used at render time
var renderSettings = {
	screenSize : [0,0],
	wireframe : 0,
	orthographic : 0,
	zoom : 75.0,
	fov : 80,
	resolution : 1.0,
	lightIntensity : 0.0005,
	//First index is XY view, second is the Z view. 
	viewDistance : {
		XY : 5,
		Z  : 5,
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
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn off mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}
function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}
window.loadImage = function(url, onload) {
	var img = new Image();
	img.src = url;
	img.onload = function() {
		onload(img);
	};
	return img;
};


//Init (things that only need to be ran once at the beginning) 


//Texture array for terrain materials
const skyTexture = loadTexture(gl,'sky.png');

var textureArray = gl.createTexture();
loadImage('grass.png', function(image){
var num=9;
var canvas2D = document.createElement('canvas');
canvas2D.width = 512
canvas2D.height = 512*num
var ctx = canvas2D.getContext('2d');
ctx.drawImage(image, 0, 0);
var imageData = ctx.getImageData(0, 0, 512, 512*num);
var pixels = new Uint8Array(imageData.data.buffer);
gl.bindTexture(gl.TEXTURE_2D_ARRAY, textureArray);
gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_WRAP_S,gl.REPEAT);
gl.texParameteri(gl.TEXTURE_2D_ARRAY,gl.TEXTURE_WRAP_T,gl.REPEAT);
gl.texImage3D(
	gl.TEXTURE_2D_ARRAY,
	0,
	gl.RGBA,
	512,
	512,
	num,
	0,
	gl.RGBA,
	gl.UNSIGNED_BYTE,
	pixels);
gl.generateMipmap(gl.TEXTURE_2D_ARRAY)
gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR)
});

const depthTexture = gl.createTexture();
const depthTextureSize = 6000
gl.bindTexture(gl.TEXTURE_2D, depthTexture);
gl.texImage2D(
  gl.TEXTURE_2D,      // target
  0,                  // mip level
  gl.DEPTH_COMPONENT32F, // internal format
  depthTextureSize,   // width
  depthTextureSize,   // height
  0,                  // border
  gl.DEPTH_COMPONENT, // format
  gl.FLOAT,           // type
  null);              // data
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
const depthFramebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
gl.framebufferTexture2D(
  gl.FRAMEBUFFER,       // target
  gl.DEPTH_ATTACHMENT,  // attachment point
  gl.TEXTURE_2D,        // texture target
  depthTexture,         // texture
  0);                   // mip level




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


gl.clearColor(0.7,0.85,0.98,1.0);
renderSettings.lightIntensity = 0.009;


get=1;
//This is the main drawing function. It is ran once per frame to determine the image output. It also encapsulates the functions to run physics.


function render(now){
	var time = Date.now();
	fps.drawLength=0;
	
	gl.enable(gl.BLEND);
	keyboard_controls();
	mobile_controls();
	player_physics();

	
	//Test to see if the browser window has changed from our set size
	if(window.innerWidth*renderSettings.resolution!=renderSettings.screenSize[0] || window.innerHeight*renderSettings.resolution!=renderSettings.screenSize[1]){
		
		//Update screen size, canvas, viewport
		renderSettings.screenSize = [window.innerWidth*renderSettings.resolution,window.innerHeight*renderSettings.resolution];
		canvas.width = renderSettings.screenSize[0]*0.98;
		canvas.height = renderSettings.screenSize[1]*0.98;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		
	}
	
	//Calculate FPS + delta time
	now *= 0.001;fps.deltaTime = now - fps.then;  fps.then = now; fps.fps = 1 / fps.deltaTime; 
	fps.deltaTime =Math.min(fps.deltaTime*100,20);fps.fpsTotal+=fps.fps;fps.fpsCount+=1;
	//Set the average FPS after 60 frames
	if(fps.fpsCount==60){fps.fpsReal=fps.fpsTotal/fps.fpsCount;fps.fpsTotal=0;fps.fpsCount=0;}
	

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
	
	render_sectors(processList);

	//Create animation of render function
	requestAnimationFrame(render);
}




function rendedr(now){

	


}



var pointBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,pointBuffer);
gl.vertexAttribPointer(pointInfo.attribLocations.position,3,gl.FLOAT,false,0,0);
//gl.bufferData(gl.ARRAY_BUFFER,999999,gl.STATIC_DRAW);
gl.enableVertexAttribArray(pointInfo.attribLocations.position);	

var pointColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,pointColorBuffer);
gl.vertexAttribPointer(pointInfo.attribLocations.color,3,gl.FLOAT,false,0,0);
//gl.bufferData(gl.ARRAY_BUFFER,999999,gl.STATIC_DRAW);
gl.enableVertexAttribArray(pointInfo.attribLocations.color);	

var skyBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,skyBuffer);
gl.vertexAttribPointer(pixelInfo.attribLocations.position,3,gl.FLOAT,false,0,0);
//gl.bufferData(gl.ARRAY_BUFFER,999999,gl.STATIC_DRAW);
gl.enableVertexAttribArray(pixelInfo.attribLocations.position);	

var skyColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,skyColorBuffer);
gl.vertexAttribPointer(pixelInfo.attribLocations.color,3,gl.FLOAT,false,0,0);
//gl.bufferData(gl.ARRAY_BUFFER,999999,gl.STATIC_DRAW);
gl.enableVertexAttribArray(pixelInfo.attribLocations.color);	

gl.uniform1i(pixelInfo.uniformLocations.uSampler, 2);

function drawPoints(  projectionMatrix,
  cameraMatrix,
  ){
				gl.bindVertexArray(null); 
	gl.useProgram(pointProgramInfo.program);
	const viewMatrix = m4.inverse(cameraMatrix);

	twgl.setUniforms(pointProgramInfo, {
		u_view: viewMatrix,
		u_projection: projectionMatrix,
		u_world : m4.identity(),
	});
	
	
	gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(frustPoints),gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, pointColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(frustColors),gl.STATIC_DRAW);
	gl.drawArrays(gl.POINTS, 0,  frustPoints.length);	
}


function drawSky(  projectionMatrix,
  cameraMatrix,
  ){
				gl.bindVertexArray(null); 
	gl.useProgram(pixelProgramInfo.program);
	const viewMatrix = m4.inverse(cameraMatrix);

	twgl.setUniforms(pixelProgramInfo, {
		u_view: viewMatrix,
		u_projection: projectionMatrix,
		u_world : m4.identity(),
		u_sampler : skyTexture,
	});
	
	
	gl.bindBuffer(gl.ARRAY_BUFFER, skyBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(
	[Math.round(player.position[0]+time)+0.1, Math.round(player.position[1]),-600]
	),gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, skyColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([1.0,0.0,1.0]),gl.STATIC_DRAW);
	gl.drawArrays(gl.POINTS, 0,  1);	
}




function drawScene(
  projectionMatrix,
  cameraMatrix,
  textureMatrix,
  lightWorldMatrix,
  programInfo,
  processList,
  type) {
	const viewMatrix = m4.inverse(cameraMatrix);

	gl.useProgram(programInfo.program);


	twgl.setUniforms(programInfo, {
		u_view: viewMatrix,
		u_projection: projectionMatrix,
		u_textureMatrix: textureMatrix,
		u_sampler : textureArray,
		u_projectedTexture: depthTexture,
		u_reverseLight: lightWorldMatrix.slice(8, 11),
		u_world : m4.identity(),
		u_transparency : 1,
		u_cam : player.position,
	});
	
	//Draw all if shadow rendering 
	if(type==1){
		for(var k=0 ; k<processList.length ; k++){
			var sectorID = processList[k][0];
			if(sector[sectorID].buffers.size>0){
				gl.bindVertexArray(sector[sectorID].vao);

				fps.drawLength+=sector[sectorID].buffers.size;
				//Draw the triangles 
				if(renderSettings.wireframe==0){		
					gl.drawArrays(gl.TRIANGLES, 0,  sector[sectorID].buffers.size);
					//gl.drawElements(gl.TRIANGLES, sector[sectorID].buffers.size,gl.UNSIGNED_INT,0);
				//Draw wireframe
				}else{
					gl.drawArrays(gl.LINES, 0,  sector[sectorID].buffers.size);
					//gl.drawElements(gl.LINES, sector[sectorID].buffers.size,gl.UNSIGNED_INT,0);					
				}			
			}
		}	
	//Draw only in frustrum otherwise
	}else{
		for(var k=0 ; k<processList.length ; k++){
			var sectorID = processList[k][0];
			var sectorPos = sector[sectorID].coords;
			var dist = distance_3d(player.sector,sectorPos);
			if(sector[sectorID].buffers.size>0 && 	(check_frustrum( [sectorPos[0]*(blockSettings.chunk.XYZ-2)*blockSettings.sector.XYZ,sectorPos[1]*(blockSettings.chunk.XYZ-2)*blockSettings.sector.XYZ,sectorPos[2]*(blockSettings.chunk.XYZ-2)*blockSettings.sector.XYZ])==true || dist<=1.0)){
				gl.bindVertexArray(sector[sectorID].vao);

				fps.drawLength+=sector[sectorID].buffers.size;
				//Draw the triangles 
				if(renderSettings.wireframe==0){		
					gl.drawArrays(gl.TRIANGLES, 0,  sector[sectorID].buffers.size);
					//gl.drawElements(gl.TRIANGLES, sector[sectorID].buffers.size,gl.UNSIGNED_INT,0);
				//Draw wireframe
				}else{
					gl.drawArrays(gl.LINES, 0,  sector[sectorID].buffers.size);
					//gl.drawElements(gl.LINES, sector[sectorID].buffers.size,gl.UNSIGNED_INT,0);					
				}			
			}
		}			
	}
}

light = {
	pos : [5,5,5],
	look : [0,0,0],
}
time =230;

// Draw the scene.
function render_sectors(processList) {


	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

	var lookPosition = [player.position[0]+Math.sin(player.rotation[0])*Math.cos(player.rotation[1]) , 
	player.position[1]+Math.cos(player.rotation[0])*-Math.cos(player.rotation[1]),
	player.position[2]+Math.sin(player.rotation[1])];

	// first draw from the POV of the light
	const lightWorldMatrix = m4.lookAt(
		[Math.round(player.position[0]+time)+0.1, 600, Math.round(player.position[1])],
		[Math.round(player.position[0]), 0, Math.round(player.position[1])], 
			  // position

		//light.pos,
		//light.look,
		[0, 1, 0],                                              // up
	);
	/*const lightProjectionMatrix = m4.perspective(
		renderSettings.fov * Math.PI / 180,
		1.0,
		0.01,  // near
		20000)   // far
	*/

	const lightProjectionMatrix = m4.orthographic(
				-850 / 2,   // left
				 850 / 2,   // right
				-850 / 2,  // bottom
				 850 / 2,  // top
				 0.5,                      // near
				 2000000);    
		
	// draw to the depth texture
	gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
	gl.viewport(0, 0, depthTextureSize, depthTextureSize);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	drawScene(
		lightProjectionMatrix,
		lightWorldMatrix,
		m4.identity(),
		lightWorldMatrix,
		colorProgramInfo,
		processList,
		1);


	// now draw scene to the canvas projecting the depth texture into the scene
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	let textureMatrix = m4.identity();
	textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
	textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);

	textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);

	// use the inverse of this world matrix to make
	// a matrix that will transform other positions
	// to be relative this this world space.

	textureMatrix = m4.multiply(
		textureMatrix,
		m4.inverse(lightWorldMatrix));

	// Compute the projection matrix
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

	if(renderSettings.orthographic==0){
		var  projectionMatrix = m4.perspective(renderSettings.fov * Math.PI / 180, aspect, 0.01, 20000);
	}else{
		var projectionMatrix =  m4.orthographic(
				-renderSettings.zoom / 2,   // left
				 renderSettings.zoom / 2,   // right
				-renderSettings.zoom / 2,  // bottom
				 renderSettings.zoom / 2,  // top
				 0.5,                      // near
				 2000000);    
		
	}



		


	// Compute the camera's matrix using look at.
	const cameraPosition = [player.position[0], -player.position[2], player.position[1]];
	const target = [lookPosition[0], -lookPosition[2], lookPosition[1]];
	const up = [0, 1, 0];
	const cameraMatrix = m4.lookAt(cameraPosition, target, up);

	create_frustrum();

	drawScene(
		projectionMatrix,
		cameraMatrix,
		textureMatrix,
		lightWorldMatrix,
		textureProgramInfo,
		processList,
		0);



	//If there is a cursor to be drawn
	if(controls.cursorDraw.size!=0){
		//gl.enable(gl.BLEND);
		//Displace cursor 
		var modelMatrix = glMatrix.mat4.create()
		glMatrix.mat4.translate(modelMatrix,modelMatrix ,[controls.cursorPosition[0] - blockSettings.chunk.XYZ/2,-controls.cursorPosition[2]+ blockSettings.chunk.XYZ/2  ,controls.cursorPosition[1]-blockSettings.chunk.XYZ/2]);
		gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix,false,modelMatrix);
		gl.uniform1f(programInfo.uniformLocations.transparency,Math.min(controls.buildStrength/60+0.1,0.7));
		//Draw cursor
		gl.bindVertexArray(controls.cursorDraw.vao);
		//gl.drawElements(gl.TRIANGLES, controls.cursorDraw.size ,gl.UNSIGNED_INT,0);	
		//gl.disable(gl.BLEND);
		gl.drawArrays(gl.TRIANGLES, 0,  controls.cursorDraw.size);
		//gl.drawElements(gl.TRIANGLES, controls.cursorDraw.size ,gl.UNSIGNED_INT,0);	
	}
	
	//drawPoints(projectionMatrix,cameraMatrix);
	drawSky(projectionMatrix,cameraMatrix);

}







