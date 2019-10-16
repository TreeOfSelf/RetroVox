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
		XYZ : 3,
	},
	
	//Determines how far out to process chunks
	processDistance : {
		XY : 3,
		Z : 1,
	},
	
	
}

// BLOCK FUNCTIONS

//Finds chunk of block, and then adds to the desnity of the block within the chunk.
block_change = function(x,y,z,del){

	//get location of chunk from block XYZ
	var chunkPosition = chunk_get(x,y,z);
	
	
	var chunkPosition = chunk_get(x,y,z);
		
	//get id from location of chunks
	var chunkID = chunk_returnID(chunkPosition[0],chunkPosition[1],chunkPosition[2]);
	//formula to get location of block relative inside of the chunks space.
	// x - (chunkX*chunkXYZ) for each axis
	var blockLocation = [(x) - (chunkPosition[0]*blockSettings.chunk.XYZ), (y) - (chunkPosition[1]*blockSettings.chunk.XYZ),(z) - (chunkPosition[2]*blockSettings.chunk.XYZ)]

	//Fill edges of bordering chunk(s)
	
	//Offset variables
	var xOff=0;
	var yOff=0;
	var zOff=0;

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
	
	//Unoptimized checks 
	
	if(xOff != 0 && yOff != 0 && zOff != 0){
		block_change(x+xOff,y+yOff,z+zOff,0);
	}
	if(xOff !=0 && yOff !=0){
		block_change(x+xOff,y+yOff,z,0);	
	}
	if(xOff !=0 && zOff !=0){
		block_change(x+xOff,y,z+zOff,0);	
	}
	if(yOff !=0 && zOff !=0){
		block_change(x,y+yOff,z+zOff,0);	
	}
	if(xOff !=0){
		block_change(x+xOff,y,z,0);
	}
	if(yOff !=0){
		block_change(x,y+yOff,z,0);
	}
	if(zOff !=0){
		block_change(x,y,z+zOff,0);
	}

	

	
	
	//get 1d index from relative location
	var blockIndex = blockLocation[0]+blockLocation[1]*blockSettings.chunk.XYZ+blockLocation[2]*blockSettings.chunk.XYZ*blockSettings.chunk.XYZ;

	//console.log("BLOCK", x,y,z , blockLocation, chunkPosition);
	
	//Generate chunk if it doesn't exists
	if(chunk[chunkID]==null){
	chunk_create(chunkPosition[0],chunkPosition[1],chunkPosition[2]);
	}
	
	
	
	//Add/Delete density based on distance to build position (your cursor)
	
	//Calculate distance from cursor, minimum of 1 so we don't get divides by 0.
	var dist = Math.max(distance_3d([x,y,z],[0,0,0]),1);
	
	if(del==1){
		chunk[chunkID].blockArray[blockIndex]+=0.1/dist;
	}else{
		chunk[chunkID].blockArray[blockIndex]-=0.1/dist;	
		chunk[chunkID].blockArray[blockIndex]=-1;		
	}
	//Flag chunk to re-draw
	chunk[chunkID].reDraw=1;

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
			}
		}
	
	}
}

//Function that runs through nearby chunks next to the camera, and processes their draw data if they are flagged to.

chunk_process = function() {
	
	//Create empty list of chunk ID's we are going to process.
	var processList = [];
	
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
	
	//Sort the list of chunks by distanc
	processList.sort(function(a,b){
		return(a[1]-b[1]);
	});
	
	//Loop through the process list. 
	for(var i=0;i<processList.length;i++){
		
		//If chunk is flagged to be re-drawn
		if(chunk[processList[i][0]].reDraw>0){

			chunk[processList[i][0]].reDraw=0;		
			//Mesh the chunk 
			var drawData = mesh_naive(chunk[processList[i][0]].blockArray,[chunk[processList[i][0]].coords[0]*(blockSettings.chunk.XYZ-2),chunk[processList[i][0]].coords[1]*(blockSettings.chunk.XYZ-2),chunk[processList[i][0]].coords[2]*(blockSettings.chunk.XYZ-2)]);
			//Set values for chunk
			chunk[processList[i][0]].drawData.position = drawData[0];
			chunk[processList[i][0]].drawData.color = drawData[1];
			chunk[processList[i][0]].drawData.indice = drawData[2];
			//Get sector chunk is in
			var sectorPosition = sector_get(chunk[processList[i][0]].coords[0],chunk[processList[i][0]].coords[1],chunk[processList[i][0]].coords[2]);
			//Draw the sector now that it has new information
			sector_draw(sectorPosition[0],sectorPosition[1],sectorPosition[2]);
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
	position : new Float32Array(999999),
	color : new Uint8Array(999999),
	indice : new Uint32Array(999999),
}

//Draws a sector, this is called everytime a chunk within the sector changes 
sector_draw = function(x,y,z){
	
	//Get sectorID
	sectorID = sector_returnID(x,y,z);
	
	//Create sector if it does not exist
	if(sector[sectorID]==null){
		sector_create(x,y,z);
	}

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
		
		//Make sure the chunk exists
		if(chunk[chunkID]!=null){
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
					//Go through each indice we just added
					for(i=indiceBefore;i<indiceOffset;i++){
						//Add in an offset to each offset to make up for the chunks already added.
						sectorBuffer.indice[i]+=positionBefore/3;
					}
				}
				
		}
	}}}
	
	//Set size of the sector to how many verticies 
	sector[sectorID].buffers.size=indiceOffset;
	//Bind this sector VAO
	gl.bindVertexArray(sector[sectorID].vao);
	//Set data for indice
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sector[sectorID].buffers.indice);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,sectorBuffer.indice,gl.DYNAMIC_DRAW,0,indiceOffset);
	//position
	gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.position);
	gl.bufferData(gl.ARRAY_BUFFER,sectorBuffer.position,gl.DYNAMIC_DRAW,0,positionOffset);
	//color
	gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.color);
	gl.bufferData(gl.ARRAY_BUFFER,sectorBuffer.color,gl.DYNAMIC_DRAW,0,colorOffset);
	
	//Remove flag for sector to be redrawn.
	sector[sectorID].reDraw=0;
}