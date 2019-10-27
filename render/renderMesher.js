/*
RetroVox Chunk Meshing 9/20/2019

This file will contain the code that meshes a chunk together and sets its draw data.
It takes a blockArray and returns the verticie information that draws the triangles to make up a scene.
*/


//Container for all of our chunk data
var chunk = [];


//Messaging from main thread
self.addEventListener('message', function(e) {
	var message = e.data;
	switch(message.id){
		
		case "start":
			blockSettings = {
				chunk : {
					
				},
				sector : {
					
				},
			}
			blockSettings.chunk.space = message.chunkSpace;
			blockSettings.sector.XYZ = message.sectorXYZ;
		break;
		
		//Sets the mesh for a specified chunk
		case "mesh": 
		
			if(message.LOD==1){
		
		var result = mesh_naive(message.data,message.dataType, message.dims,message.chunkPos,message.LOD,message.chunkID);
			
			}else{
				//function MedianFilter(volume,type, dims,lod)
				var chunkInput = NearestFilter(message.data,message.dataType,message.dims,message.LOD);
				var result = mesh_naive(chunkInput[0],chunkInput[1], chunkInput[2],message.chunkPos,message.LOD,message.chunkID);
				
			}
			
			
			if(message.chunkID!='cursor'){
				
				self.postMessage({
					id : "mesh",
					chunkID : message.chunkID,
				});
			
			}else{
				self.postMessage({
					id : "mesh",
					chunkID : message.chunkID,
					result : result,
				},[result[0],result[1],result[2]]);
						
			}
		
		break;
		
		case "sector":
		
		var result = sector_draw(message.sectorPos,message.XYZ);
		
			self.postMessage({
				id : 'sector',
				sectorID : message.sectorID,
				size : result[0],
				indice : result[1],
				position : result[2],
				color : result[3],
			},[result[1],result[2],result[3]]);
		
		
		break;
		
		
	}
});

//Takes a type and returns a color
color_return = function(type){
	switch(type){
		default:
			return([0,0,0]);
		break;
		//Grass
		case 1:
			return([0,102,0]);
		break;
		//Dirt
		case 2:
			return([153,76,0]);
		break;
		//Rock
		case 3:
			return([40,40,40]);
		break;
		//Wood
		case 4:
			return([51,25,0]);
		break;
		//Red Cloth
		case 5:
			return([200,15,15]);
		break;
		//Sand
		case 6:
			return([255,128,0]);
		break;
		//Leaves
		case 7:
			return([0,160,0]);
		break;
		//Water
		case 8:
			return([0,128,255]);
		break;
		//White
		case 9:
			return([255,255,255]);
		break;
		//Black
		case 10:
			return([0,0,0]);
		break;
	}
}

