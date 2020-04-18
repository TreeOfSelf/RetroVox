/*
RetroVox Main Render 9/23/2019

This file will contain everything relating to sectors/chunks/blocks 
*/

testObj = {
	vertices : [
	1,2,3,
	3,4,5,
	5,6,7,
	7,8,9,
	8,10,12,
	13,14,15,
	],
	faces : [
	0,1,2,
	3,4,5,
	],
}


//0 = drawing with Float32Arrays (more accuracy)
//1 = drawing with Int16 (less data bandwidth)
var drawType = 0
var loadDisplay = document.getElementById('result');
switch(drawType){
	case 0:
	dataType = Float32Array;
	dataTypeGL = gl.FLOAT;
	break;
	case 1:
	dataType = Int8Array;
	dataTypeGL = gl.SHORT;
	break;
}



//Mesh worker thread
//Controls chunk data , chunk meshing, sector meshing
var meshWorker ={ 
	//Worker thread
	worker : new Worker('./render/renderMesher.js'),

};

//messaging from mesh thread 
meshWorker.worker.addEventListener('message', function(e) {
	var message = e.data;
	switch(message.id){
		
		case 'testObj':
		
			testObj.vertices = message.vertices;
			testObj.faces = message.faces;
		break;
	
		case 'finishSave':
		download(message.text,'save');
		break;
		
		case 'loadProgress':
			loadDisplay.innerText = message.amount;
		break;
		
	//Receive mesh	of cursor
		case "mesh":
		//Chunk mesh
		//Set size of the sector to how many verticies 
		message.result[2] = new Uint32Array(message.result[2]);
		controls.cursorDraw.size=message.result[2].length;
		
		console.log({
			finalVert : new Float32Array(message.result[0]),
			color : new Uint8Array(message.result[1]),
			faces : message.result[2],
			texture : new Float32Array(message.result[3]),
			type : new Uint8Array(message.result[4]),
		});
		
		
		
		//Bind this sector VAO
		gl.bindVertexArray(controls.cursorDraw.vao);
		//Set data for indice
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, controls.cursorDraw.buffers.indice);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,message.result[2],gl.DYNAMIC_DRAW);
		//position
		gl.bindBuffer(gl.ARRAY_BUFFER, controls.cursorDraw.buffers.position);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(message.result[0]),gl.DYNAMIC_DRAW);
		//colorsss
		gl.bindBuffer(gl.ARRAY_BUFFER, controls.cursorDraw.buffers.color);
		gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(message.result[1]),gl.DYNAMIC_DRAW);
		//texture
		gl.bindBuffer(gl.ARRAY_BUFFER, controls.cursorDraw.buffers.texture);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(message.result[3]),gl.DYNAMIC_DRAW);
		//type
		
		gl.bindBuffer(gl.ARRAY_BUFFER, controls.cursorDraw.buffers.type);
		gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(message.result[4]),gl.DYNAMIC_DRAW);
		break;
		
		//Sector drawing
		
		case 'sector':
		if(sector[message.sectorID]==null){
			sector_create(message.coords[0],message.coords[1],message.coords[2]);
		}
		message.indice =new Uint32Array(message.indice);
		message.position = new dataType(message.position);
		message.color = new Uint8Array(message.color);
		message.texture = new Float32Array(message.texture);
		message.type = new Uint8Array(message.type);
		//Set size of the sector to how many verticies 
		sector[message.sectorID].buffers.size=message.size;
		
		//If the buffer is not big enough, create a new buffer with appropriote size
		
		if(sector[message.sectorID].buffers.maxTypeSize < message.type.length ||  sector[message.sectorID].buffers.maxIndiceSize < message.indice.length || sector[message.sectorID].buffers.maxTextureSize < message.texture.length || sector[message.sectorID].buffers.maxPositionSize < message.position.length ||  sector[message.sectorID].buffers.maxColorSize < message.color.length){
			sector[message.sectorID].buffers.maxIndiceSize = message.indice.length;
			sector[message.sectorID].buffers.maxColorSize = message.color.length;
			sector[message.sectorID].buffers.maxPositionSize = message.position.length;
			sector[message.sectorID].buffers.maxTextureSize = message.texture.length;
			sector[message.sectorID].buffers.maxTypeSize = message.type.length;
			//Bind this sector VAO
			gl.bindVertexArray(sector[message.sectorID].vao);
			//Set data for indice
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sector[message.sectorID].buffers.indice);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,message.indice,gl.STATIC_DRAW,0,message.indice.length);
			//gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER,0,message.indice,0,message.indice.length);
			//position
			gl.bindBuffer(gl.ARRAY_BUFFER, sector[message.sectorID].buffers.position);
			gl.bufferData(gl.ARRAY_BUFFER,message.position,gl.STATIC_DRAW,0,message.position.length);
			//gl.bufferSubData(gl.ARRAY_BUFFER,0,message.position,0,message.position.length);
			//color
			gl.bindBuffer(gl.ARRAY_BUFFER, sector[message.sectorID].buffers.color);
			gl.bufferData(gl.ARRAY_BUFFER,message.color,gl.STATIC_DRAW,0,message.color.length);
			//texture
			gl.bindBuffer(gl.ARRAY_BUFFER, sector[message.sectorID].buffers.texture);
			gl.bufferData(gl.ARRAY_BUFFER,message.texture,gl.STATIC_DRAW,0,message.texture.length);			
			//type
			gl.bindBuffer(gl.ARRAY_BUFFER, sector[message.sectorID].buffers.type);
			gl.bufferData(gl.ARRAY_BUFFER,message.type,gl.STATIC_DRAW,0,message.type.length);
			//gl.bufferSubData(gl.ARRAY_BUFFER,0,message.color,0,message.color.length);
			
		//If the buffer IS big enough, subData new sector draw data in
		}else{
			//Bind this sector VAO
			gl.bindVertexArray(sector[message.sectorID].vao);
			//Set data for indice
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sector[message.sectorID].buffers.indice);
			gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER,0,message.indice,0,message.indice.length);
			//position
			gl.bindBuffer(gl.ARRAY_BUFFER, sector[message.sectorID].buffers.position);
			gl.bufferSubData(gl.ARRAY_BUFFER,0,message.position,0,message.position.length);
			//color
			gl.bindBuffer(gl.ARRAY_BUFFER, sector[message.sectorID].buffers.color);
			gl.bufferSubData(gl.ARRAY_BUFFER,0,message.color,0,message.color.length);	
			//texture
			gl.bindBuffer(gl.ARRAY_BUFFER, sector[message.sectorID].buffers.texture);
			gl.bufferSubData(gl.ARRAY_BUFFER,0,message.texture,0,message.texture.length);	
			//type
			gl.bindBuffer(gl.ARRAY_BUFFER, sector[message.sectorID].buffers.type);
			gl.bufferSubData(gl.ARRAY_BUFFER,0,message.type,0,message.type.length);
		}
		
		
		break;
		
	}

});


