//Down 
var downVec = [0,0,1];


//loops through nearby chunks and returns list of all triangles
physics_getTriangles = function(x,y,z){
	
	var triangleList=[];
	
	//Loop thorugh nearby chunks
	for(var xx=-1;xx<=1;xx++){
	for(var yy=-1;yy<=1;yy++){
	for(var zz=-1;zz<=1;zz++){
		//Return chunkID from offset position 
		var chunkID = chunk_returnID(x+xx,y+yy,z+zz);
			if(chunk[chunkID]!=null){
				//Loop through all triangles in the chunk
				for(var k=0; k<chunk[chunkID].triangles.length;k+=9){	
					//Add each triangle to list
					triangleList.push(
					[[chunk[chunkID].triangles[k],chunk[chunkID].triangles[k+1],chunk[chunkID].triangles[k+2]],
					[chunk[chunkID].triangles[k+3],chunk[chunkID].triangles[k+4],chunk[chunkID].triangles[k+5]],
					[chunk[chunkID].triangles[k+6],chunk[chunkID].triangles[k+7],chunk[chunkID].triangles[k+8]],]);					
				}
			}
	}
	}
	}
	return(triangleList);
}


//Calculates if there is an object below the player
physics_below = function(){
	var falling=1;
	var chunkID = chunk_returnID(player.chunk[0],player.chunk[1],player.chunk[2]);
	if(chunk[chunkID]!=null){
		
		//Loop through all triangles in the chunk
		for(var k=0; k<chunk[chunkID].triangles.length;k+=9){
				
				//If the triangle is within a distance threshold
				if(distance_3d([chunk[chunkID].triangles[k],chunk[chunkID].triangles[k+1],chunk[chunkID].triangles[k+2]],[player.position[0],player.position[1],player.position[2]+3])<12.0){
		
					//Create triangle from triangle data
					var triangle = [
					[chunk[chunkID].triangles[k],chunk[chunkID].triangles[k+1],chunk[chunkID].triangles[k+2]],
					[chunk[chunkID].triangles[k+3],chunk[chunkID].triangles[k+4],chunk[chunkID].triangles[k+5]],
					[chunk[chunkID].triangles[k+6],chunk[chunkID].triangles[k+7],chunk[chunkID].triangles[k+8]],			
					];
					

					//Check for intersection underneath player 
					var pointHit  = intersectTriangle([],[player.position[0],player.position[1],player.position[2]+3],downVec,triangle);
					if(pointHit!=null){
						//Flag falling to off and set player height to the points height
						falling=0;
						player.position[2]=pointHit[2]-3;
					}
			}
		}
	}
	
	//Check the next chunk down
	chunkID = chunk_returnID(player.chunk[0],player.chunk[1],player.chunk[2]+1);
	if(chunk[chunkID]!=null){
		
		//Loop through all triangles in the chunk
		for(var k=0; k<chunk[chunkID].triangles.length;k+=9){
				
				//If the triangle is within a distance threshold
				if(distance_3d([chunk[chunkID].triangles[k],chunk[chunkID].triangles[k+1],chunk[chunkID].triangles[k+2]],[player.position[0],player.position[1],player.position[2]+3])<12.0){
		
				//Create triangle from triangle data
				var triangle = [
				[chunk[chunkID].triangles[k],chunk[chunkID].triangles[k+1],chunk[chunkID].triangles[k+2]],
				[chunk[chunkID].triangles[k+3],chunk[chunkID].triangles[k+4],chunk[chunkID].triangles[k+5]],
				[chunk[chunkID].triangles[k+6],chunk[chunkID].triangles[k+7],chunk[chunkID].triangles[k+8]],			
				];
				

				//Check for intersection underneath player 
				var pointHit  = intersectTriangle([],[player.position[0],player.position[1],player.position[2]+3],downVec,triangle);
				if(pointHit!=null && Math.abs((pointHit[2]-3)-player.position[2])<1  ){
					//Flag falling to off and set player height to the points height
					falling=0;
					player.position[2]=pointHit[2]-3;
				}
			}
		}
	}
	
	//Make player 'fall' if there is nothing solid below
	if(falling==1){
		player.position[2]+=0.1;
	}	
}


//DO TEST AT -1 , -2 AND -3 up to player height

//Checks if a point infront of the player is solid
physics_infront = function(xCheck,yCheck){
	var solid=false;
	var chunkID = chunk_returnID(player.chunk[0],player.chunk[1],player.chunk[2]);
	if(chunk[chunkID]!=null){
		
		//Loop through all triangles in the chunk
		for(var k=0; k<chunk[chunkID].triangles.length;k+=9){
				
				//If the triangle is within a distance threshold
				if(distance_3d([chunk[chunkID].triangles[k],chunk[chunkID].triangles[k+1],chunk[chunkID].triangles[k+2]],[player.position[0],player.position[1],player.position[2]-2])<3.0){
		
				//Create triangle from triangle data
				var triangle = [
				[chunk[chunkID].triangles[k],chunk[chunkID].triangles[k+1],chunk[chunkID].triangles[k+2]],
				[chunk[chunkID].triangles[k+3],chunk[chunkID].triangles[k+4],chunk[chunkID].triangles[k+5]],
				[chunk[chunkID].triangles[k+6],chunk[chunkID].triangles[k+7],chunk[chunkID].triangles[k+8]],			
				];
				

				//Check for intersection underneath player 
				var pointHit  = intersectTriangle([],[xCheck,yCheck,player.position[2]-2],downVec,triangle);
				if(pointHit!=null){
					//Flag falling to off and set player height to the points height
					solid=true;;
				}
			}
		}
	}
	return(solid);
}