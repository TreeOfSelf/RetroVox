/*
RetroVox Main Render 9/23/2019

This file will contain everything relating to sectors/chunks/blocks 
*/


//Chunk List and Sector List
var chunk=new Map();
var sector=new Map();

//list of active chunks.
var activeChunks=[];


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
		XY : 3,
		Z : 3,
	},
	
	//How far out multiplied by process Distance to less agressively process farther out chunks
	processMultiplier : 3,
	
	
	//Amount of chunks allowed to process in one frame
	processLimit : 2,
	
}


//Coordinates for where we are in our farther our processing 
blockSettings.processCoords = [
	-blockSettings.processDistance.XY * blockSettings.processMultiplier, //X
	-blockSettings.processDistance.XY * blockSettings.processMultiplier, //Y
	-blockSettings.processDistance.Z * blockSettings.processMultiplier,  //Z
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
	
	switch(blockLocation[0]){
		case 0:
			x-=2;
		break;
		case blockSettings.chunk.XYZ-1:
			x+=2;
		break;
	}
	
	switch(blockLocation[1]){
		case 0:
			y-=2;
		break;
		case blockSettings.chunk.XYZ-1:
			y+=2;
		break;
	}
	
	switch(blockLocation[2]){
		case 0:
			z-=2;
		break;
		case blockSettings.chunk.XYZ-1:
			z+=2;
		break;
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
	//var dist = Math.max(distance_3d([x,y,z],controls.cursorFixedPosition),1);
	var dist = Math.max(distance_3d([x-chunkPosition[0]*2,y-chunkPosition[1]*2,z-chunkPosition[2]*2],[controls.cursorFixedPosition[0]-controls.cursorChunk[0]*2,controls.cursorFixedPosition[1]-controls.cursorChunk[1]*2,controls.cursorFixedPosition[2]-controls.cursorChunk[2]*2]),1);

	switch(del){
	//Build
	case 0:
		//Set density of block
		chunk[chunkID].blockArray[blockIndex]-=controls.buildStrength/dist
		//Set type of block
		if(chunk[chunkID].blockType[blockIndex]==0 && chunk[chunkID].blockArray[blockIndex]<0){
			chunk[chunkID].blockType[blockIndex]=buildType;
		}
	break;
	//Delete
	case 1:
		if(chunk[chunkID].blockArray[blockIndex]<0){
			chunk[chunkID].blockArray[blockIndex]+=controls.buildStrength/dist;
		}else{
			chunk[chunkID].blockArray[blockIndex]+=controls.buildStrength/dist;
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
	chunk[chunkID].flags.reDraw+=1;

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
	chunk[chunkID].flags.reDraw=0;		
	//Mesh the chunk 
	//2.3 6.1
	
	//If the LOD is not set to 1x Detail
	if(chunk[chunkID].LOD!=1){
		//Get BlockData at LOD size
		var blockData = [chunk[chunkID].blockArray,chunk[chunkID].blockType];
		blockData = NearestFilter(blockData[0],blockData[1],[blockSettings.chunk.XYZ,blockSettings.chunk.XYZ,blockSettings.chunk.XYZ],chunk[chunkID].LOD);
		//Set magic LOD numbers
		switch(chunk[chunkID].LOD){
			case 2:
				var lodScale = 2.2;
			break;
			case 4:
				var lodScale = 4.4
			break;
		}

		//Draw LOD chunk
		var drawData = mesh_naive(blockData[0],blockData[1],blockData[2],[chunk[chunkID].coords[0]*(blockSettings.chunk.XYZ/chunk[chunkID].LOD-2),chunk[chunkID].coords[1]*(blockSettings.chunk.XYZ/chunk[chunkID].LOD-2),chunk[chunkID].coords[2]*(blockSettings.chunk.XYZ/chunk[chunkID].LOD-2)],lodScale);
		}else{
		//Draw regular chunk if no LOD
		var drawData = mesh_naive(chunk[chunkID].blockArray,chunk[chunkID].blockType,[blockSettings.chunk.XYZ,blockSettings.chunk.XYZ,blockSettings.chunk.XYZ],[chunk[chunkID].coords[0]*(blockSettings.chunk.XYZ-2),chunk[chunkID].coords[1]*(blockSettings.chunk.XYZ-2),chunk[chunkID].coords[2]*(blockSettings.chunk.XYZ-2)]);
		}
		
		//Set values for chunk
		chunk[chunkID].drawData.position = drawData[0];
		chunk[chunkID].drawData.color = drawData[1];
		chunk[chunkID].drawData.indice = drawData[2];
		//Get sector chunk is in
		var sectorPosition = sector_get(chunk[chunkID].coords[0],chunk[chunkID].coords[1],chunk[chunkID].coords[2]);
		//Draw the sector now that it has new information
		var sectorID=sector_returnID(sectorPosition[0],sectorPosition[1],sectorPosition[2]);
		if(sector[sectorID]==null){
			sector_create(sectorPosition[0],sectorPosition[1],sectorPosition[2]);
		}
		sector[sectorID].reDraw+=1;

}

chunk_set_LOD = function(chunkID){
	
	var dist = distance_3d(chunk[chunkID].coords,player.chunk);
	//Detect LOD changes
	if( dist > (blockSettings.processDistance.XY)){
		//FAR LOD
		if( dist >= (blockSettings.processDistance.XY*2-3)){
			if(chunk[chunkID].LOD!=4){
				chunk[chunkID].LOD=4;
				chunk[chunkID].flags.reDraw+=1;
			}	
		//CLOSE LOD
		}else{
			if(chunk[chunkID].LOD!=2){
				chunk[chunkID].LOD=2;
				chunk[chunkID].flags.reDraw+=1;
			}
		}
	}else{
		//NO LOD
		if(chunk[chunkID].LOD!=1){
			chunk[chunkID].LOD=1;
			chunk[chunkID].flags.reDraw+=1;
		}
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
			blockArray : new Float32Array(Math.pow(blockSettings.chunk.XYZ,3)).fill(0.1),
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
			//Time of last LOD update
			LODupdate : Date.now(),
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
			procAmount+=1;
		}
		
		//If chunk is flagged to be re-drawn
		if( chunk[chunkID].flags.reDraw>=1){
				procAmount+=1;
				chunk_draw(chunkID);
		}
		
		//End loop if we have hit our processLimit
		if(procAmount>=blockSettings.processLimit){
			k = processList.length;
		}
	}
	
	
	//Less aggressive 
	
	//Flag to keep the less aggressive far loop going 
	var farLoop=1;
	//Reset process amount to keep track of how many chunks far out we are processing 
	procAmount = 0;
	var checkLimit = 10;
	while(farLoop==1){
		checkLimit--;
		//Get chunkID using camX+xOffset for each offset
		var chunkID= chunk_returnID(player.chunk[0]+blockSettings.processCoords[0],player.chunk[1]+blockSettings.processCoords[1],player.chunk[2]+blockSettings.processCoords[2]);
		//If the chunk exists add it to our lists and add the distance to camera.
		if(chunk[chunkID]!=null){
			chunk_set_LOD(chunkID);
			if(chunk[chunkID].flags.reDraw>0){
				chunk_draw(chunkID);
				procAmount+=1;
			}
		}
		
		blockSettings.processCoords[0]+=1;
		
		//Check X
		switch(blockSettings.processCoords[0]){
			//Go to next number if we hit the limit
			case blockSettings.processDistance.XY * blockSettings.processMultiplier:
				blockSettings.processCoords[0] = -blockSettings.processDistance.XY * blockSettings.processMultiplier;
				blockSettings.processCoords[1]+=1;
			break;
		}
		//Check Y
		switch(blockSettings.processCoords[1]){
			//Go to next number if we hit the limit
			case blockSettings.processDistance.XY * blockSettings.processMultiplier:
				blockSettings.processCoords[1] = -blockSettings.processDistance.XY * blockSettings.processMultiplier;
				blockSettings.processCoords[2]+=1;
			break;
		}
		//Check Z
		switch(blockSettings.processCoords[2]){
			//End the loop and reset our number if we finish the loop
			case blockSettings.processDistance.Z * blockSettings.processMultiplier:
				blockSettings.processCoords[2] = -blockSettings.processDistance.Z * blockSettings.processMultiplier;
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
		gl.bindBuffer(gl.ARRAY_BUFFER,sector[sectorID].buffers.position);
		gl.vertexAttribPointer(programInfo.attribLocations.position,3,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(programInfo.attribLocations.position);	
		
		gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.color);
		gl.vertexAttribPointer(programInfo.attribLocations.color,3,gl.UNSIGNED_BYTE,false,0,0);
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
sector_draw = function(sectorID){
	

	//Keep strack of where we are inside of the pre-allocated buffers
	var positionOffset=0;var colorOffset=0;var indiceOffset=0;
	
	//Loop through chunks in our sector space
	for(xx=0;xx<blockSettings.sector.XYZ;xx++){
	for(yy=0;yy<blockSettings.sector.XYZ;yy++){
	for(zz=0;zz<blockSettings.sector.XYZ;zz++){
		
		//Get position of chunk we have located using this formula
		// [X offset + (sectorX*sectorXYZ)]
		//For each axis 
		var pos = [xx+sector[sectorID].coords[0]*blockSettings.sector.XYZ,
		yy+sector[sectorID].coords[1]*blockSettings.sector.XYZ,
		zz+sector[sectorID].coords[2]*blockSettings.sector.XYZ];
		
		//Get ID from chunk XYZ position
		var chunkID = chunk_returnID(pos[0],pos[1],pos[2]);
		
		//Make sure the chunk exists and has draw data
		if(chunk[chunkID]!=null && chunk[chunkID].drawData.indice.length>12){
				//Get index we are at in the position buffer.
				//The reason we need this, is because everytime we add a new chunk we have to offset all of it's indices to 
				//Make up for the chunks already added in. 
				var positionBefore = positionOffset;
			
				//Add chunk draw information, and then add to the offset .
				sectorBuffer.position.set(chunk[chunkID].drawData.position,positionOffset);
				positionOffset+=chunk[chunkID].drawData.position.length;
				//colors
				sectorBuffer.color.set(chunk[chunkID].drawData.color,colorOffset);
				colorOffset+=chunk[chunkID].drawData.color.length;	
				
				//Find out where we are starting inside of the indice, so that we know which indice's need to be offset.
				var indiceBefore = indiceOffset;
				//indice
				sectorBuffer.indice.set(chunk[chunkID].drawData.indice,indiceOffset);
				indiceOffset+=chunk[chunkID].drawData.indice.length;	
				//If this is not the first chunk being added to the sector
				if(indiceBefore!=0){
					//Get amount we need to add indices
					var addAmount = Math.round(positionBefore/3);
					//Go through each indice we just added
					for(i=indiceBefore;i<=indiceOffset;i++){
						//Add in an offset to each offset to make up for the chunks already added.
						sectorBuffer.indice[i]+=addAmount;
					}
				}
				
		}
	}}}
	
	if(indiceOffset!=0){
		
		//Set size of the sector to how many verticies 
		sector[sectorID].buffers.size=indiceOffset;
		//Bind this sector VAO
		gl.bindVertexArray(sector[sectorID].vao);
		//Set data for indice
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sector[sectorID].buffers.indice);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,sectorBuffer.indice,gl.STATIC_DRAW,0,indiceOffset);
		//position
		gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.position);
		gl.bufferData(gl.ARRAY_BUFFER,sectorBuffer.position,gl.STATIC_DRAW,0,positionOffset);
		//color
		gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.color);
		gl.bufferData(gl.ARRAY_BUFFER,sectorBuffer.color,gl.STATIC_DRAW,0,colorOffset);
		
	}else{
		//Set size of the sector to 0 
		sector[sectorID].buffers.size=0;
	}
	//Remove flag for sector to be redrawn.
	sector[sectorID].reDraw=0;
}