//Send chunk data to mesher thread

mesh_naive = function(chunkID,chunkData,chunkType,chunkDim,chunkPos,Lod){
	meshWorker.worker.postMessage({
		id : 'mesh',
		chunkID : chunkID,
		data : chunkData,
		dataType : chunkType,
		dims : chunkDim,
		chunkPos : chunkPos,
		LOD : Lod,
	});
}

//Chunk List and Sector List
var chunk=new Map();
var sector=new Map();



//list of active chunks.
var activeChunks=[];
//list of active sectors
var activeSectors=[];

//The space variables define the limit of how far out they can go, and is used to determine a chunk/sector's 1D index. 
//The XYZ variable determines the size cubed it contains.

//The hierarchy is 

//    sector 
//      |         The reason we have sectors is to reduce draw calls, by adding in multiple chunk's
//    chunk       drawing information, while still being able to quickly calculate smaller chunks. 
//      |
//    blocks 


//Settings object 
var blockSettings = {
	chunk : {
		space : 200,
		XYZ : 24,
	},
	
	sector : {
		space : 200,
		XYZ : 6,
	},
	
	//Determines how far out to process chunks
	processDistance : {
		XY : 3,
		Z : 3,
	},
	
	//How far out multiplied by process Distance to less agressively process farther out chunks
	processDistanceFar : 10,
	processDistanceFarSearchLimit : 5,
	
	//Amount of chunks allowed to proceaass in one frame
	processLimit : 5000,
	
	//LOD distances Near/Far
	LODdistance : [15,30]
	
}


//Function to start mesh worker
//Also can be used to clear mesh worker data
mesh_start = function(){
	meshWorker.worker.postMessage({
		id : 'start',
		chunkSpace : blockSettings.chunk.space,
		sectorXYZ : blockSettings.sector.XYZ,
		drawType : drawType,
		blockSettings : JSON.stringify(blockSettings),
		player : JSON.stringify(player),
	});
}
	

//Send player information every half second to the mesher thread
setInterval(function(){
	meshWorker.worker.postMessage({
		id : 'player',
		player : JSON.stringify(player),
	});
	
},1);
setInterval(function(){
	cursor_sendData();
},60);

			



//Coordinates for where we are in our farther our processing 
blockSettings.processCoords = [
	-blockSettings.processDistanceFar, //X
	-blockSettings.processDistanceFar, //Y
	-blockSettings.processDistanceFar,  //Z
];


// BLOCK FUNCTIONS


