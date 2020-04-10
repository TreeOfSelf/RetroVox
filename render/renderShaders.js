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
//Block Texture
in vec3 aTexture;


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
out lowp float vColor;
out lowp vec3  vTexture;
out lowp vec3 vCoords;
//out lowp float vTransparency;

void main() {

	//gl_PointSize = 35.0;
	//Get screen position
	
	
	
	gl_Position =  uMatrix * uModelMatrix * vec4(aPosition[0],-aPosition[2],aPosition[1],1.0);
	

	//Size based on distance for shading
	vColor =(distance(vec3(uCam[0],uCam[1],uCam[2]),vec3(aPosition[0],aPosition[1],aPosition[2]))*0.01);	


	//Different depth depending on orthographic/perspective
	//if(uOrtho==1){
		gl_Position[2]*=0.5;
	//}
	//if(uOrtho==2){
	//	gl_Position[2]*=0.1;
	//}

	//Set color 0-1 based on 255 values
	vPixelColor = vec4(aColor[0]/255.0,aColor[1]/255.0,aColor[2]/255.0,1.0);
	vTexture = aTexture;
	vCoords =  vec3(aPosition[0],aPosition[1],aPosition[2]);
	//vTransparency = uTransparency;
}
`;

//Fragment Shader
const fsSource = `#version 300 es
in lowp vec4 vPixelColor;
in lowp float vColor;
in lowp vec3 vTexture;
in lowp vec3 vCoords;
//in lowp float vTransparency;

uniform sampler2D uSampler;

out lowp vec4 fragColor;

void main() {
	//Mix color with shading
	lowp vec3 blending = abs( vTexture );
	blending = normalize(max(blending, 0.00001)); // Force weights to sum to 1.0
	lowp float b = (blending.x + blending.y + blending.z);
	blending /= vec3(b, b, b);
	
	
	// x -z y
	// 0 -2 1
	
	lowp vec4 xaxis = texture( uSampler, vCoords.yz *0.05);
	lowp vec4 yaxis = texture( uSampler, vCoords.xz *0.1);
	lowp  vec4 zaxis = texture( uSampler, vCoords.xy*0.1);
	// blend the results of the 3 planar projections.
	fragColor = mix(xaxis * blending.x + yaxis * blending.y + zaxis * blending.z,vec4(0.0,0.0,0.0,1.0),vColor);
	//fragColor =texture(uSampler,vTexture.xy);
	//fragColor = texture(uSampler,vTexture);
	//fragColor = vPixelColor;
	//fragColor.a = vTransparency;
}
`;

//Create shader program

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
//Create shader program info
const programInfo = {
	program: shaderProgram,
	
	attribLocations: {
	// Position 3v 
	  position: gl.getAttribLocation(shaderProgram, 'aPosition'),
	  // Color 3v (works on 255 scale)
	  color : gl.getAttribLocation(shaderProgram, 'aColor'),
	  // vertex normal 3v 
	  texture : gl.getAttribLocation(shaderProgram, 'aTexture'),
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
		//Texture Sampler 
		textureSampler : gl.getUniformLocation(shaderProgram, 'uSampler'),

	},
};

//Init
//Cursor init


