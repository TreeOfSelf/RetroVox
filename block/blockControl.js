var ch = new BroadcastChannel('test');

		
//Chunk List and Sector List
var chunk=[];
var sector=[];

//list of active chunks
var activeChunks=[];

//Reference a sector with sector[ID] and chunks with chunk[ID]
//You can get a sector/chunks ID with return_sectorID and return_chunkID and inputting the XYZ

                           //X    Y       Z
//Chunk contains blocks chunkXYZ*chunkXYZ*chunkXYZ

//Chunk Dimensions
var chunkSpace=64;
var chunkXYZ=32;
						    //X    Y         Z
//Sector contains chunks sectorXY*sectorXY*sectorZ

//Sector Dimensions 
var sectorSpace=64;
var sectorXY=10;
var sectorZ=10;


//How far out to proccess chunks
var procDist =5
var procZDist=5;

/*
The purpose of having sectors and chunks is simply to reduce the amount of individual draw calls 
Sectors contain sectorXY*sectorXY*sectorZ chunks within them. The larger the sectors are the more
expensive they are to update, but the fewer draw calls will be needed to draw the scene.
*/



//Create chunk
chunk_create = function(x,y,z){
	
	//Receive the ID for the chunk at this position 
	var chunkID = return_chunkID(x,y,z);
	//console.log(x,y,z,chunkID);
	//Add it to our active chunk list
	activeChunks.push(chunkID);
	
	if(chunk[chunkID]==null){
		//Create new chunk
		chunk[chunkID]={
			//coordinates
			coords : [x,y,z],
			//List of block densities , filled for chunk dimensions cubed 
			blockList : new Float32Array(chunkXYZ*chunkXYZ*chunkXYZ).fill(0.1),
			//Final draw of the chunk
			blockDraws : {
				position : [],
				color : [],
				indice : [],
			},
			//Flag for whether or not the chunk is proccessing
			proccessing : 0,
			//Flag for whether on not to redraw the chunk
			reDraw : 0,
		}
	
	}
}



//Create sector
sector_create = function(x,y,z){
	
	//Receive sector ID from XYZ
	var sectorID = return_sectorID(x,y,z);
	
	if(sector[sectorID]==null){
		//Create new chunk
		sector[sectorID]={

			//coordinates
			coords : [x,y,z],	
			//Empty buffers
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
			
			//Vertex Array Object, this is how you contain draw data in webGL 
			vao : gl.createVertexArray(),
			
		}
		
	//Set up vertex array object with our buffers
	gl.bindVertexArray(sector[sectorID].vao);
	gl.bindBuffer(gl.ARRAY_BUFFER,sector[sectorID].buffers.position);
	gl.vertexAttribPointer(programInfoCube.attribLocations.voxelPosition,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(programInfoCube.attribLocations.voxelPosition);	
	
	gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.color);
	gl.vertexAttribPointer(programInfoCube.attribLocations.voxelColor,3,gl.UNSIGNED_BYTE,false,0,0);
	gl.enableVertexAttribArray(programInfoCube.attribLocations.voxelColor);
	

	}
}


/* 
These are the functions we use to return an ID for a chunk/sectors XYZ position.
This reduces the array from a 3D array to a 1D array which provides a noticable preformance
increase
*/

//Returns chunk of x,y,z position in block space
chunk_get =function(x,y,z){
	return([Math.floor(x/chunkXYZ),Math.floor(y/chunkXYZ),Math.floor(z/chunkXYZ)]);
}

//Returns sector x,y,z position in chunk space
sector_get =function(x,y,z){
	return([Math.floor(x/sectorXY),Math.floor(y/sectorXY),Math.floor(z/sectorZ)]);
}


//Returns chunkID from x,y,z in block space
return_chunkID = function(x,y,z){
	return(x+y*chunkSpace+z*chunkSpace*chunkSpace);
}
//Returns sectorID from x,y,z in chunk space
return_sectorID = function(x,y,z){
	return(x+y*sectorSpace+z*sectorSpace*sectorSpace);
}





