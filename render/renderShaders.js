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


canvas = document.getElementById("retroCanvas");
const gl = canvas.getContext("webgl2",{
	alpha: false,
	antialias : true,
	//premultipliedAlpha: false, 
});


//Point Shader

const pointVS = `#version 300 es
in vec3 a_position;
in vec3 a_color;

out vec3 v_color;

uniform mat4 u_projection;
uniform mat4 u_world;
uniform mat4 u_view;

void main() {
  // Multiply the position by the matrices.
	gl_Position =  u_projection	* u_view * u_world * vec4(a_position[0],-a_position[2],a_position[1],1.0);
	gl_PointSize = 300.0/gl_Position[2];
	v_color = a_color;

}
`;

const pointFS = `#version 300 es
precision mediump float;

in vec3 v_color;

out vec4 outColor;

void main() {
  outColor = vec4(0.0,1.0,0.0,1.0);
  outColor.rgb = v_color;
  //gl_FragDepth=-500.0;
}
`;
 



//Depth Shader

const colorVS = `#version 300 es
in vec3 a_position;

uniform mat4 u_projection;
uniform mat4 u_world;
uniform mat4 u_view;

void main() {
  // Multiply the position by the matrices.
	gl_Position =  u_projection	* u_view * u_world * vec4(a_position[0],-a_position[2],a_position[1],1.0);
}
`;

const colorFS = `#version 300 es
precision mediump float;

out vec4 outColor;

void main() {
  outColor = vec4(1.0,1.0,0.0,1.0);
}
`;
 
 
 
 
//Normal Shader

//Vertex Shader
const vsSource = `#version 300 es


in vec3 a_position;
in vec3 a_color;
in vec3 a_normal;
in vec2 a_type;


uniform mat4 u_projection;
uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_textureMatrix;


out vec4 v_pixelColor;
out vec3  v_normal;
out vec3 v_coords;
out vec4 v_projectedCoords;
flat out vec2 v_type;

void main() {


	
	gl_Position =  u_projection * u_view * u_world * vec4(a_position[0],-a_position[2],a_position[1],1.0);
	


	v_projectedCoords = u_textureMatrix *   vec4(a_position[0],-a_position[2],a_position[1],1.0);;
	//Set color 0-1 based on 255 values
	v_pixelColor = vec4(a_color[0]/255.0,a_color[1]/255.0,a_color[2]/255.0,1.0);
	v_normal = a_normal;
	v_coords =  a_position;
	v_type = a_type;
}
`;

//Fragment Shader
const fsSource = `#version 300 es
precision highp float;
in vec4 v_color;
in vec3 v_normal;
in vec3 v_coords;
in vec4 v_projectedCoords;
flat in vec2 v_type;



uniform  highp sampler2DArray u_sampler;
uniform float u_transparency;
uniform vec3 u_reverseLight;
uniform sampler2D u_projectedTexture;

out vec4 fragColor;

void main() {
	
	
	vec3 projectedTexcoord = v_projectedCoords.xyz / v_projectedCoords.w;
	float currentDepth = projectedTexcoord.z  -0.000005;//-0.0000006;//-0.00001;

	bool inRange =
	  projectedTexcoord.x >= 0.0 &&
	  projectedTexcoord.x <= 1.0 &&
	  projectedTexcoord.y >= 0.0 &&
	  projectedTexcoord.y <= 1.0;
	  
	float projectedDepth = texture(u_projectedTexture, projectedTexcoord.xy).r;
	float shadowLight = (inRange && projectedDepth <= currentDepth) ? 0.0 : 1.0;

	vec3 blending = abs( v_normal );
	blending = normalize(max(blending, 0.00001)); // Force weights to sum to 1.0
	float b = (blending.x + blending.y + blending.z);
	blending /= vec3(b, b, b);
	
	
	
	vec4 xaxis = texture( u_sampler, vec3(v_coords.yz *0.23,v_type[0]));
	vec4 yaxis = texture( u_sampler, vec3(v_coords.xz *0.23,v_type[0]));
	vec4 zaxis = texture( u_sampler, vec3(v_coords.xy*0.23,v_type[0]));
	fragColor = xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;


	fragColor.rgb*= max(0.45,min(dot(vec3(v_normal[0],-v_normal[2],v_normal[1]),normalize(u_reverseLight))*1.0,1.0)* shadowLight);
	fragColor.a = u_transparency;


}
`;

//Create shader program


//Definitions 
const programOptions = {
attribLocations: {
  'a_position': 0,
  'a_color':    1,
  'a_normal':   2,
  'a_type': 3,

},
};
const textureProgramInfo = twgl.createProgramInfo(gl, [vsSource, fsSource], programOptions);
const colorProgramInfo = twgl.createProgramInfo(gl, [colorVS, colorFS], programOptions);
const pointProgramInfo = twgl.createProgramInfo(gl, [pointVS, pointFS]);


// Tell the twgl to match position with a_position,
// normal with a_normal etc..
twgl.setAttributePrefix("a_");

const programInfo = {
	program: textureProgramInfo.program,
	
	attribLocations: {
	// Position 3v 
	  position: gl.getAttribLocation(textureProgramInfo.program, 'a_position'),
	  // Color 3v (works on 255 scale)
	  color : gl.getAttribLocation(textureProgramInfo.program, 'a_color'),
	  // vertex normal 3v 
	  texture : gl.getAttribLocation(textureProgramInfo.program, 'a_normal'),
	  // type of block 1i 
	  type : gl.getAttribLocation(textureProgramInfo.program, 'a_type'),
	},
	
	uniformLocations: {
		//Projection Matrix
		projectionMatrix : gl.getUniformLocation(textureProgramInfo.program,'u_projection'),
		//Model Matrix
		modelMatrix : gl.getUniformLocation(textureProgramInfo.program,'u_world'),
		//View Matrix
		viewMatrix : gl.getUniformLocation(textureProgramInfo.program,'u_view'),
		//Transparency 
		transparency : gl.getUniformLocation(textureProgramInfo.program, 'u_transparency'),
		//Texture Sampler 
		textureSampler : gl.getUniformLocation(textureProgramInfo.program, 'u_sampler'),
		projectedTexture : gl.getUniformLocation(textureProgramInfo.program, 'u_projectedTexture'),
		reverseLight : gl.getUniformLocation(textureProgramInfo.program,'u_reverseLight'),


	},
};

const pointInfo = {
	program : pointProgramInfo,
	
	attribLocations : {
		position: gl.getAttribLocation(textureProgramInfo.program, 'a_position'),
		color: gl.getAttribLocation(textureProgramInfo.program, 'a_color'),
	}
}
