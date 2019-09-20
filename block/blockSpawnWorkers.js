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
			
/*
z = Math.round(i / (WIDTH * HEIGHT));
y = Math.round((i - z * WIDTH * HEIGHT) / WIDTH);
x = i - WIDTH * (y + HEIGHT * z);
*/

			var z = Math.round(message.chunkID / (chunkSpace * chunkSpace));
			var y = Math.round((message.chunkID - z * chunkSpace * chunkSpace) / chunkSpace);
			var x = Math.round(message.chunkID - chunkSpace * (y + chunkSpace * z));
	

			//Get sector position from chunk position
			var sectorPos = sector_get(x,y,z);
			
			//Draw the sector
			
			var sectorID=return_sectorID(sectorPos[0],sectorPos[1],sectorPos[2]);

			
			if(sector[sectorID]==null){
				sector_create(sectorPos[0],sectorPos[1],sectorPos[2]);
			}
			sector_draw(sectorPos[0],sectorPos[1],sectorPos[2]);
			//sector[sectorID].reDraw=1;
			
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