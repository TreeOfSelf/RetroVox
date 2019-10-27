/*
RetroVox Main Render 9/23/2019

This file will contain everything relating to sectors/chunks/blocks 
*/



var meshWorker ={ 
	worker : new Worker('./render/renderMesher.js'),
	busy : 0,
};
//,essaging from mesh thread 
meshWorker.worker.addEventListener('message', function(e) {
	var message = e.data;
	switch(message.id){
		
		
		case "mesh": 
		meshWorker.busy=0;
		if(message.chunkID!='cursor'){
			//Get sector chunk is in
			var sectorPosition = sector_get(chunk[message.chunkID].coords[0],chunk[message.chunkID].coords[1],chunk[message.chunkID].coords[2]);
			//Draw the sector now that it has new information
			var sectorID=sector_returnID(sectorPosition[0],sectorPosition[1],sectorPosition[2]);

			if(sector[sectorID]==null){
				sector_create(sectorPosition[0],sectorPosition[1],sectorPosition[2]);
			}
			sector[sectorID].reDraw=1;	
			
		}else{
			//Set size of the sector to how many verticies 
			message.result[2] = new Uint16Array(message.result[2]);
			controls.cursorDraw.size=message.result[2].length/2;
			//Bind this sector VAO
			gl.bindVertexArray(controls.cursorDraw.vao);
			//Set data for indice
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, controls.cursorDraw.buffers.indice);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,message.result[2],gl.STATIC_DRAW);
			//position
			gl.bindBuffer(gl.ARRAY_BUFFER, controls.cursorDraw.buffers.position);
			gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(message.result[0]),gl.STATIC_DRAW);
			//colorsss
			gl.bindBuffer(gl.ARRAY_BUFFER, controls.cursorDraw.buffers.color);
			gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(message.result[1]),gl.STATIC_DRAW);
		}
		break;
		
		case 'sector':
		meshWorker.busy=0;
		
		message.indice =new Uint32Array(message.indice);
		message.position = new Float32Array(message.position);
		message.color = new Uint8Array(message.color);
		//Set size of the sector to how many verticies 
		sector[message.sectorID].buffers.size=message.size;
		//Bind this sector VAO
		gl.bindVertexArray(sector[message.sectorID].vao);
		//Set data for indice
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sector[message.sectorID].buffers.indice);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,message.indice,gl.DYNAMIC_DRAW,0,message.indice.length);
		//gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER,0,message.indice,0,message.indice.length);
		//position
		gl.bindBuffer(gl.ARRAY_BUFFER, sector[message.sectorID].buffers.position);
		gl.bufferData(gl.ARRAY_BUFFER,message.position,gl.DYNAMIC_DRAW,0,message.position.length);
		//gl.bufferSubData(gl.ARRAY_BUFFER,0,message.position,0,message.position.length);
		//color
		gl.bindBuffer(gl.ARRAY_BUFFER, sector[message.sectorID].buffers.color);
		gl.bufferData(gl.ARRAY_BUFFER,message.color,gl.DYNAMIC_DRAW,0,message.color.length);
		//gl.bufferSubData(gl.ARRAY_BUFFER,0,message.color,0,message.color.length);	
		
		
		
		break;
		
	}

});


mesh_naive = function(chunkID,chunkData,chunkType,chunkDim,chunkPos,Lod){
	meshWorker.busy=1;
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
		XYZ : 1,
	},
	
	//Determines how far out to process chunks
	processDistance : {
		XY : 5,
		Z : 5,
	},
	
	//How far out multiplied by process Distance to less agressively process farther out chunks
	processDistanceFar : 20,
	
	
	//Amount of chunks allowed to process in one frame
	processLimit : 10,
	
}

meshWorker.worker.postMessage({
	id : 'start',
	chunkSpace : blockSettings.chunk.space,
	sectorXYZ : blockSettings.sector.XYZ,
});


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


//Snaps block from game position to grid position
block_build = function(x,y,z,del){

	//Get chunk that this position resides in
	var blockChunk = chunk_get_no_border(x,y,z);
	
	//Offset position by chunk
	x+=blockChunk[0]*2;
	y+=blockChunk[1]*2;
	z+=blockChunk[2]*2;
	
	//Get location within chunk 
	
	var blockLocation = [(Math.round(x)) - (blockChunk[0]*blockSettings.chunk.XYZ), (Math.round(y)) - (blockChunk[1]*blockSettings.chunk.XYZ),(Math.round(z)) - (blockChunk[2]*blockSettings.chunk.XYZ)];
	
	//Displace edges 
	
	
	
	if(blockLocation[0]==0){
		x-=2;
	}
	if(blockLocation[1]==0){
		y-=2;
	}
	if(blockLocation[2]==0){
		z-=2;
	}

	
	//Send to block change function to preform actual build/delete 
	block_change(x,y,z,del,0,controls.buildType);
	
}

