/*
 ____  _  _   __   ____  ____  ____  ____ 
/ ___)/ )( \ / _\ (    \(  __)(  _ \/ ___)
\___ \) __ (/    \ ) D ( ) _)  )   /\___ \
(____/\_)(_/\_/\_/(____/(____)(__\_)(____/

Shaders & uniform/attribute information 

 */

//Definitions

//Get canvas 
canvas = document.querySelector("#pandaCanvas");

//Get gl context and turn of premultiplied alpha
const gl = canvas.getContext("webgl2",{
	alpha: false,
	antialias : false,
});


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
 



/*
  ___  _  _  ____  ____    ____  _  _   __   ____  ____  ____ 
 / __)/ )( \(  _ \(  __)  / ___)/ )( \ / _\ (    \(  __)(  _ \
( (__ ) \/ ( ) _ ( ) _)   \___ \) __ (/    \ ) D ( ) _)  )   /
 \___)\____/(____/(____)  (____/\_)(_/\_/\_/(____/(____)(__\_)
*/


//Vertex Shader
const vsSourceCube = `#version 300 es

//Block Position
in vec3 aPixelPosition;
//Block Color
in vec3 aPixelColor;



//Camera Position
uniform vec3 uCam;
//Perspective Matrix
uniform mat4 uMatrix;
//Orthographic
uniform int uOrtho;

out lowp vec4 vPixelColor;
out lowp float vSize;
void main() {


	//Get screen position
	gl_Position =  uMatrix *vec4(aPixelPosition[0],-aPixelPosition[2],aPixelPosition[1],1.0);
	

	//Size based on distance for shading
	vSize =(distance(vec3(uCam[0],uCam[1],uCam[2]),vec3(aPixelPosition[0],aPixelPosition[1],aPixelPosition[2]))*0.2);	
	if(vSize>75.0){
		vSize=max(min(vSize*0.008,0.9),0.7);
	}else{
		if(vSize>30.0){
		vSize=max(min(vSize*0.015,0.7),0.5);	
		}else{
		vSize=min(vSize*0.030,0.5);
		}
	}

	if(uOrtho==1){
		gl_Position[2]*=0.5;
	}else{
		gl_Position[2]*=0.1;
	}

	vPixelColor = vec4(aPixelColor[0]/255.0,aPixelColor[1]/255.0,aPixelColor[2]/255.0,1.0);

}
`;

//Fragment Shader
const fsSourceCube = `#version 300 es
in lowp vec4 vPixelColor;
in lowp float vSize;

out lowp vec4 fragColor;

void main() {
	//Mix color with shading
	fragColor = mix(vPixelColor,vec4(0.0,0.0,0.0,1.0),vSize);
	//fragColor = vPixelColor;
	//fragColor = vec4(gl_FragCoord.z,gl_FragCoord.z,gl_FragCoord.z,1.0);
	//gl_FragColor=vPixelColor;
}
`;

//Create shader program

const shaderProgramCube = initShaderProgram(gl, vsSourceCube, fsSourceCube);
//Create shader program info
const programInfoCube = {
	program: shaderProgramCube,
	
	attribLocations: {
		//Voxel Position 3v
	  voxelPosition: gl.getAttribLocation(shaderProgramCube, 'aPixelPosition'),
	  //Voxel Color 3v
	  voxelColor : gl.getAttribLocation(shaderProgramCube, 'aPixelColor'),
	},
	
	uniformLocations: {
		//Camera coordiantes 3v
		cam : gl.getUniformLocation(shaderProgramCube, 'uCam'),
		//Projection matrix
		projectionMatrix : gl.getUniformLocation(shaderProgramCube,'uMatrix'),
		//Ortho view
		ortho : gl.getUniformLocation(shaderProgramCube,'uOrtho'),

	},
};
