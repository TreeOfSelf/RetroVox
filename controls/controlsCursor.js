/*
RetroVox Cursor Controls 10/21/2019

This file contins the code for setting the cursor shape and controlling the blocks within the cursor chunk
*/


//Snaps block from game position to grid position
block_build_cursor = function(x,y,z,del){
	
	//Snap XYZ to the center of the chunk
	x+=blockSettings.chunk.XYZ/2;
	y+=blockSettings.chunk.XYZ/2;
	z+=blockSettings.chunk.XYZ/2;
	
	//Set block location to coordinates
	blockLocation = [x,y,z];
	
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
	
	//Make sure block is within range of chunk
	if(x<=0 || x>=blockSettings.chunk.XYZ-1 || y<=0 || y>=blockSettings.chunk.XYZ-1 || z<=0 || z>=blockSettings.chunk.XYZ-1){
		return(-1);
	}else{
		//Add block to cursorList
		controls.cursorList.push([x-blockSettings.chunk.XYZ/2,y-blockSettings.chunk.XYZ/2,z-blockSettings.chunk.XYZ/2]);	
		//Send to block change function to preform actual build/delete 
		block_change_cursor(x,y,z,del);
	}
	
}

//Finds chunk of block, and then adds to the desnity of the block within the chunk.
block_change_cursor = function(x,y,z,del){
	var blockLocation = [x,y,z]
	//Fill edges of bordering chunk(s)

	//get 1d index from relative location
	var blockIndex = blockLocation[0]+blockLocation[1]*blockSettings.chunk.XYZ+blockLocation[2]*blockSettings.chunk.XYZ*blockSettings.chunk.XYZ;

	switch(del){
	//Build
	case 0:
		//Set density of block
		controls.cursorChunkData[blockIndex]=0
	break;
	//Delete
	case 1:
		controls.cursorChunkData[blockIndex]=255;
	break;
	}
}



//Sets the players new cursor based on their cursorShape
function cursor_draw(){
		
		//Get cursor mesh data
		cursor_sendData();	
		//if(controls.cursorList.length>0){
		 mesh_naive('cursor',controls.cursorChunkData,controls.cursorChunkType,[blockSettings.chunk.XYZ,blockSettings.chunk.XYZ,blockSettings.chunk.XYZ],[0,0,0],1);
		//}
}

function cursor_set_shape(){
		//Clear cursor chunk array and clear cursot list to populate with new values
		controls.cursorChunkData = new Float32Array(Math.pow(blockSettings.chunk.XYZ,3)).fill(255);
		controls.cursorList = [];
		switch(controls.cursorShape){
			//None
			case 0:
			
			break;
			//Single block
			case 1:
			block_build_cursor(0,0,0,0);
			break;
			//Sphere 
			case 2:
			for(var xx=-controls.buildAmount ; xx<=controls.buildAmount ; xx++){
			for(var yy=-controls.buildAmount ; yy<=controls.buildAmount ; yy++){
			for(var zz=-controls.buildAmount ; zz<=controls.buildAmount ; zz++){
				var dist = distance_3d([xx,yy,zz],[0,0,0]);
				if(dist<controls.buildAmount*1.2){
					block_build_cursor(xx,yy,zz,0);
				}
			}
			}
			}
			break;
			//Cube 
			case 3:
			for(var xx=-controls.buildAmount ; xx<=controls.buildAmount ; xx++){
			for(var yy=-controls.buildAmount ; yy<=controls.buildAmount ; yy++){
			for(var zz=-controls.buildAmount ; zz<=controls.buildAmount ; zz++){
				block_build_cursor(xx,yy,zz,0);
			}
			}
			}
			break;
			//Post 
			case 4:
			block_build_cursor(0,0,0,0);
			block_build_cursor(0,0,-1,0);
			block_build_cursor(0,0,-2,0);
			block_build_cursor(0,0,-3,0);
			block_build_cursor(0,0,-4,0);
			block_build_cursor(0,0,-5,0);
			block_build_cursor(0,0,-6,0);
			block_build_cursor(0,0,-7,0);
			
			block_build_cursor(-1,0,0,0);
			block_build_cursor(-1,0,-1,0);
			block_build_cursor(-1,0,-2,0);
			block_build_cursor(-1,0,-3,0);
			block_build_cursor(-1,0,-4,0);
			block_build_cursor(-1,0,-5,0);
			block_build_cursor(-1,0,-6,0);
			block_build_cursor(-1,0,-7,0);
			
			block_build_cursor(1,0,0,0);
			block_build_cursor(1,0,-1,0);
			block_build_cursor(1,0,-2,0);
			block_build_cursor(1,0,-3,0);
			block_build_cursor(1,0,-4,0);
			block_build_cursor(1,0,-5,0);
			block_build_cursor(1,0,-6,0);
			block_build_cursor(1,0,-7,0);
			break;
		}
		
		controls.cursorString = JSON.stringify(controls.cursorList);
		
		//Draw final cursor data
		cursor_draw();
}
