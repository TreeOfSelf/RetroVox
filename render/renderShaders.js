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
//Model Matrix
uniform mat4 uModelMatrix;
//Orthographic
uniform int uOrtho;
//Light amount
uniform float uLight;
//Transparency 
uniform float uTransparency;

out lowp vec4 vPixelColor;
//out lowp float vColor;
//out lowp float vTransparency;

void main() {

	//gl_PointSize = 35.0;
	//Get screen position
	
	
	
	gl_Position =  uMatrix * uModelMatrix * vec4(aPosition[0]/10.0,-aPosition[2]/10.0,aPosition[1]/10.0,1.0);
	

	//Size based on distance for shading
	//vColor =(distance(vec3(uCam[0],uCam[1],uCam[2]),vec3(aPosition[0]/10.0,aPosition[1]/10.0,aPosition[2]/10.0))*uLight);	


	//Different depth depending on orthographic/perspective
	//if(uOrtho==1){
		gl_Position[2]*=0.5;
	//}
	//if(uOrtho==2){
	//	gl_Position[2]*=0.1;
	//}

	//Set color 0-1 based on 255 values
	vPixelColor = vec4(aColor[0]/255.0,aColor[1]/255.0,aColor[2]/255.0,1.0);
	//vTransparency = uTransparency;
}
`;

//Fragment Shader
const fsSource = `#version 300 es
in lowp vec4 vPixelColor;
//in lowp float vColor;
//in lowp float vTransparency;

out lowp vec4 fragColor;

void main() {
	//Mix color with shading
	//fragColor = mix(vPixelColor,vec4(0.0,0.0,0.0,1.0),vColor);
	fragColor = vPixelColor;
	//fragColor.a = vTransparency;
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
		//Projection Matrix
		projectionMatrix : gl.getUniformLocation(shaderProgram,'uMatrix'),
		//Model Matrix
		modelMatrix : gl.getUniformLocation(shaderProgram,'uModelMatrix'),
		//Ortho view
		ortho : gl.getUniformLocation(shaderProgram,'uOrtho'),
		//Light 
		light : gl.getUniformLocation(shaderProgram,'uLight'),
		//Transparency 
		transparency : gl.getUniformLocation(shaderProgram, 'uTransparency'),

	},
};

//Init
//Cursor init


