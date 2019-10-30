/*
RetroVox Main Render 9/23/2019

This file will contain everything relating to sectors/chunks/blocks 
*/




//0 = drawing with Float32Arrays (more accuracy)
//1 = drawing with Int16 (less data bandwidth)
var drawType = 1
var loadDisplay = document.getElementById('result');
switch(drawType){
	case 0:
	dataType = Float32Array;
	dataTypeGL = gl.FLOAT;
	break;
	case 1:
	dataType = Int16Array;
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
		message.result[2] = new Uint16Array(message.result[2]);
		controls.cursorDraw.size=message.result[2].length/2;
		//Bind this sector VAO
		gl.bindVertexArray(controls.cursorDraw.vao);
		//Set data for indice
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, controls.cursorDraw.buffers.indice);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,message.result[2],gl.DYNAMIC_DRAW);
		//position
		gl.bindBuffer(gl.ARRAY_BUFFER, controls.cursorDraw.buffers.position);
		gl.bufferData(gl.ARRAY_BUFFER,new dataType(message.result[0]),gl.DYNAMIC_DRAW);
		//colorsss
		gl.bindBuffer(gl.ARRAY_BUFFER, controls.cursorDraw.buffers.color);
		gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(message.result[1]),gl.DYNAMIC_DRAW);
		break;
		
		//Sector drawing
		
		case 'sector':
		if(sector[message.sectorID]==null){
			sector_create(message.coords[0],message.coords[1],message.coords[2]);
		}
		message.indice =new Uint32Array(message.indice);
		message.position = new dataType(message.position);
		message.color = new Uint8Array(message.color);
		
		//Set size of the sector to how many verticies 
		sector[message.sectorID].buffers.size=message.size;
		
		//If the buffer is not big enough, create a new buffer with appropriote size
		
		if(sector[message.sectorID].buffers.maxIndiceSize < message.indice.length || sector[message.sectorID].buffers.maxPositionSize < message.position.length ||  sector[message.sectorID].buffers.maxColorSize < message.color.length){
			sector[message.sectorID].buffers.maxIndiceSize = message.indice.length;
			sector[message.sectorID].buffers.maxColorSize = message.color.length;
			sector[message.sectorID].buffers.maxPositionSize = message.position.length;
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
		space : 64,
		XYZ : 32,
	},
	
	sector : {
		space : 32,
		XYZ : 10,
	},
	
	//Determines how far out to process chunks
	processDistance : {
		XY : 10,
		Z : 10,
	},
	
	//How far out multiplied by process Distance to less agressively process farther out chunks
	processDistanceFar : 20,
	processDistanceFarSearchLimit : 10000,
	
	//Amount of chunks allowed to process in one frame
	processLimit : 20,
	
	//LOD distances Near/Far
	LODdistance : [15,19]
	
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
},500);

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
				//How many indices we are going to draw
				size : 0,
				//How big our allocated buffer size is
				maxPositionSize : 0,
				maxColorSize : 0,
				maxIndiceSize : 0,
			},
			//Vertex Array Object, this contains draw information that can be used in one call.
			vao : gl.createVertexArray(),
			
		}
		
		//Set up vertex array object with our buffers
		gl.bindVertexArray(sector[sectorID].vao);
		
		//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,sector[sectorID].buffers.indice);
		//gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,999999,gl.DYNAMIC_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER,sector[sectorID].buffers.position);
		gl.vertexAttribPointer(programInfo.attribLocations.position,3,dataTypeGL,false,0,0);
		//gl.bufferData(gl.ARRAY_BUFFER,999999,gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(programInfo.attribLocations.position);	
		
		gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.color);
		gl.vertexAttribPointer(programInfo.attribLocations.color,3,gl.UNSIGNED_BYTE,false,0,0);
		//gl.bufferData(gl.ARRAY_BUFFER,999999,gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(programInfo.attribLocations.color);
	}
}


