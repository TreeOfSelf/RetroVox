/*
RetroVox Shaders 9/23/2019

This file will contain shader code as well as program info for uniform/attribute information. 
It also contains the init for rendering (things that only need to be ran once at the beginning)
*/


//Init shader program
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }
  return shaderProgram;
}


//Load shader
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	if(type == gl.FRAGMENT_SHADER){
		var typeInfo = 'FRAGMENT';
	}else{
		 var typeInfo= 'VERTEX';
	}
    alert('An error occurred compiling the shader '+typeInfo+': ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
 

//Vertex Shader
const vsSource = `#version 300 es

//Position of vertex
in vec3 aPosition;
//Block Color
in vec3 aColor;



//Camera Position
uniform vec3 uCam;
//Perspective Matrix
uniform mat4 uMatrix;
//Orthographic
uniform int uOrtho;


out lowp vec4 vPixelColor;
out lowp float vColor;
void main() {

	gl_PointSize = 35.0;
	//Get screen position
	gl_Position =  uMatrix *vec4(aPosition[0],-aPosition[2],aPosition[1],1.0);
	

	//Size based on distance for shading
	vColor =(distance(vec3(uCam[0],uCam[1],uCam[2]),vec3(aPosition[0],aPosition[1],aPosition[2]))*0.2);	
	if(vColor>75.0){
		vColor=max(min(vColor*0.008,0.9),0.7);
	}else{
		if(vColor>30.0){
		vColor=max(min(vColor*0.015,0.7),0.5);	
		}else{
		vColor=min(vColor*0.030,0.5);
		}
	}

	//Different depth depending on orthographic/perspective
	if(uOrtho==1){
		gl_Position[2]*=0.5;
	}
	if(uOrtho==2){
		gl_Position[2]*=0.1;
	}

	//Set color 0-1 based on 255 values
	vPixelColor = vec4(aColor[0]/255.0,aColor[1]/255.0,aColor[2]/255.0,1.0);

}
`;

//Fragment Shader
const fsSource = `#version 300 es
in lowp vec4 vPixelColor;
in lowp float vColor;

out lowp vec4 fragColor;

void main() {
	//Mix color with shading
	fragColor = mix(vPixelColor,vec4(0.0,0.0,0.0,1.0),vColor);
}
`;

//Create shader program

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
//Create shader program info
const programInfo = {
	program: shaderProgram,
	
	attribLocations: {
	// Position 3v (shorts only) 	
	  position: gl.getAttribLocation(shaderProgram, 'aPosition'),
	  // Color 3v (works on 255 scale)
	  color : gl.getAttribLocation(shaderProgram, 'aColor'),
	},
	
	uniformLocations: {
		//Camera coordiantes 3v
		cam : gl.getUniformLocation(shaderProgram, 'uCam'),
		//Projection matrix
		projectionMatrix : gl.getUniformLocation(shaderProgram,'uMatrix'),
		//Ortho view
		ortho : gl.getUniformLocation(shaderProgram,'uOrtho'),

	},
};

//Init
//Cursor init

var blockBuildVao = gl.createVertexArray();
var blockBuildPosition = gl.createBuffer();
var blockBuildColor = gl.createBuffer();
var blockBuildIndexBuffer = gl.createBuffer();
//Bind VAO for cursor
gl.bindVertexArray(blockBuildVao);
//Premade index buffer 
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,blockBuildIndexBuffer);
var indice=[];
for(var k=0;k<=100;k++){
	var q=k*4;
	indice.push(q,q+1,q+2,q,q+2,q+3);
}
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indice), gl.STATIC_DRAW)
//Building buffer for the block infront of you
gl.bindBuffer(gl.ARRAY_BUFFER,blockBuildPosition);
gl.vertexAttribPointer(programInfo.attribLocations.position,3,gl.FLOAT,false,0,0);
gl.enableVertexAttribArray(programInfo.attribLocations.position);	
//Set color buffer
gl.bindBuffer(gl.ARRAY_BUFFER,blockBuildColor);
gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array([
90,90,90,90,90,90,90,90,90,90,90,90,150,150,150,150,150,150,150,150,150,150,150,150,50,50,50,50,50,50,50,50,50,50,50,50,110,110,110,110,110,110,110,110,110,170,170,170,170,170,170,170,170,170,170,170,170,210,210,210,210,210,210,210,210,210,210,210,210,
]),gl.STATIC_DRAW);
gl.vertexAttribPointer(programInfo.attribLocations.color,3,gl.UNSIGNED_BYTE,false,0,0);
gl.enableVertexAttribArray(programInfo.attribLocations.color);
//The position buffer is set every frame from  player_physics


