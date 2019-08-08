/*
 ____  __     __    ___  __ _     ___  __   __ _  ____  ____   __   __   
(  _ \(  )   /  \  / __)(  / )   / __)/  \ (  ( \(_  _)(  _ \ /  \ (  )  
 ) _ (/ (_/\(  O )( (__  )  (   ( (__(  O )/    /  )(   )   /(  O )/ (_/\
(____/\____/ \__/  \___)(__\_)   \___)\__/ \_)__) (__) (__\_) \__/ \____/
Chunk & block control. As well as communicating with & starting the culling process. 
Also takes care of the build & delete buffers.

*/


//Block counter
var blockCount=0;

//list of active chunks
var activeChunks=[];

//Chunk Dimensions
var chunkXY=16;
var chunkZ=16;
var chunkSpace=64;

var sectorSpace=64;
var sectorXY=10;
var sectorZ=10;

//Amount of chunks to go down
var zLimit = 4;

//Chunk List
var chunk=[];
var sector=[];

//Empty chunk 
var chunkList=[];


//Generate lists
for(var zz=0;zz<chunkZ;zz++){
	for(var yy=0;yy<chunkXY;yy++){
		for(var xx=0;xx<chunkXY;xx++){

			//Add empty block to chunkList
			chunkList.push(-1);
		}
	}
}

chunkList = new Uint8Array(chunkList.length);
chunkList.fill(0);


//Buffers to send to workers 
var buildBuffer = [];
var deleteBuffer = [];



//Function to send our data over to the workers
buffers_send = function(){
	
	//If buildBuffer has data send it
	if(buildBuffer.length>0){	
		cullWorker.postMessage({
				id : "block_create",
				buffer : buildBuffer,
			});
		buildBuffer=[];
	}
	//If deleteBuffer has data send it
	if(deleteBuffer.length>0){
		
		cullWorker.postMessage({
			id : "block_delete",
			buffer : deleteBuffer,
		});
	deleteBuffer=[];
	}
		
}

//Function to create new cull Worker
function newCullWorker(){
	//Start culling proccess and send chunk data
	cullWorker = new Worker('./game/blockCulling.js');

	//CullWorker Messaging
	cullWorker.addEventListener('message', function(e) {
	  message = e.data;
	  switch(message.id){

		  
		  //Receive culling Data
		  case "drawData":
		 //For each message the cull buffer received
		  var loopLen=message.sendList.length;
		  for(var kk=0;kk<loopLen;kk++){
		  
		  receive = message.sendList[kk];
		  if(receive!=undefined){
			  	var chunkID = return_chunkID(receive.coords[0],receive.coords[1],receive.coords[2]);
			if(chunk[chunkID]==null){
				chunk_create(receive.coords[0],receive.coords[1],receive.coords[2]);
			}
			chunk[chunkID].blockDraws.position=receive.position;
			chunk[chunkID].blockDraws.color=receive.color;
			chunk[chunkID].blockList=receive.blockList;		
			
			var sectorCoords = sector_get(receive.coords[0],receive.coords[1],receive.coords[2]);
			var sectorID = return_sectorID(sectorCoords[0],sectorCoords[1],sectorCoords[2]);
			if(sector[sectorID]!=null){
			sector[sectorID].reDraw=1;
			}else{
			sector_create(sectorCoords[0],sectorCoords[1],sectorCoords[2]);
			}
		  }
		  }
		  break;
	  }
	});


	//Send info on chunk size and cullView 
	cullWorker.postMessage({
		id : 'start',
		chunkXY : chunkXY,
		chunkZ : chunkZ,
		zLimit : zLimit,
		viewDist : viewDist,
		zView : zView,
	});

}

//Create new cull worker
newCullWorker();

//Update the culling process on where to cull
setInterval(function(){
	cullWorker.postMessage({
		id : 'camera',
		cam : cam,
		viewDist : viewDist,
	});
},500);



//Create chunk
chunk_create = function(x,y,z){
	var chunkID = return_chunkID(x,y,z);
	
	if(chunk[chunkID]==null){
		//Create new chunk
		chunk[chunkID]={
			//coordinates
			coords : [x,y,z],
			//List of blocks -1 meaning no block
			blockList : [],	
			//Final draw of the chunk
			blockDraws : {
				position : [],
				color : [],
			},
			
			//query : gl.createQuery(),
		}

	}
}



sector_create = function(x,y,z){
	var sectorID = return_sectorID(x,y,z);
	if(sector[sectorID]==null){
		//Create new chunk
		sector[sectorID]={
			reDraw : 1,
			//coordinates
			coords : [x,y,z],	
			//Final draw of the chunk
			blockDraws : {
				position : [],
				color : [],
			},
			
			buffers : {
			 position :gl.createBuffer(),
			color : gl.createBuffer(),
			size : 0,
			},
			
			vao : gl.createVertexArray(),
			
		}
		
	gl.bindVertexArray(sector[sectorID].vao);
	gl.bindBuffer(gl.ARRAY_BUFFER,sector[sectorID].buffers.position);
	gl.vertexAttribPointer(programInfoCube.attribLocations.voxelPosition,3,gl.SHORT,false,0,0);
	gl.enableVertexAttribArray(programInfoCube.attribLocations.voxelPosition);	
	
	gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.color);
	gl.vertexAttribPointer(programInfoCube.attribLocations.voxelColor,3,gl.UNSIGNED_BYTE,false,0,0);
	gl.enableVertexAttribArray(programInfoCube.attribLocations.voxelColor);

	}
}