var mesh_naive = (function() {
"use strict";

//Precompute edge table, like Paul Bourke does.
// This saves a bit of time when computing the centroid of each boundary cell
var cube_edges = new Int32Array(24)
  , edge_table = new Int32Array(256);
(function() {

  //Initialize the cube_edges table
  // This is just the vertex number of each cube
  var k = 0;
  for(var i=0; i<8; ++i) {
    for(var j=1; j<=4; j<<=1) {
      var p = i^j;
      if(i <= p) {
        cube_edges[k++] = i;
        cube_edges[k++] = p;
      }
    }
  }

  //Initialize the intersection table.
  //  This is a 2^(cube configuration) ->  2^(edge configuration) map
  //  There is one entry for each possible cube configuration, and the output is a 12-bit vector enumerating all edges crossing the 0-level.
  for(var i=0; i<256; ++i) {
    var em = 0;
    for(var j=0; j<24; j+=2) {
      var a = !!(i & (1<<cube_edges[j]))
        , b = !!(i & (1<<cube_edges[j+1]));
      em |= a !== b ? (1 << (j >> 1)) : 0;
    }
    edge_table[i] = em;
  }
})();

//Internal buffer, this may get resized at run time
var buffer = new Int32Array(4096);

return function(data,dataType, dims,chunkPos,lod,chunkID) {
  var vertices = []
    , faces = []
	, finalVert = []
	, finalColor = []
    , n = 0
    , x = new Int32Array(3)
    , R = new Int32Array([1, (dims[0]+1), (dims[0]+1)*(dims[0]+1)])
    , grid = new Float32Array(8)
    , buf_no = 1;
   
  //Resize buffer if necessary 
  if(R[2] * 2 > buffer.length) {
    buffer = new Int32Array(R[2] * 2);
  }
  
  //March over the voxel grid
  for(x[2]=0; x[2]<dims[2]-1; ++x[2], n+=dims[0], buf_no ^= 1, R[2]=-R[2]) {
  
    //m is the pointer into the buffer we are going to use.  
    //This is slightly obtuse because javascript does not have good support for packed data structures, so we must use typed arrays :(
    //The contents of the buffer will be the indices of the vertices on the previous x/y slice of the volume
    var m = 1 + (dims[0]+1) * (1 + buf_no * (dims[1]+1));
    var colorSave=0;
    for(x[1]=0; x[1]<dims[1]-1; ++x[1], ++n, m+=2)
    for(x[0]=0; x[0]<dims[0]-1; ++x[0], ++n, ++m) {
    
      //Read in 8 field values around this vertex and store them in an array
      //Also calculate 8-bit mask, like in marching cubes, so we can speed up sign checks later
      var mask = 0, g = 0, idx = n;
      for(var k=0; k<2; ++k, idx += dims[0]*(dims[1]-2))
      for(var j=0; j<2; ++j, idx += dims[0]-2)      
      for(var i=0; i<2; ++i, ++g, ++idx) {
        var p = data[idx]*0.01;
		if(dataType[idx]!=0){
			colorSave = dataType[idx];
		}
        grid[g] = p;
        mask |= (p < 0) ? (1<<g) : 0;
      }
      
      //Check for early termination if cell does not intersect boundary
      if(mask === 0 || mask === 0xff) {
        continue;
      }
      
      //Sum up edge intersections
      var edge_mask = edge_table[mask]
        , v = [0.0,0.0,0.0]
        , e_count = 0;
        
      //For every edge of the cube...
      for(var i=0; i<12; ++i) {
      
        //Use edge mask to check if it is crossed
        if(!(edge_mask & (1<<i))) {
          continue;
        }
        
        //If it did, increment number of edge crossings
        ++e_count;
        
        //Now find the point of intersection
        var e0 = cube_edges[ i<<1 ]       //Unpack vertices
          , e1 = cube_edges[(i<<1)+1]
          , g0 = grid[e0]                 //Unpack grid values
          , g1 = grid[e1]
          , t  = g0 - g1;                 //Compute point of intersection
        if(Math.abs(t) > 1e-6) {
          t = g0 / t;
        } else {
          continue;
        }
        
        //Interpolate vertices and add up intersections (this can be done without multiplying)
        for(var j=0, k=1; j<3; ++j, k<<=1) {
          var a = e0 & k
            , b = e1 & k;
          if(a !== b) {
            v[j] += a ? 1.0 - t : t;
          } else {
            v[j] += a ? 1.0 : 0;
          }
        }
      }
      
      //Now we just average the edge intersections and add them to coordinate
      var s = 1.0 / e_count;
      for(var i=0; i<3; ++i) {
        v[i] = x[i] + s * v[i];
      }
      
      //Add vertex to buffer, store pointer to vertex index in buffer
      buffer[m] = vertices.length;
	  vertices.push(v);
	  finalVert.push((v[0]+chunkPos[0])*lod,(v[1]+chunkPos[1])*lod,(v[2]+chunkPos[2])*lod);
	  //finalColor.push(v[0]*255,v[1]*255,v[2]*255);
	  var color = color_return(colorSave);
	  //finalColor.push(color[0]+Math.abs(Math.sin(v[0]+v[1]))*20,color[1]+Math.abs(Math.sin(v[1]+v[2]))*20,color[2]+Math.abs(Math.sin(v[2]+v[0]))*20);
	  finalColor.push(Math.min(Math.max(color[0]+Math.abs(Math.sin(v[0]+v[1]+chunkPos[0]+chunkPos[1]))*20,0),255),Math.min(Math.max(color[1]+Math.abs(Math.sin(v[1]+v[2]+chunkPos[1]+chunkPos[2]))*20,0),255),Math.min(Math.max(color[2]+Math.abs(Math.sin(v[2]+v[0]+chunkPos[2]+chunkPos[0]))*20,0),255));
      
      //Now we need to add faces together, to do this we just loop over 3 basis components
      for(var i=0; i<3; ++i) {
        //The first three entries of the edge_mask count the crossings along the edge
        if(!(edge_mask & (1<<i)) ) {
          continue;
        }
        
        // i = axes we are point along.  iu, iv = orthogonal axes
        var iu = (i+1)%3
          , iv = (i+2)%3;
          
        //If we are on a boundary, skip it
        if(x[iu] === 0 || x[iv] === 0) {
          continue;
        }
        
        //Otherwise, look up adjacent edges in buffer
        var du = R[iu]
          , dv = R[iv];
        
        //Remember to flip orientation depending on the sign of the corner.
        if(mask & 1) {
        //  faces.push([buffer[m], buffer[m-du], buffer[m-du-dv], buffer[m-dv]]);
		
			faces.push(buffer[m], buffer[m-du], buffer[m-du-dv]);
			faces.push(  buffer[m-du-dv],buffer[m-dv],buffer[m]);
        } else {
         // faces.push([buffer[m], buffer[m-dv], buffer[m-du-dv], buffer[m-du]]);
		  
		  
			faces.push(buffer[m], buffer[m-dv], buffer[m-du-dv]);
			faces.push(buffer[m-du-dv],buffer[m-du],buffer[m]);
        }
      }
    }
  }
	//Set draw data to the specified chunk
	
	if(chunkID!='cursor'){
		chunk[chunkID] = {
			drawData : {
				position : new Float32Array(finalVert),
				color : new Uint8Array(finalColor),
				indice : new Uint32Array(faces),
				
			},
		}
	}else{
		return [(new Float32Array(finalVert)).buffer, (new Uint8Array(finalColor)).buffer, (new Uint32Array(faces)).buffer];
	}
  //All done!  Return the result

};
})();



