//Takes a byte 0-255 and returns a color 
return_color = function(a){
	switch(a){
		default:
		return([0,0,0]);
		break;
		//Grass
		case 1:
		return([0,0,0]);	
		break
		//Dirt
		case 2:
		return([100,230,150]);
		break;
		case 3:
		return([70,6,154]);
		break;
		case 4:
		return([35,35,35]);
		break;
		case 5:
		return([10,50,5]);
		break;
	}
}



var chunkXYZ=64;


//Messaging from main thread
self.addEventListener('message', function(e) {
	var message = e.data;
	switch(message.id){
		
		//Receive chunk information 
		case "start":
			chunkXYZ = message.chunkXYZ;
		break;
		
		
		case "chunkMesh": 
		var result = SurfaceNets(new Float32Array(message.blockList),message.chunkPos);
			
			self.postMessage({
				id : "finishMesh",
				chunkID : message.chunkID,
							//Position   color        indice 
				result : [result[0],result[1],result[2]],
				arrayBuffer : message.blockList,
			},[message.blockList,result[0],result[1],result[2]]);
		
		break;
		
	}
});




var SurfaceNets = (function() {
	
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

return function(data, chunkPos) {
  var dims=[chunkXYZ,chunkXYZ,chunkXYZ];
  var vertices = []
    , faces = []
	, finalVert = []
	, finalColor = []
    , n = 0
    , x = new Int32Array(3)
    , R = new Int32Array([1, (dims[0]+1), (dims[0]+1)*(dims[1]+1)])
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
    
    for(x[1]=0; x[1]<dims[1]-1; ++x[1], ++n, m+=2)
    for(x[0]=0; x[0]<dims[0]-1; ++x[0], ++n, ++m) {
    
      //Read in 8 field values around this vertex and store them in an array
      //Also calculate 8-bit mask, like in marching cubes, so we can speed up sign checks later
      var mask = 0, g = 0, idx = n;
      for(var k=0; k<2; ++k, idx += dims[0]*(dims[1]-2))
      for(var j=0; j<2; ++j, idx += dims[0]-2)      
      for(var i=0; i<2; ++i, ++g, ++idx) {
        var p = data[idx];
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
	  finalVert.push(v[0]+chunkPos[0],v[1]+chunkPos[1],v[2]+chunkPos[2]);
	  finalColor.push(v[0]*255,v[1]*255,v[2]*255);
      
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
	
  //All done!  Return the result
  return [(new Float32Array(finalVert)).buffer, (new Uint8Array(finalColor)).buffer, (new Uint32Array(faces)).buffer];
};
})();

//Greedy meshing

greedy = function(volume,chunkPos) {
var dims=[64,64,64];
var mask = new Int32Array(4096);
  function f(i,j,k) {
    return volume[i + dims[0] * (j + dims[1] * k)];
  }
  //Sweep over 3-axes
  var vertices = [], faces = [];
  for(var d=0; d<3; ++d) {
	  
    var i, j, k, l, w, h
      , u = (d+1)%3
      , v = (d+2)%3
      , x = [0,0,0]
      , q = [0,0,0];
    if(mask.length < dims[u] * dims[v]) {
      mask = new Int32Array(dims[u] * dims[v]);
    }
    q[d] = 1;
	
	//For each slice in this chunk
    for(x[d]=-1; x[d]<dims[d]; ) {
      //Compute mask
      var n = 0;
	  
	  //Loop through first axis 
      for(x[v]=0; x[v]<dims[v]; ++x[v])
		//Loop through second axis
      for(x[u]=0; x[u]<dims[u]; ++x[u], ++n) {
			//To get the direction, you use d, then you use q to determine which way it is facing
			//You can then use that to determine face value 
			
			//A is the first block we are checking
        var a = (0    <= x[d]      ? f(x[0],      x[1],      x[2])      : 0 )
			//B is the second block we are checking
          , b = (x[d] <  dims[d]-1 ? f(x[0]+q[0], x[1]+q[1], x[2]+q[2]) : 0);
		  

		  //If they are the same, or are both 0  (because if they are the same, there isn't a face between)
        if((!!a) === (!!b)) {
          mask[n] = 0;
		  //If a exists, but b doesn't 
        } else if(!!a) {
          mask[n] = a;
		  //If b exists but a doesn't
        } else {
          mask[n] = -b;
        }
      }
      //Increment x[d]
      ++x[d];
      //Generate mesh for mask using lexicographic ordering
      n = 0;
      for(j=0; j<dims[v]; ++j)
      for(i=0; i<dims[u]; ) {
        var c = mask[n];
		var saveC=mask[n];
		if(c==-1 || c==1){
			c=0;
		}
        if(!!c) {
          //Compute width
          for(w=1; c === mask[n+w] && i+w<dims[u]; ++w) {
          }
          //Compute height (this is slightly awkward
          var done = false;
          for(h=1; j+h<dims[v]; ++h) {
            for(k=0; k<w; ++k) {
              if(c !== mask[n+k+h*dims[u]]) {
                done = true;
                break;
              }
            }
            if(done) {
              break;
            }
          }
          //Add quad
          x[u] = i;  x[v] = j;
          var du = [0,0,0]
            , dv = [0,0,0]; 
          if(c > 0) {
            dv[v] = h;
            du[u] = w;
          } else {
            c = -c;
            du[v] = h;
            dv[u] = w;
          }
		  
		var col = return_color(c);  

		switch(d){
			case 0:
			if(saveC>0){
				col=[col[0]*0.9,col[1]*0.9,col[2]*0.9];		
			}else{
				col=[col[0]*0.8,col[1]*0.8,col[2]*0.8];					
			}	
			break;
			case 1:
			if(saveC>0){
				col=[col[0]*0.7,col[1]*0.7,col[2]*0.7];		
			}else{
				col=[col[0]*0.6,col[1]*0.6,col[2]*0.6];			
			}			
			break;
			case 2:
			if(saveC>0){
				//bottom
				col=[col[0]*0.5,col[1]*0.5,col[2]*0.5];
			}
				//top
								
			
			break;
		}
		  
          vertices.push(x[0]+chunkPos[0],             x[1]+chunkPos[1],             x[2]   +chunkPos[2]         );
          vertices.push(x[0]+du[0]+chunkPos[0],       x[1]+du[1]+chunkPos[1],       x[2]+du[2]+chunkPos[2]      );
          vertices.push(x[0]+du[0]+dv[0]+chunkPos[0], x[1]+du[1]+dv[1]+chunkPos[1], x[2]+du[2]+dv[2]+chunkPos[2]);
          vertices.push(x[0]      +dv[0]+chunkPos[0], x[1]      +dv[1]+chunkPos[1], x[2]      +dv[2]+chunkPos[2]);

          faces.push(col[0],col[1],col[2],col[0],col[1],col[2],col[0],col[1],col[2],col[0],col[1],col[2],);
          //Zero-out mask
          for(l=0; l<h; ++l)
          for(k=0; k<w; ++k) {
            mask[n+k+l*dims[u]] = 0;
          }
          //Increment counters and continue
          i += w; n += w;
        } else {
          ++i;    ++n;
        }
      }
    }
  }

  return([ new Int16Array(vertices).buffer, new Uint8Array(faces).buffer ]);
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