//Returns chunk of x,y position 
chunk_get =function(x,y,z){
	return([Math.floor(x/chunkXY),Math.floor(y/chunkXY),Math.floor(z/chunkZ)]);
}

sector_get =function(x,y,z){
	return([Math.floor(x/sectorXY),Math.floor(y/sectorXY),Math.floor(z/sectorZ)]);
}


draw_sector = function(x,y,z){
	sectorID = return_sectorID(x,y,z);
	if(sector[sectorID]==null){
		sector_create(x,y,z);
	}
		
		var posLen=0;
		var colLen=0;
		var chunkAdd=[];
		
		

		
		//Get chunks nearby and add to list
		for(xx=0;xx<sectorXY;xx++){
		for(yy=0;yy<sectorXY;yy++){
		for(zz=0;zz<sectorZ;zz++){
			var pos = [xx+sector[sectorID].coords[0]*sectorXY,yy+sector[sectorID].coords[1]*sectorXY,zz+sector[sectorID].coords[2]*sectorZ];
			var chunkID = return_chunkID(pos[0],pos[1],pos[2]);
			if(chunk[chunkID]!=null && chunk_drawn(chunkID)==true){
				posLen+=chunk[chunkID].blockDraws.position.length;
				colLen+=chunk[chunkID].blockDraws.color.length;
				chunkAdd.push(chunkID);
			}
			
		}
		}			
		}
		
			
		
		
		sector[sectorID].blockDraws.position = new Int16Array(posLen); 
		sector[sectorID].blockDraws.color = new Uint8Array(colLen); 		
		var posOffset=0;
		var colOffset=0;
		for(var q=0; q<chunkAdd.length;q++){
			sector[sectorID].blockDraws.position.set(chunk[chunkAdd[q]].blockDraws.position,posOffset);
			posOffset+=chunk[chunkAdd[q]].blockDraws.position.length;
			sector[sectorID].blockDraws.color.set(chunk[chunkAdd[q]].blockDraws.color,colOffset);
			colOffset+=chunk[chunkAdd[q]].blockDraws.color.length;			
		}
	sector[sectorID].buffers.size=(sector[sectorID].blockDraws.position.length/12)*6
	gl.bindVertexArray(sector[sectorID].vao);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.position);
	gl.bufferData(gl.ARRAY_BUFFER,sector[sectorID].blockDraws.position,gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, sector[sectorID].buffers.color);
	gl.bufferData(gl.ARRAY_BUFFER,sector[sectorID].blockDraws.color,gl.STATIC_DRAW);
	sector[sectorID].blockDraws.position=0;
	sector[sectorID].blockDraws.color=0;
}



//Check if block exists

check_block = function(x,y,z){
	//get Chunk location
	var chunkRef = chunk_get(x,y,z);
	var chunkID = return_chunkID(chunkRef[0],chunkRef[1],chunkRef[2]);
	//get relative location in chunk
	var blockLoc = [x - (chunkRef[0]*chunkXY), y - (chunkRef[1]*chunkXY),z - (chunkRef[2]*chunkZ)]
	if(chunk[chunkID]==null){
		return(-1);
	}
	if(chunk[chunkID].blockList[blockLoc[0]+blockLoc[1]*chunkXY+blockLoc[2]*chunkXY*chunkXY]!=0){
		return(1)
		}else{
		return(-1);
	}
		
}

return_chunkID = function(x,y,z){
	return(x+y*chunkSpace+z*chunkSpace*chunkSpace);
}
return_sectorID = function(x,y,z){
	return(x+y*sectorSpace+z*sectorSpace*sectorSpace);
}

chunk_drawn = function(chunkID){
	
	if(chunk[chunkID]!=null&&chunk[chunkID].blockDraws.position.length>0){
					return(true);
	}
	return(false);
}


var amountXY = -sectorXY*chunkXY*1.5;
var amountZ = -sectorZ*chunkZ*1.5;
check_frustrum= function(point){
		
		camVec = glMatrix.vec3.fromValues(point[0],point[1],point[2]);

		
		if((-glMatrix.vec3.dot(leftN,camVec) - leftD)<amountXY ||  glMatrix.vec3.dot(rightN,camVec) + rightD<amountXY  || (-glMatrix.vec3.dot(topN,camVec)+topD)<amountZ  ||  (glMatrix.vec3.dot(bottomN,camVec) + bottomD)<amountZ ||  (-glMatrix.vec3.dot(nearN,camVec) + nearD)<amountXY){
			return(0);
		}else{
			return(1);
		}
}


//Creates block within a chunk
block_create = function(x,y,z,dontCull){
	
	cullWorker.postMessage({
		id : "block_create",
		coords : [x,y,z],
		dontCull : dontCull,
	});
}

//Deletes block within a chunk
block_delete = function(x,y,z){
	cullWorker.postMessage({
		id : "block_delete",
		coords : [x,y,z],
	});
}



requestAnimationFrame(drawScene);