//Returns true if a block is a solid density 
block_exists = function(x,y,z){
	//get location of chunk from block XYZ
	var chunkPosition = chunk_get(x,y,z);
		
	//get id from location of chunks
	var chunkID = chunk_returnID(chunkPosition[0],chunkPosition[1],chunkPosition[2]);
	//formula to get location of block relative inside of the chunks space.
	// x - (chunkX*chunkXYZ) for each axis
	var blockLocation = [(x) - (chunkPosition[0]*blockSettings.chunk.XYZ), (y) - (chunkPosition[1]*blockSettings.chunk.XYZ),(z) - (chunkPosition[2]*blockSettings.chunk.XYZ)]
	//get 1d index from relative location
	var blockIndex = blockLocation[0]+blockLocation[1]*blockSettings.chunk.XYZ+blockLocation[2]*blockSettings.chunk.XYZ*blockSettings.chunk.XYZ;

	//Generate chunk if it doesn't exists
	if(chunk[chunkID]==null || chunk[chunkID].blockArray[blockIndex]>0){
		return(false);
	}else{
		return(true);
	}
}




// CHUNK FUNCTIONS


//Returns chunkID from chunk XYZ
chunk_returnID = function(x,y,z){
	return(x+blockSettings.chunk.space*(y+blockSettings.chunk.space*z));
}

//Returns chunk XYZ from block space XYZ
chunk_get =function(x,y,z){
	return([Math.floor(x/blockSettings.chunk.XYZ),Math.floor(y/blockSettings.chunk.XYZ),Math.floor(z/blockSettings.chunk.XYZ)]);
}
//Returns chunk XYZ from block space XYZ - 2 removing the borderStyle
//This is used for chunk selection in game space
chunk_get_no_border =function(x,y,z){
	return([Math.floor(x/ (blockSettings.chunk.XYZ-2)),Math.floor(y/ (blockSettings.chunk.XYZ-2)),Math.floor(z/(blockSettings.chunk.XYZ-2))]);
}


	


//SECTOR FUNCTIONS

//Returns sectorID from  sector XYZ
sector_returnID = function(x,y,z){
	return(x+blockSettings.sector.space*(y+blockSettings.sector.space*z));
}

//Returns sector XYZ from chunk XYZ
sector_get =function(x,y,z){
	return([Math.floor(x/blockSettings.sector.XYZ),Math.floor(y/blockSettings.sector.XYZ),Math.floor(z/blockSettings.sector.XYZ)]);
}


sector_create = function(x,y,z){
	//Receive sector ID from XYZ
	var sectorID = sector_returnID(x,y,z);
	//If sector hasn't been created
	if(sector[sectorID]==null){
		activeSectors.push(sectorID);
		//Create new chunk
		sector[sectorID]={
			//reDraw flag
			reDraw : 1,
			//coordinates
			coords : [x,y,z],
			//Buffer data for draw calls, this is compiled from chunks in our space. 
			buffers : {
				//3 shorts XYZ 
				position :gl.createBuffer(),
				//3 integers 0-255  RGB
				color : gl.createBuffer(),
				//Unsigned 32 bit integers representing the vertex for each indice 
				indice : gl.createBuffer(),
				//Unsigned 32 bit integers representing the vertex for texture coordinates 
				texture : gl.createBuffer(),
				//Unsigned 4 bit integers representing the block type 0-255
				type : gl.createBuffer(),
				//How many indices we are going to draw
				size : 0,
				//How big our allocated buffer size is
				maxPositionSize : 0,
				maxColorSize : 0,
				maxIndiceSize : 0,
				maxTextureSize : 0,
				maxTypeSize : 0,
			},
			//Vertex Array Object, this contains draw information that can be used in one call.
			vao : gl.createVertexArray(),
			
		}
		
		//Set up vertex array object with our buffers
		gl.bindVertexArray(sector[sectorID].vao);
		
		//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,sector[sectorID].buffers.indice);
		//gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,999999,gl.DYNAMIC_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER,sector[sectorID].buffers.position);
		gl.vertexAttribPointer(programInfo.attribLocations.position,3,gl.FLOAT,false,0,0);
		//gl.bufferData(gl.ARRAY_BUFFER,999999,gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(programInfo.attribLocations.position);	
		
		gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.color);
		gl.vertexAttribPointer(programInfo.attribLocations.color,3,gl.UNSIGNED_BYTE,false,0,0);
		gl.enableVertexAttribArray(programInfo.attribLocations.color);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.texture);
		gl.vertexAttribPointer(programInfo.attribLocations.texture,3,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(programInfo.attribLocations.texture);

		gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.type);
		gl.vertexAttribPointer(programInfo.attribLocations.type,2,gl.UNSIGNED_BYTE,false,0,0);
		gl.enableVertexAttribArray(programInfo.attribLocations.type);

		//gl.bufferData(gl.ARRAY_BUFFER,999999,gl.DYNAMIC_DRAW);

	}
}