function NearestFilter(volume, type, dims,lod) {
  "use strict";
  
  
  var ndims = new Int32Array(3);
  for(var i=0; i<3; ++i) {
    ndims[i] = Math.floor(dims[i]/lod);
  }
  
  var nvolume = new Int8Array(ndims[0] * ndims[1] * ndims[2]).fill(64)
  var nType = new Uint8Array(ndims[0] * ndims[1] * ndims[2]).fill(0);
  var n = 0; 
  var l=0;
  for(var k=0; k<ndims[2]; ++k)
  for(var j=0; j<ndims[1]; ++j)
  for(var i=0; i<ndims[0]; ++i) {
    if(lod*i < dims[0] && lod*j < dims[1] && lod*k < dims[2]) {

		if(k == 0 || k==ndims[2]-1 || j == 0 || j==ndims[1]-1 || i==0 || i==ndims[0]-1){
			nvolume[n++]=64;
		}else{
		nvolume[n++] = volume[lod*i + dims[0] * (lod*j + dims[1] * (lod* k))];

		}
		nType[l++] = type[lod*i + dims[0] * (lod*j + dims[1] * (lod* k))]
    } else {
      nvolume[n++] = 64;
	  nType[l++] = 0;
    }
  }
  
  return [nvolume,nType ,ndims];
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

//Returns chunkID from chunk XYZ
chunk_returnID = function(x,y,z){
	return(x+blockSettings.chunk.space*(y+blockSettings.chunk.space*z));
}

sector_draw = function(sectorPos,XYZ){
	//Keep strack of where we are inside of the pre-allocated buffers
	var positionOffset=0;var colorOffset=0;var indiceOffset=0;
	
	//Loop through chunks in our sector space
	for(xx=0;xx<blockSettings.sector.XYZ;xx++){
	for(yy=0;yy<blockSettings.sector.XYZ;yy++){
	for(zz=0;zz<blockSettings.sector.XYZ;zz++){
		
		//Get position of chunk we have located using this formula
		// [X offset + (sectorX*sectorXYZ)]
		//For each axis 
		var pos = [xx+sectorPos[0]*blockSettings.sector.XYZ,
		yy+sectorPos[1]*blockSettings.sector.XYZ,
		zz+sectorPos[2]*blockSettings.sector.XYZ];
		
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

	
	return([indiceOffset,sectorBuffer.indice.slice(0,indiceOffset).buffer,sectorBuffer.position.slice(0,positionOffset).buffer,sectorBuffer.color.slice(0,colorOffset).buffer]);
	
}



// The MIT License (MIT)
//
// Copyright (c) 2012-2013 Mikola Lysenko
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