/*
We can pre-allocate arrays for the sector drawing. The idea behind this is: instead of creting a big new Float32Array to upload
to the GPU every time we update a sector, we can simply just pre-allocate one big array in advance and re-use it every time
we need to draw a sector.
*/

sectorPositionBuffer = new Float32Array(9999999);
sectorColorBuffer = new Uint8Array(9999999);
sectorIndiceBuffer = new Uint32Array(9999999);

draw_sector = function(x,y,z){
	
	//Get sectorID
	sectorID = return_sectorID(x,y,z);
	
	if(sector[sectorID]==null){
		sector_create(x,y,z);
	}

	//Keep strack of where we are inside of the pre-allocated buffers
	var posOffset=0;
	var colOffset=0;
	var indOffset=0;

	for(xx=0;xx<sectorXY;xx++){
	for(yy=0;yy<sectorXY;yy++){
	for(zz=0;zz<sectorZ;zz++){
		var pos = [xx+sector[sectorID].coords[0]*sectorXY,yy+sector[sectorID].coords[1]*sectorXY,zz+sector[sectorID].coords[2]*sectorZ];
		var chunkID = return_chunkID(pos[0],pos[1],pos[2]);
		
		//Make sure the chunk exists, and also make sure that it is not being proccessed currently.
		if(chunk[chunkID]!=null && chunk[chunkID].proccessing==0){
			var posBefore = posOffset-1;	
			//Set positions 
			sectorPositionBuffer.set(chunk[chunkID].blockDraws.position,posOffset);
			posOffset+=chunk[chunkID].blockDraws.position.length;
			//Set colors
			sectorColorBuffer.set(chunk[chunkID].blockDraws.color,colOffset);
			colOffset+=chunk[chunkID].blockDraws.color.length;	
			//Set indice
			
			//Add offset to all indices
			
			var indBefore = indOffset;
			sectorIndiceBuffer.set(chunk[chunkID].blockDraws.indice,indOffset);
			indOffset+=chunk[chunkID].blockDraws.indice.length;	
			
			if(indBefore!=0){
				for(i=indBefore;i<indOffset;i++){
					sectorIndiceBuffer[i]+=posBefore/3;
				}
			}
		}

		
	}}}

	//Set size of the sector to how many verticies 
	sector[sectorID].buffers.size=indOffset;
	//Bind this sector VAO
	gl.bindVertexArray(sector[sectorID].vao);
	//Set data
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sector[sectorID].buffers.indice);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,sectorIndiceBuffer,gl.DYNAMIC_DRAW,0,indOffset);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.position);
	gl.bufferData(gl.ARRAY_BUFFER,sectorPositionBuffer,gl.DYNAMIC_DRAW,0,posOffset);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.color);
	gl.bufferData(gl.ARRAY_BUFFER,sectorColorBuffer,gl.DYNAMIC_DRAW,0,colOffset);

}



//This is some padding around our view frustrum so sectors are not cut out of it 

var frustrumAmountXY = -sectorXY*chunkXYZ*1.5;
var frustrumAmountZ = -sectorZ*chunkXYZ*1.5;

//Checks if a point [X,Y,Z] is within our viewing frustrum 
check_frustrum= function(point){
		
		//Position we are checking
		posVec = glMatrix.vec3.fromValues(point[0],point[1],point[2]);
	
		//If anything falls out of our view frustrum outside of padding
		if((-glMatrix.vec3.dot(leftN,posVec) - leftD)<frustrumAmountXY ||  
		glMatrix.vec3.dot(rightN,posVec) + rightD<frustrumAmountXY  || 
		(-glMatrix.vec3.dot(topN,posVec)+topD)<frustrumAmountZ  ||  
		(glMatrix.vec3.dot(bottomN,posVec) + bottomD)<frustrumAmountZ ||  
		(-glMatrix.vec3.dot(nearN,posVec) + nearD)<frustrumAmountXY){
			return(0);
		}else{
			return(1);
		}
}

