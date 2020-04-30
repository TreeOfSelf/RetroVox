physics_calculate = function(){
	var chunkID = chunk_returnID(player.chunk[0],player.chunk[1],player.chunk[2]);
	if(chunk[chunkID]!=null){
		var hit=0;
		for(var k=0; k<chunk[chunkID].triangles.length;k+=9){
			
				if(distance_3d([chunk[chunkID].triangles[k],chunk[chunkID].triangles[k+1],chunk[chunkID].triangles[k+2]],[player.position[0],player.position[1],player.position[2]+3])<12.0){
				
				var triangle = [
				[chunk[chunkID].triangles[k],chunk[chunkID].triangles[k+1],chunk[chunkID].triangles[k+2]],
				[chunk[chunkID].triangles[k+3],chunk[chunkID].triangles[k+4],chunk[chunkID].triangles[k+5]],
				[chunk[chunkID].triangles[k+6],chunk[chunkID].triangles[k+7],chunk[chunkID].triangles[k+8]],			
				];
				
				var dir = [0,0,1];
				
				var pointHit  = intersectTriangle([],[player.position[0],player.position[1],player.position[2]+3],dir,triangle);
				if(pointHit!=null){
					hit=1;
					player.position[2]=pointHit[2]-3;
				}
			}
		}
		if(hit!=1){
			player.position[2]+=0.1;
		}
		
		
	}
}