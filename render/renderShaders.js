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
//Block Type
in vec2 aBlockType;

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
flat out lowp vec2 vBlockType;
//out lowp float vTransparency;

void main() {

	//gl_PointSize = 35.0;
	//Get screen position
	
	
	
	gl_Position =  uMatrix * uModelMatrix * vec4(aPosition[0],-aPosition[2],aPosition[1],1.0);
	

	//Size based on distance for shading
	vColor =(distance(vec3(uCam[0],uCam[1],uCam[2]),vec3(aPosition[0],aPosition[1],aPosition[2]))*0.004);	


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
	vCoords =  aPosition;
	vBlockType = aBlockType;
	//vTransparency = uTransparency;
}
`;

//Fragment Shader
const fsSource = `#version 300 es
precision lowp float;
in lowp vec4 vPixelColor;
in lowp float vColor;
in lowp vec3 vTexture;
in lowp vec3 vCoords;
flat in lowp vec2 vBlockType;
//in lowp float vTransparency;

uniform  lowp sampler2DArray uSampler;

out lowp vec4 fragColor;

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

void main() {
	
	


		
	
	//Mix color with shading
	lowp vec3 blending = abs( vTexture );
	blending = normalize(max(blending, 0.00001)); // Force weights to sum to 1.0
	lowp float b = (blending.x + blending.y + blending.z);
	blending /= vec3(b, b, b);
	
	
	// x -z y
	// 0 -2 1

	
	if( (vBlockType[1]==127.0 ||  (noise((abs(vCoords))*1.0) >=0.4) &&  noise((abs(vCoords))*6.5) >=0.45) ){
		lowp vec4 xaxis = texture( uSampler, vec3(vCoords.yz *0.1,vBlockType[0]));
		lowp vec4 yaxis = texture( uSampler, vec3(vCoords.xz *0.1,vBlockType[0]));
		lowp vec4 zaxis = texture( uSampler, vec3(vCoords.xy*0.1,vBlockType[0]));
		fragColor = xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;
	}else{
		lowp vec4 xaxis = texture( uSampler, vec3(vCoords.yz *0.1,vBlockType[1]));
		lowp vec4 yaxis = texture( uSampler, vec3(vCoords.xz *0.1,vBlockType[1]));
		lowp vec4 zaxis = texture( uSampler, vec3(vCoords.xy*0.1,vBlockType[1]));
		fragColor = xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;	
	}

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
	  // type of block 1i 
	  type : gl.getAttribLocation(shaderProgram, 'aBlockType'),
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