//Adds a border corner block 
block_border = function(x,y,z,amount){
	var chunkRef = chunk_get(x,y,z);
	var chunkID = return_chunkID(chunkRef[0],chunkRef[1],chunkRef[2]);

	//get relative location in chunk clipped to the interior 
	var blockLoc = [(x) - (chunkRef[0]*chunkXYZ), (y) - (chunkRef[1]*chunkXYZ),(z) - (chunkRef[2]*chunkXYZ)]
	//get index from relative location

	
	
	var blockIndex = blockLoc[0]+blockLoc[1]*chunkXYZ+blockLoc[2]*chunkXYZ*chunkXYZ;
	
	//console.log("new :"+blockIndex);

	//Generate chunk if it doesn't exists

	if(chunk[chunkID]==null){
	chunk_create(chunkRef[0],chunkRef[1],chunkRef[2]);
	}
	
	//chunk[chunkID].blockList[blockIndex]-=0.05;
	chunk[chunkID].blockList[blockIndex]=amount;
	chunk[chunkID].reDraw=1;
}


//Adds block data to buildBuffer
block_create = function(x,y,z){
	
	

	//get Chunk locationd
	var chunkRef = chunk_get(x,y,z);
	var chunkID = return_chunkID(chunkRef[0],chunkRef[1],chunkRef[2]);
	


	//get relative location in chunk clipped to the interior 
	var blockLoc = [Math.min(Math.max((x) - (chunkRef[0]*chunkXYZ),1),chunkXYZ-2), Math.min(Math.max((y) - (chunkRef[1]*chunkXYZ),1),chunkXYZ-2),Math.min(Math.max((z) - (chunkRef[2]*chunkXYZ),1),chunkXYZ-2)]
	//var blockLoc = [(x) - (chunkRef[0]*chunkXYZ), (y) - (chunkRef[1]*chunkXYZ),(z) - (chunkRef[2]*chunkXYZ)]


	//get index from relative location
	var blockIndex = blockLoc[0]+blockLoc[1]*chunkXYZ+blockLoc[2]*chunkXYZ*chunkXYZ;

	//console.log("old :"+blockIndex);


	
	
	//Generate chunk if it doesn't exists
	
	if(chunk[chunkID]==null){
	chunk_create(chunkRef[0],chunkRef[1],chunkRef[2]);
	}
	
	chunk[chunkID].blockList[blockIndex]-=0.1/distance([x,y,z],cam);
	//chunk[chunkID].blockList[blockIndex]=-0.05;
	
	
	switch(blockLoc[0]){
		//Real voxels
		case 1:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)-2,blockLoc[1]+(chunkRef[1]*chunkXYZ),blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);		
			if(blockLoc[1]==1){
				block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)-2,blockLoc[1]+(chunkRef[1]*chunkXYZ)-2,blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);		
			}
			if(blockLoc[1]==chunkXYZ-2){
				block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)-2,blockLoc[1]+(chunkRef[1]*chunkXYZ)+2,blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);			
			}
		break;
		case chunkXYZ-2:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)+2,blockLoc[1]+(chunkRef[1]*chunkXYZ),blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);		
			if(blockLoc[1]==chunkXYZ-2){
				block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)+2,blockLoc[1]+(chunkRef[1]*chunkXYZ)+2,blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);		
			}
			if(blockLoc[1]==1){
				block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)+2,blockLoc[1]+(chunkRef[1]*chunkXYZ)-2,blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);		
			}
		
	}
	

	switch(blockLoc[1]){
		case 1:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ)-2,blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);
		
		
			if(blockLoc[0]==1){
				
				if(blockLoc[2]==1){
					block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)-2,blockLoc[1]+(chunkRef[1]*chunkXYZ)-2,blockLoc[2]+(chunkRef[2]*chunkXYZ)-2,chunk[chunkID].blockList[blockIndex]);	
				}
				if(blockLoc[2]==chunkXYZ-2){
					block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)-2,blockLoc[1]+(chunkRef[1]*chunkXYZ)-2,blockLoc[2]+(chunkRef[2]*chunkXYZ)+2,chunk[chunkID].blockList[blockIndex]);	
				}
				
				
			}else{
			
			if(blockLoc[0]==chunkXYZ-2){
				
				if(blockLoc[2]==1){
					block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)+2,blockLoc[1]+(chunkRef[1]*chunkXYZ)-2,blockLoc[2]+(chunkRef[2]*chunkXYZ)-2,chunk[chunkID].blockList[blockIndex]);	
				}
				if(blockLoc[2]==chunkXYZ-2){
					block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)+2,blockLoc[1]+(chunkRef[1]*chunkXYZ)-2,blockLoc[2]+(chunkRef[2]*chunkXYZ)+2,chunk[chunkID].blockList[blockIndex]);	
				}
				
				
			}else{
			
				if(blockLoc[2]==1){
					block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ)-2,blockLoc[2]+(chunkRef[2]*chunkXYZ)-2,chunk[chunkID].blockList[blockIndex]);	
				}
				if(blockLoc[2]==chunkXYZ-2){
					block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ)-2,blockLoc[2]+(chunkRef[2]*chunkXYZ)+2,chunk[chunkID].blockList[blockIndex]);	
				}

			
			}
			}
			
		
		break;
		case chunkXYZ-2:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ)+2,blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);		
		
			if(blockLoc[0]==1){
				
				if(blockLoc[2]==1){
					block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)-2,blockLoc[1]+(chunkRef[1]*chunkXYZ)+2,blockLoc[2]+(chunkRef[2]*chunkXYZ)-2,chunk[chunkID].blockList[blockIndex]);	
				}
				if(blockLoc[2]==chunkXYZ-2){
					block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)-2,blockLoc[1]+(chunkRef[1]*chunkXYZ)+2,blockLoc[2]+(chunkRef[2]*chunkXYZ)+2,chunk[chunkID].blockList[blockIndex]);	
				}
				
				
			}else{
			
			if(blockLoc[0]==chunkXYZ-2){
				
				if(blockLoc[2]==1){
					block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)+2,blockLoc[1]+(chunkRef[1]*chunkXYZ)+2,blockLoc[2]+(chunkRef[2]*chunkXYZ)-2,chunk[chunkID].blockList[blockIndex]);	
				}
				if(blockLoc[2]==chunkXYZ-2){
					block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)+2,blockLoc[1]+(chunkRef[1]*chunkXYZ)+2,blockLoc[2]+(chunkRef[2]*chunkXYZ)+2,chunk[chunkID].blockList[blockIndex]);	
				}
				
				
			}else{
			
				if(blockLoc[2]==1){
					block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ)+2,blockLoc[2]+(chunkRef[2]*chunkXYZ)-2,chunk[chunkID].blockList[blockIndex]);	
				}
				if(blockLoc[2]==chunkXYZ-2){
					block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ)+2,blockLoc[2]+(chunkRef[2]*chunkXYZ)+2,chunk[chunkID].blockList[blockIndex]);	
				}

			
			}
			}
			
		
		
		
		
		break;
	}
	

	switch(blockLoc[2]){
		case 1:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ),blockLoc[2]+(chunkRef[2]*chunkXYZ)-2,chunk[chunkID].blockList[blockIndex]);
		
			
		break;
		case chunkXYZ-2:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ),blockLoc[2]+(chunkRef[2]*chunkXYZ)+2,chunk[chunkID].blockList[blockIndex]);		
		break;
	}
	



	
	chunk[chunkID].reDraw=1;

}