//Finds chunk of block, and then adds to the desnity of the block within the chunk.
block_change = function(x,y,z,del,amount,buildType){
	
	//get location of chunk from block XYZ
	var chunkPosition = chunk_get(x,y,z);
		
	//get id from location of chunks
	var chunkID = chunk_returnID(chunkPosition[0],chunkPosition[1],chunkPosition[2]);
	//formula to get location of block relative inside of the chunks space.
	// x - (chunkX*chunkXYZ) for each axis
	var blockLocation = [(x) - (chunkPosition[0]*blockSettings.chunk.XYZ), (y) - (chunkPosition[1]*blockSettings.chunk.XYZ),(z) - (chunkPosition[2]*blockSettings.chunk.XYZ)]

	//Fill edges of bordering chunk(s)
	
	//Offset variables
	var xOff=0;var yOff=0;var zOff=0;

	//Check if we are on edges

	//X edge
	switch(blockLocation[0]){
		case 1:
		xOff=-2;
		break;
		case blockSettings.chunk.XYZ-2:
		xOff=2;
		break;
	}
	//Y edge
	switch(blockLocation[1]){
		case 1:
		yOff=-2;
		break;
		case blockSettings.chunk.XYZ-2:
		yOff=2;
		break;
	}
	//Z edge
	switch(blockLocation[2]){
		case 1:
		zOff=-2;
		break;
		case blockSettings.chunk.XYZ-2:
		zOff=2;
		break;
	}

	
	
	//get 1d index from relative location
	var blockIndex = blockLocation[0]+blockLocation[1]*blockSettings.chunk.XYZ+blockLocation[2]*blockSettings.chunk.XYZ*blockSettings.chunk.XYZ;

	//Generate chunk if it doesn't exists
	if(chunk[chunkID]==null){
	chunk_create(chunkPosition[0],chunkPosition[1],chunkPosition[2]);
	}
	
	
	
	//Add/Delete density based on distance to build position (your cursor)
	
	//Calculate distance from cursor, minimum of 1 so we don't get divides by 0.

	//this v 
	
	var dist = (controls.buildStrength  / ( Math.max(distance_3d([x-chunkPosition[0]*2,y-chunkPosition[1]*2,z-chunkPosition[2]*2],[controls.cursorFixedPosition[0]-controls.cursorChunk[0]*2,controls.cursorFixedPosition[1]-controls.cursorChunk[1]*2,controls.cursorFixedPosition[2]-controls.cursorChunk[2]*2]),1)*0.25));
	
	
	
	if(controls.buildStrength>=20){
		dist=128;
	}
	
	switch(del){
	//Build
	case 0:
		//Set density of block

		//Set type of block
		if(chunk[chunkID].blockType[blockIndex]==0){
			chunk[chunkID].blockType[blockIndex]=buildType;
		}
		
		
		
		if(chunk[chunkID].blockArray[blockIndex]-dist<=-127){
			chunk[chunkID].blockArray[blockIndex]=-127;
		}else{
			chunk[chunkID].blockArray[blockIndex]-=dist
		}
	break;
	//Delete
	case 1:

		if(chunk[chunkID].blockArray[blockIndex]+dist>64){
			chunk[chunkID].blockArray[blockIndex]=64;
		}else{
			chunk[chunkID].blockArray[blockIndex]+=dist;
		}
		
		//Delete previous block type if we arent a visible block anymore

		if(chunk[chunkID].blockArray[blockIndex]>=0){
			chunk[chunkID].blockType[blockIndex]=0;
		}
	break;
	case 2:
	//Inherit (for connecting block data)
		chunk[chunkID].blockArray[blockIndex]=amount;	
		chunk[chunkID].blockType[blockIndex] = buildType;
	break;
	}
	
 
	
	//Unoptimized checks 
	if(xOff !=0){
		block_change(x+xOff,y,z,2,chunk[chunkID].blockArray[blockIndex],chunk[chunkID].blockType[blockIndex]);
	}
	if(yOff !=0){
		block_change(x,y+yOff,z,2,chunk[chunkID].blockArray[blockIndex],chunk[chunkID].blockType[blockIndex]);
	}
	if(zOff !=0){
		block_change(x,y,z+zOff,2,chunk[chunkID].blockArray[blockIndex],chunk[chunkID].blockType[blockIndex]);
	}

	

	
	//Flag chunk to re-draw
	chunk[chunkID].flags.reDraw=1;

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

		

//Draws a chunk using LOD or no LOD and flags correct sector to reDraw
chunk_draw = function(chunkID){


	//Draw regular chunk if no LOD
	if(meshWorker.busy==0){
		chunk[chunkID].flags.reDraw=0;		
		mesh_naive(chunkID,chunk[chunkID].blockArray,chunk[chunkID].blockType,[blockSettings.chunk.XYZ,blockSettings.chunk.XYZ,blockSettings.chunk.XYZ],[chunk[chunkID].coords[0]*((blockSettings.chunk.XYZ-2)/chunk[chunkID].LOD),chunk[chunkID].coords[1]*( (blockSettings.chunk.XYZ-2)/chunk[chunkID].LOD),chunk[chunkID].coords[2]*((blockSettings.chunk.XYZ-2)/chunk[chunkID].LOD)],chunk[chunkID].LOD);
	}
		
		

}



//Create chunk
chunk_create = function(x,y,z){
	
	//Receive the ID for the chunk at this position 
	var chunkID = chunk_returnID(x,y,z);
	
	//If this chunk has not been defined 
	if(chunk[chunkID]==null){
		//Add it to our active chunk list
		activeChunks.push(chunkID);
			//Create new chunk
		chunk[chunkID]={
			//coordinates
			coords : [x,y,z],
			//List of block densities , filled for chunk dimensions cubed 
			blockArray : new Int8Array(Math.pow(blockSettings.chunk.XYZ,3)).fill(64),
			//List of block types , filled for chunk dimensions cubed 
			blockType : new Uint8Array(Math.pow(blockSettings.chunk.XYZ,3)).fill(0),
			//Draw 
			drawData : {
				//XYZ positions of verticies 
				position : [],
				//RGB colors of verticies 
				color : [],
				//Indice list of verticies 
				indice : [],
			},
			flags : {
				reDraw : 0,
				processing : 0,
			},
			//Scale of LOD 1,2,4
			LOD : 1,
		}
	
	}
}

//Function that runs through nearby chunks next to the camera, and processes their draw data if they are flagged to.

chunk_process = function() {
	
	

	//Agressive nearby processing 
	
	//Create empty list of chunk ID's we are going to process.
	var processList = [];
	//Amount of chunks we have processed
	var procAmount =0;
	//Loop through our process distance (Not the same as view distance, you might be able to see farther than you process (Just like IRL)).
	//These will determine the offsets we add to our camera chunk to select a chunk to process nearby.
	for(var xx=-blockSettings.processDistance.XY ;xx<=blockSettings.processDistance.XY;xx++){
	for(var yy=-blockSettings.processDistance.XY ;yy<=blockSettings.processDistance.XY;yy++){
	for(var zz=-blockSettings.processDistance.Z ;zz<=blockSettings.processDistance.Z;zz++){
		
		//Get chunkID using camX+xOffset for each offset
		var chunkID= chunk_returnID(player.chunk[0]+xx,player.chunk[1]+yy,player.chunk[2]+zz);
		//If the chunk exists add it to our lists and add the distance to camera.
		if(chunk[chunkID]!=null){
			processList.push([chunkID,distance_3d(chunk[chunkID].coords,player.chunk)]);	
		}
	}}}
	
	//Sort the list of chunks by distance
	processList.sort(function(a,b){
		return(a[1]-b[1]);
	});

	
	//Loop through the process list. 
	
	for(var k = 0 ; k<processList.length ; k++){
		var chunkID = processList[k][0];

		if(chunk[chunkID].LOD!=1){
			chunk[chunkID].LOD=1;
			chunk[chunkID].flags.reDraw=1;
		}

		//If chunk is flagged to be re-drawn
		if( chunk[chunkID].flags.reDraw>=1){
			if(chunk[chunkID].flags.reDraw>=20){
				procAmount+=1;
				chunk_draw(chunkID);
			}else{
				chunk[chunkID].flags.reDraw+=1;
			}
		}
		
		//End loop if we have hit our processLimit
		if(procAmount>=blockSettings.processLimit){
			break;
		}
	}

	

	//Less aggressive 
	
	//Flag to keep the less aggressive far loop going 
	var farLoop=1;
	
	//Skip loop if we have hit our limit
	if(procAmount>=blockSettings.processLimit){
		farLoop=0;
	}
	//Reset process amount to keep track of how many chunks far out we are processing 
	//Amount allowed to process in one frame
	var checkLimit = 2000;
	while(farLoop==1){
		checkLimit--;
		//Get chunkID using camX+xOffset for each offset
		var chunkID= chunk_returnID(player.chunk[0]+blockSettings.processCoords[0],player.chunk[1]+blockSettings.processCoords[1],player.chunk[2]+blockSettings.processCoords[2]);
		//If the chunk exists add it to our lists and add the distance to camera.
		if(chunk[chunkID]!=null){
			//If the chunk is outside of your normal processing range 
			if( Math.abs(chunk[chunkID].coords[0] - player.chunk[0]) > blockSettings.processDistance.XY || Math.abs(chunk[chunkID].coords[1] - player.chunk[1]) > blockSettings.processDistance.XY || Math.abs(chunk[chunkID].coords[2] - player.chunk[2]) > blockSettings.processDistance.Z){ 

				var dist = distance_3d(player.chunk,chunk[chunkID].coords);
				if(dist >= 10){
					if(dist>=15){
						if(chunk[chunkID].LOD!=4){
							chunk[chunkID].LOD=4;
							chunk[chunkID].flags.reDraw=1;
						}
					}else{
						if(chunk[chunkID].LOD!=2){
							chunk[chunkID].LOD=2;
							chunk[chunkID].flags.reDraw=1;
						}
					}
				}
				
				if(chunk[chunkID].flags.reDraw>0){
					//if(chunk[chunkID].flags.reDraw>=dist/2){
						chunk_draw(chunkID);
						procAmount+=1;
					//}else{
						//chunk[chunkID].flags.reDraw+=1;
					//}
				}
			
			}
		
		}
		
		blockSettings.processCoords[0]+=1;
		
		//Check X
		switch(blockSettings.processCoords[0]){
			//Go to next number if we hit the limit
			case blockSettings.processDistanceFar:
				blockSettings.processCoords[0] = -blockSettings.processDistanceFar;
				blockSettings.processCoords[1]+=1;
			break;
		}
		//Check Y
		switch(blockSettings.processCoords[1]){
			//Go to next number if we hit the limit
			case blockSettings.processDistanceFar:
				blockSettings.processCoords[1] = -blockSettings.processDistanceFar
				blockSettings.processCoords[2]+=1;
			break;
		}
		//Check Z
		switch(blockSettings.processCoords[2]){
			//End the loop and reset our number if we finish the loop
			case blockSettings.processDistanceFar:
				blockSettings.processCoords[2] = -blockSettings.processDistanceFar;
				farLoop=0;
			break;
		}
		
		//End loop if we hit process limit or check limit
		if(procAmount>=blockSettings.processLimit || checkLimit <=0){
			farLoop=0;
		}

	
	
	}
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
				//3 floats XYZ 
				position :gl.createBuffer(),
				//3 integers 0-255  RGB
				color : gl.createBuffer(),
				//Unsigned 32 bit integers representing the vertex for each indice 
				indice : gl.createBuffer(),
				//How many indices we are going to draw
				size : 0,
			},
			//Vertex Array Object, this contains draw information that can be used in one call.
			vao : gl.createVertexArray(),
			
		}
		
		//Set up vertex array object with our buffers
		gl.bindVertexArray(sector[sectorID].vao);
		
		//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,sector[sectorID].buffers.indice);
		//gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,99999,gl.DYNAMIC_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER,sector[sectorID].buffers.position);
		gl.vertexAttribPointer(programInfo.attribLocations.position,3,gl.FLOAT,false,0,0);
		//gl.bufferData(gl.ARRAY_BUFFER,99999,gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(programInfo.attribLocations.position);	
		
		gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.color);
		gl.vertexAttribPointer(programInfo.attribLocations.color,3,gl.UNSIGNED_BYTE,false,0,0);
		//gl.bufferData(gl.ARRAY_BUFFER,99999,gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(programInfo.attribLocations.color);
	}
}


/*
We can pre-allocate arrays for the sector drawing. The idea behind this is: instead of creting a big new Float32Array to upload
to the GPU every time we update a sector, we can simply just pre-allocate one big array in advance and re-use it every time
we need to draw a sector.
*/

var sectorBuffer = {
	position : new Float32Array(9999999),
	color : new Uint8Array(9999999),
	indice : new Uint32Array(9999999),
}

//Draws a sector, this is called everytime a chunk within the sector changes 
sector_draw = function(sectorPos,sectorID){
	
	
	
	
	if(meshWorker.busy==0){
		sector[sectorID].reDraw=0;
		meshWorker.busy=1;
		
		meshWorker.worker.postMessage({
			id : 'sector',
			sectorPos : sectorPos,
			XYZ : blockSettings.sector.XYZ,
			sectorID : sectorID,
		});
	}
	


}