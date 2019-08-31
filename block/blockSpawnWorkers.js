meshWorker  = [];


//Function to create new cull Worker

function newMeshWorker(){
	
	meshIndex = meshWorker.length;
	//Start culling proccess and send chunk data
	meshWorker[meshIndex]=[];
	meshWorker[meshIndex][0] = new Worker('./render/renderMesher.js');

	//CullWorker Messaging
	meshWorker[meshIndex][0].addEventListener('message', function(e) {
	  message = e.data;
	  switch(message.id){
		case "finishMesh":
			meshWorker[meshIndex][1]=0;
			//Mark as not being proccessed
			chunk[message.chunkID].proccessing = 0;
			
			//Reclaim our block list
			chunk[message.chunkID].blockList = new Float32Array(message.arrayBuffer);
			
			
			//Set mesh data 
			chunk[message.chunkID].blockDraws.position = new Float32Array(message.result[0]);
			chunk[message.chunkID].blockDraws.color = new Uint8Array(message.result[1]);
			chunk[message.chunkID].blockDraws.indice = new Uint32Array(message.result[2]);
			
			//Get chunk position from ID
			
			
			var z = Math.round(message.chunkID / (chunkXYZ * chunkXYZ));
			var y = Math.round((message.chunkID - z * chunkXYZ * chunkXYZ) / chunkXYZ);
			var x = message.chunkID - chunkXYZ * (y + chunkXYZ * z);
			
			//Get sector position from chunk position
			var sectorPos = sector_get(x,y,z);
			//Draw the sector
			draw_sector(sectorPos[0],sectorPos[1],sectorPos[2]);
			
			//ch.postMessage(chunk[message.chunkID].blockList);
		break;

	  }
	});


	//Send info on chunk size and cullView 
	meshWorker[meshIndex][0].postMessage({
		id : 'start',
		chunkXYZ : chunkXYZ,
	});
	meshWorker[meshIndex][1]=0;
}

//Create new cull worker thread
newMeshWorker();