//Adds block data to deleteBuffer
block_delete = function(x,y,z){
	

	//get Chunk locationd
	var chunkRef = chunk_get(x,y,z);
	var chunkID = return_chunkID(chunkRef[0],chunkRef[1],chunkRef[2]);

		
	if(chunk[chunkID]==null){
	//	console.log(x,y,z,chunkID);
		chunk_create(chunkRef[0],chunkRef[1],chunkRef[2]);
	}
	//get relative location in chunk
	//var blockLoc = [Math.min(Math.max((x) - (chunkRef[0]*chunkXYZ),1),chunkXYZ-2), Math.min(Math.max((y) - (chunkRef[1]*chunkXYZ),1),chunkXYZ-2),Math.min(Math.max((z) - (chunkRef[2]*chunkXYZ),1),chunkXYZ-2)]
	var blockLoc = [(x) - (chunkRef[0]*chunkXYZ), (y) - (chunkRef[1]*chunkXYZ),(z) - (chunkRef[2]*chunkXYZ)]
	//get index from relative location
	
	
	
	var blockIndex = blockLoc[0]+blockLoc[1]*chunkXYZ+blockLoc[2]*chunkXYZ*chunkXYZ;
	
	
	//chunk[chunkID].blockList[blockIndex]=0;
	chunk[chunkID].blockList[blockIndex]+=0.01;
	


	switch(blockLoc[0]){
		//Real voxels
		case 1:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)-2,blockLoc[1]+(chunkRef[1]*chunkXYZ),blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);
		break;
		case chunkXYZ-2:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)+2,blockLoc[1]+(chunkRef[1]*chunkXYZ),blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);		
		break;
		//Corners
		case 0:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)-2,blockLoc[1]+(chunkRef[1]*chunkXYZ),blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);
		break;
		case chunkXYZ-1:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ)+2,blockLoc[1]+(chunkRef[1]*chunkXYZ),blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);		
		break;;
	}
	

	switch(blockLoc[1]){
		case 1:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ)-2,blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);
		break;
		case chunkXYZ-2:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ)+2,blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);		
		break;
		case 0:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ)-2,blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);
		break;
		case chunkXYZ-1:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ)+2,blockLoc[2]+(chunkRef[2]*chunkXYZ),chunk[chunkID].blockList[blockIndex]);		
		break;
	}
	

	switch(blockLoc[2]){
		case 1:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ),blockLoc[2]+(chunkRef[2]*chunkXYZ)-2,chunk[chunkID].blockList[blockIndex]);
		break;
		case chunkXYZ-2:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ),blockLoc[2]+(chunkRef[2]*chunkXYZ)+2,chunk[chunkID].blockList[blockIndex]);		
		break;
		case 0:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ),blockLoc[2]+(chunkRef[2]*chunkXYZ)-2,chunk[chunkID].blockList[blockIndex]);
		break;
		case chunkXYZ-1:
			block_border(blockLoc[0]+(chunkRef[0]*chunkXYZ),blockLoc[1]+(chunkRef[1]*chunkXYZ),blockLoc[2]+(chunkRef[2]*chunkXYZ)+2,chunk[chunkID].blockList[blockIndex]);		
		break;
	}
	
	

	
	chunk[chunkID].reDraw=1;
}

chunk_process = function() {
	
	 processList = [];
	
	for(var xx=-procDist ;xx<=procDist;xx++){
	for(var yy=-procDist ;yy<=procDist;yy++){
	for(var zz=-procDist ;zz<=procDist;zz++){
		var chunkID= return_chunkID(camChunk[0]+xx,camChunk[1]+yy,camChunk[2]+zz);
		if(chunk[chunkID]!=null){
			processList.push([chunkID,distance(chunk[chunkID].coords,camChunk)]);
		}			
	}}}
	
	processList.sort(function(a,b){
		return(a[1]-b[1]);
	});
	
	for(var i=0;i<processList.length;i++){
		if(chunk[processList[i][0]].reDraw==1){
			if(meshWorker[0][1]==0){
				meshWorker[0][1]=1;
				chunk[processList[i][0]].proccessing=1;
				chunk[processList[i][0]].reDraw=0;		
				meshWorker[0][0].postMessage({
					id : "chunkMesh",
					chunkPos : [chunk[processList[i][0]].coords[0]*(chunkXYZ-2),chunk[processList[i][0]].coords[1]*(chunkXYZ-2),chunk[processList[i][0]].coords[2]*(chunkXYZ-2)],
					//chunkPos : [chunk[processList[i][0]].coords[0]*(chunkXYZ-1),chunk[processList[i][0]].coords[1]*(chunkXYZ-1),chunk[processList[i][0]].coords[2]*(chunkXYZ-1)],
					blockList : chunk[processList[i][0]].blockList.buffer,
					chunkID : processList[i][0],
				});
				
			}			
		}
	}

}



requestAnimationFrame(drawScene);