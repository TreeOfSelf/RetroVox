/*
RetroVox Chunk Meshing 9/20/2019

This file will contain the code that meshes a chunk together and sets its draw data.
It takes a blockArray and returns the verticie information that draws the triangles to make up a scene.
*/


// Container for all of our chunk data
var chunk = new Map();
// Container for all of our sector data
var sector = new Map();

var sectorCoolDownLimit = 70;
var sectorCoolDown = Date.now();


// Array containing chunks active
var activeChunks = [];
// Array for sectors active
var activeSectors=[];

var started = 0;

cursor = {
	buildStrength : 2,
	buildType : 1,
};
!function(t){var o=t.noise={};function r(t,o,r){this.x=t,this.y=o,this.z=r}r.prototype.dot2=function(t,o){return this.x*t+this.y*o},r.prototype.dot3=function(t,o,r){return this.x*t+this.y*o+this.z*r};var n=[new r(1,1,0),new r(-1,1,0),new r(1,-1,0),new r(-1,-1,0),new r(1,0,1),new r(-1,0,1),new r(1,0,-1),new r(-1,0,-1),new r(0,1,1),new r(0,-1,1),new r(0,1,-1),new r(0,-1,-1)],e=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],a=new Array(512),i=new Array(512);o.seed=function(t){t>0&&t<1&&(t*=65536),(t=Math.floor(t))<256&&(t|=t<<8);for(var o=0;o<256;o++){var r;r=1&o?e[o]^255&t:e[o]^t>>8&255,a[o]=a[o+256]=r,i[o]=i[o+256]=n[r%12]}},o.seed(0);var d=.5*(Math.sqrt(3)-1),f=(3-Math.sqrt(3))/6,h=1/6;function u(t){return t*t*t*(t*(6*t-15)+10)}function s(t,o,r){return(1-r)*t+r*o}o.simplex2=function(t,o){var r,n,e=(t+o)*d,h=Math.floor(t+e),u=Math.floor(o+e),s=(h+u)*f,l=t-h+s,w=o-u+s;l>w?(r=1,n=0):(r=0,n=1);var v=l-r+f,M=w-n+f,c=l-1+2*f,p=w-1+2*f,y=i[(h&=255)+a[u&=255]],x=i[h+r+a[u+n]],m=i[h+1+a[u+1]],q=.5-l*l-w*w,z=.5-v*v-M*M,A=.5-c*c-p*p;return 70*((q<0?0:(q*=q)*q*y.dot2(l,w))+(z<0?0:(z*=z)*z*x.dot2(v,M))+(A<0?0:(A*=A)*A*m.dot2(c,p)))},o.simplex3=function(t,o,r){var n,e,d,f,u,s,l=(t+o+r)*(1/3),w=Math.floor(t+l),v=Math.floor(o+l),M=Math.floor(r+l),c=(w+v+M)*h,p=t-w+c,y=o-v+c,x=r-M+c;p>=y?y>=x?(n=1,e=0,d=0,f=1,u=1,s=0):p>=x?(n=1,e=0,d=0,f=1,u=0,s=1):(n=0,e=0,d=1,f=1,u=0,s=1):y<x?(n=0,e=0,d=1,f=0,u=1,s=1):p<x?(n=0,e=1,d=0,f=0,u=1,s=1):(n=0,e=1,d=0,f=1,u=1,s=0);var m=p-n+h,q=y-e+h,z=x-d+h,A=p-f+2*h,b=y-u+2*h,g=x-s+2*h,j=p-1+.5,k=y-1+.5,B=x-1+.5,C=i[(w&=255)+a[(v&=255)+a[M&=255]]],D=i[w+n+a[v+e+a[M+d]]],E=i[w+f+a[v+u+a[M+s]]],F=i[w+1+a[v+1+a[M+1]]],G=.6-p*p-y*y-x*x,H=.6-m*m-q*q-z*z,I=.6-A*A-b*b-g*g,J=.6-j*j-k*k-B*B;return 32*((G<0?0:(G*=G)*G*C.dot3(p,y,x))+(H<0?0:(H*=H)*H*D.dot3(m,q,z))+(I<0?0:(I*=I)*I*E.dot3(A,b,g))+(J<0?0:(J*=J)*J*F.dot3(j,k,B)))},o.perlin2=function(t,o){var r=Math.floor(t),n=Math.floor(o);t-=r,o-=n;var e=i[(r&=255)+a[n&=255]].dot2(t,o),d=i[r+a[n+1]].dot2(t,o-1),f=i[r+1+a[n]].dot2(t-1,o),h=i[r+1+a[n+1]].dot2(t-1,o-1),l=u(t);return s(s(e,f,l),s(d,h,l),u(o))},o.perlin3=function(t,o,r){var n=Math.floor(t),e=Math.floor(o),d=Math.floor(r);t-=n,o-=e,r-=d;var f=i[(n&=255)+a[(e&=255)+a[d&=255]]].dot3(t,o,r),h=i[n+a[e+a[d+1]]].dot3(t,o,r-1),l=i[n+a[e+1+a[d]]].dot3(t,o-1,r),w=i[n+a[e+1+a[d+1]]].dot3(t,o-1,r-1),v=i[n+1+a[e+a[d]]].dot3(t-1,o,r),M=i[n+1+a[e+a[d+1]]].dot3(t-1,o,r-1),c=i[n+1+a[e+1+a[d]]].dot3(t-1,o-1,r),p=i[n+1+a[e+1+a[d+1]]].dot3(t-1,o-1,r-1),y=u(t),x=u(o),m=u(r);return s(s(s(f,v,y),s(h,M,y),m),s(s(l,c,y),s(w,p,y),m),x)}}(this);

// Messaging from main thread
self.addEventListener('message', function(e) {
	var message = e.data;
	switch(message.id){
		case "processDistance":
		 blockSettings.processDistance.XY = message.distance;
		 blockSettings.processDistance.Z = message.distance;
		break;
		
		
		case "sectorDelay":
		 sectorCoolDownLimit = message.delay;
		break;
		
		case "cursorData":
			cursor.buildStrength = message.buildStrength;
			cursor.buildType = message.buildType;
		break;
		
		
		case "mapSave":
			var saveArray = [];
			// Loop through active chunks
			for(var k = 0 ; k<activeChunks.length; k++){
				  self.postMessage({
					id : 'loadProgress',
					amount : k+1+'/'+activeChunks.length,
				  });	
				// Compress data and save to array
				var blockArray = LZString.compress(chunk[activeChunks[k]].blockArray.toString());
				var typeArray = LZString.compress(chunk[activeChunks[k]].blockType.toString());
				//Push compressed data to array
				saveArray.push([chunk[activeChunks[k]].coords,blockArray,typeArray]);
			}
			//Json Stringify the save object into text so it can be stored to a text final and send back to main thread
			self.postMessage({
					id : 'finishSave',
					text : JSON.stringify(saveArray),
				});
		break;
		
		case 'loadMap':
		
			//JSON parse map data 
			var loadObject = JSON.parse(message.text);
			  //Loop through save object
			  for(var k = 0 ; k<loadObject.length; k++){
				  self.postMessage({
					id : 'loadProgress',
					amount : k+1+'/'+loadObject.length,
				  });
				  var chunkID = chunk_returnID(loadObject[k][0][0],loadObject[k][0][1],loadObject[k][0][2]);
				  chunk_create(loadObject[k][0][0],loadObject[k][0][1],loadObject[k][0][2]);
				  //Decompress data and flag chunk to reDraw
				  chunk[chunkID].blockArray = new Int8Array(LZString.decompress(loadObject[k][1]).split(','));
				  chunk[chunkID].blockType = new Uint8Array(LZString.decompress(loadObject[k][2]).split(','));
				 chunk_mesh(chunkID);
				  //chunk[chunkID].flags.reDraw=1;
			  }
		break;
		case 'player':
			player = JSON.parse(message.player);
		break;
		
		case "start":

		//Clear chunk list and create new blockSettings
			chunk= new Map();
			
			//Set our block settings to be the settings of the main thread
			blockSettings = JSON.parse(message.blockSettings);
			
			//Set our player data from player data on main thread
			player = JSON.parse(message.player);
			
		//Set data type for drawing
			switch(message.drawType){
				case 0:
					dataArrayType = Float32Array;
				break;
				case 1:
					dataArrayType = Int16Array
				break;
			}
		//New pre allocated sector buffers		
			sectorBuffer = {
				position : new dataArrayType(9999999),
				color : new Uint8Array(9999999),
				indice : new Uint32Array(9999999),
			}
			
			//Flag mesher to start now that we have required block information
			started=1;
			
		break;
		
		//Sets the mesh for a specified chunk
		case "mesh": 
			//If no LOD
			if(message.LOD==1){
				//Normal mesh
				var result = mesh_naive(message.data,message.dataType, message.dims,message.chunkPos,message.LOD,message.chunkID);
			
			}else{
				//Resize chunk
				var chunkInput = NearestFilter(chunkID,message.data,message.dataType,message.dims,message.LOD);
				//Mesh resized chunk
				var result = mesh_naive(chunkInput[0],chunkInput[1], chunkInput[2],message.chunkPos,message.LOD,message.chunkID);
				
			}
			
			//Regular chunk
			if(message.chunkID!='cursor'){
				
				self.postMessage({
					id : "mesh",
					chunkID : message.chunkID,
				});
			
			//Cursor chunk
			}else{
				self.postMessage({
					id : "mesh",
					chunkID : message.chunkID,
					result : result,
				},[result[0],result[1],result[2]]);
						
			}
		
		break;
		
		//Changes block in specified area
		case "blockChange":
			message.cursorList = JSON.parse(message.cursorList);
			var loopLen=message.cursorList.length;
			for(var k=0; k<loopLen; k++){
				block_build(message.cursorPosition[0]+message.cursorList[k][0],message.cursorPosition[1]+message.cursorList[k][1],message.cursorPosition[2]+message.cursorList[k][2],message.buildType);
			}
			
		break;

		
	}
});

//Takes a type and returns a color
//Different mathematical functions for each block type
//Variation of sine waves , cosine waves, and simplex noise
color_return = function(type,position){
	switch(type){
		default:
			return([0,0,0]);
		break;
		//Grass
		case 1:
			return([noise.simplex3(position[0]/13,position[1]/13,position[2]/13)*20,125+noise.simplex3(position[0]/13,position[1]/13,position[2]/13)*25,noise.simplex3(position[0]/13,position[1]/13,position[2]/13)*5]);
		break;
		//Dirt
		case 2:
			return([100+noise.simplex3(position[0],position[1],position[2])*20,40+noise.simplex3(position[1]/5,position[2]/5,position[0]/5)*20,0+noise.simplex3(position[1]/5,position[2]/5,position[0]/5)*20]);
		break;
		//Rock
		case 3:
			return([40+noise.simplex3(position[0]/5,position[1]/5,position[2]/5)*20,40+noise.simplex3(position[1]/5,position[2]/5,position[0]/5)*20,40+noise.simplex3(position[1]/5,position[2]/5,position[0]/5)*20]);
		break;
		//Wood
		case 4:

		return([60+noise.simplex2(position[0]/15,position[1]/15)*20,10+noise.simplex2(position[0]/5,position[1]/5)*5,0]);

		break;
		//Red Cloth
		case 5:
			return([200+Math.cos(position[0]*0.5)*20,10+Math.sin(position[1]*0.5)*10,10+Math.sin(position[2]*0.5)*10]);
		break;
		//Sand
		case 6:
			return([200+Math.sin(position[0]*3+position[1]*3)*20,100+Math.sin(position[1]*3+position[0]*3)*10,10+Math.sin(position[2]*3+position[1]+3)*5]);
		break;
		//Leaves
		case 7:
			return([Math.sin(position[0]+position[1])*5,200+Math.sin(position[1]+position[2])*30,Math.sin(position[2]+position[0])*5]);
		break;
		//Water
		case 8:
			return([Math.sin( (position[0]+position[1]) *0.2)*5,100+Math.sin( (position[1]+position[0])*0.2 )*20,230+Math.sin((position[2]+position[2] ) *0.2)*20]);

		break;
		//White
		case 9:
			return([230+Math.sin( (position[0]+position[1]) *0.2)*20,230+Math.sin( (position[1]+position[0])*0.2 )*20,230+Math.sin((position[2]+position[2] ) *0.2)*20]);
		break;
		//Black
		case 10:
			return(10+[Math.sin( (position[0]+position[1]) *0.2)*20,10+Math.sin( (position[1]+position[0])*0.2 )*20,10+Math.sin((position[2]+position[2] ) *0.2)*20]);
		break;
	}
}


//Function for creating chunk meshes from blockData
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
	var drawlod = lod;
	var collisionObj = [];
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
 	var coord =0;
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
		  
		  
        var p = data[idx]*0.0001;
		if(dataType[idx]!=127){
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
	  var posMod=1;
	  if(lod!=1){
		if( Math.floor(v[0])==0 || Math.ceil(v[0]) == dims[0]-1 || Math.floor(v[1])==0 || Math.ceil(v[1]) == dims[1]-1  || Math.floor(v[2])==0 || Math.ceil(v[2]) == dims[2]-1){
			switch(lod){
					case 2:
						posMod=1.1;
					break;
					case 4:
						posMod=1.4;
					break;
			
			}
			
		}
	  }
	  var id=x[0] + dims[0] * (x[1] + dims[1] * (x[2]));
	  if(collisionObj[id]==null){
		  collisionObj[id]=[];
	  }
	  collisionObj[id].push( (((v[0]*posMod+chunkPos[0])*lod)*10), (((v[1]*posMod+chunkPos[1])*lod)*10), (((v[2]*posMod+chunkPos[2])*lod)*10))
	 finalVert.push( (((v[0]*posMod+chunkPos[0])*lod)*10), (((v[1]*posMod+chunkPos[1])*lod)*10), (((v[2]*posMod+chunkPos[2])*lod)*10));
	  //finalColor.push(v[0]*255,v[1]*255,v[2]*255);
	  var color = color_return(colorSave,[v[0]+chunkPos[0],v[1]+chunkPos[1],v[2]+chunkPos[2]]);
	  color=[Math.min(Math.max(0,color[0]),255),Math.min(Math.max(0,color[1]),255),Math.min(Math.max(0,color[2]),255)];
	  //finalColor.push(color[0]+Math.abs(Math.sin(v[0]+v[1]))*20,color[1]+Math.abs(Math.sin(v[1]+v[2]))*20,color[2]+Math.abs(Math.sin(v[2]+v[0]))*20);
	  finalColor.push(color[0],color[1],color[2]);
	  
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
		
		//Set draw data for chunk
		
		if(faces.length!=0){
			self.postMessage({
				id : 'testObj',
				vertices : finalVert,
				faces : faces,
				
			});
		}
		
		chunk[chunkID].drawData[lod].position = new dataArrayType(finalVert);
		chunk[chunkID].drawData[lod].color = new Uint8Array(finalColor);
		chunk[chunkID].drawData[lod].indice = new Uint32Array(faces);
		
		chunk_draw_sector(chunkID);
		
		
		
	//Return draw data for cursor chunk
	}else{
		var cursorObj = {
			vertices : finalVert,
			faces : faces,
		}
		var retObj = SimplifyModifier.modify(cursorObj);
		
		//return [(new dataArrayType(finalVert)).buffer, (new Uint8Array(finalColor)).buffer, (new Uint32Array(faces)).buffer];
		return [(new dataArrayType(retObj.vertices)).buffer, (new Uint8Array(finalColor)).buffer, (new Uint32Array(retObj.faces)).buffer];

	}
  //All done!  Return the result

};
})();


//Function for resizing chunks 

			 //blockArray blockType,Dimensions, LOD level (1,2,4)
function NearestFilter(chunkID,volume, type, dims,lod) {
  "use strict";
  
  //Resize new dimensions to desired LOD
  var ndims = new Int32Array(3);
  for(var i=0; i<3; ++i) {
    ndims[i] = Math.floor(dims[i]/lod);
  }
  
  
  //Empty volume and type arrays 
  var nvolume = new Int8Array(ndims[0] * ndims[1] * ndims[2]).fill(64)
  var nType = new Uint8Array(ndims[0] * ndims[1] * ndims[2]).fill(127);
  var n = 0; 
  var l=0;
  //Loop through dimensions
  for(var k=0; k<ndims[2]; ++k)
  for(var j=0; j<ndims[1]; ++j)
  for(var i=0; i<ndims[0]; ++i) {
	  //If within new bondaries of dimension
    if(lod*i < dims[0] && lod*j < dims[1] && lod*k < dims[2]) {
		//If on the border set to no volume (because it won't seam properly)
		if(k == 0 || k==ndims[2]-1 || j == 0 || j==ndims[1]-1 || i==0 || i==ndims[0]-1){
			nvolume[n++]=64;
			nType[l++]=127;
		}else{
		nvolume[n++] = volume[lod*i + dims[0] * (lod*j + dims[1] * (lod* k))];
		nType[l++] = type[lod*i + dims[0] * (lod*j + dims[1] * (lod* k))]
		}
		//Set type 

    } else {
      nvolume[n++] = 64;
	  nType[l++] = 127;
    }
  }
  
  return [nvolume,nType ,ndims];
}



//Returns chunkID from chunk XYZ
chunk_returnID = function(x,y,z){
	return(x+blockSettings.chunk.space*(y+blockSettings.chunk.space*z));
}

//Seams together multiple chunk's draw datas into one sector
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
		if(chunk[chunkID]!=null && chunk[chunkID].drawData[chunk[chunkID].LOD].indice.length>12){
				var lod = chunk[chunkID].LOD;
				//Get index we are at in the position buffer.
				//The reason we need this, is because everytime we add a new chunk we have to offset all of it's indices to 
				//Make up for the chunks already added in. 
				var positionBefore = positionOffset;
			
				//Add chunk draw information, and then add to the offset .
				sectorBuffer.position.set(chunk[chunkID].drawData[lod].position,positionOffset);
				positionOffset+=chunk[chunkID].drawData[lod].position.length;
				//colors
				sectorBuffer.color.set(chunk[chunkID].drawData[lod].color,colorOffset);
				colorOffset+=chunk[chunkID].drawData[lod].color.length;	
				
				//Find out where we are starting inside of the indice, so that we know which indice's need to be offset.
				var indiceBefore = indiceOffset;
				//indice
				sectorBuffer.indice.set(chunk[chunkID].drawData[lod].indice,indiceOffset);
				indiceOffset+=chunk[chunkID].drawData[lod].indice.length;	
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

//Block Functions 





//Snaps block from game position to grid position
block_build = function(x,y,z,del){

	//Get chunk that this position resides in
	var blockChunk = chunk_get_no_border(x,y,z);
	
	//Offset position by chunk
	x+=blockChunk[0]*2;
	y+=blockChunk[1]*2;
	z+=blockChunk[2]*2;
	
	//Get location within chunk 
	
	var blockLocation = [(Math.round(x)) - (blockChunk[0]*blockSettings.chunk.XYZ), (Math.round(y)) - (blockChunk[1]*blockSettings.chunk.XYZ),(Math.round(z)) - (blockChunk[2]*blockSettings.chunk.XYZ)];
	
	//Displace edges 

	if(blockLocation[0]==0){
		x-=2;
	}
	if(blockLocation[1]==0){
		y-=2;
	}
	if(blockLocation[2]==0){
		z-=2;
	}

	
	//Send to block change function to preform actual build/delete 
	block_change(x,y,z,del,0,cursor.buildType);
	
}




//Finds chunk of block, and then adds to the desnity of the block within the chunk.
block_change = function(x,y,z,del,amount,buildType){
	
	//get location of chunk from block XYZ
	var chunkPosition = chunk_get(x,y,z);
		
	//get id from location of chunks
	var chunkID = chunk_returnID(chunkPosition[0],chunkPosition[1],chunkPosition[2]);
	//formula to get location of block relative inside of the chunks space.
	// x - (chunkX*chunkXYZ) for each axis
	var blockLocation = [(x) - (chunkPosition[0]*blockSettings.chunk.XYZ), (y) - (chunkPosition[1]*blockSettings.chunk.XYZ),(z) - (chunkPosition[2]*blockSettings.chunk.XYZ)]

	//Fill edges of bordering chunk(s)
	
	//Offset variables
	var xOff=0;var yOff=0;var zOff=0;

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

	
	
	//get 1d index from relative location
	var blockIndex = blockLocation[0]+blockLocation[1]*blockSettings.chunk.XYZ+blockLocation[2]*blockSettings.chunk.XYZ*blockSettings.chunk.XYZ;
	//Generate chunk if it doesn't exists
	if(chunk[chunkID]==null){
	chunk_create(chunkPosition[0],chunkPosition[1],chunkPosition[2]);
	}
	

	
	//Add/Delete density based on distance to build position (your cursor)
	
	//Calculate distance from cursor, minimum of 1 so we don't get divides by 0.

	/*var dist = (controls.buildStrength  / ( Math.max(distance_3d([x-chunkPosition[0]*2,y-chunkPosition[1]*2,z-chunkPosition[2]*2],[controls.cursorFixedPosition[0]-controls.cursorChunk[0]*2,controls.cursorFixedPosition[1]-controls.cursorChunk[1]*2,controls.cursorFixedPosition[2]-controls.cursorChunk[2]*2]),1)*0.25));
	
	
	
	if(controls.buildStrength>=20){
		dist=128;
	}*/
	
	dist=cursor.buildStrength;
	
	switch(del){
	//Build
	case 0:
		//Set density of block

		//Set type of block
		
		
		if(chunk[chunkID].blockType[blockIndex]==127){
			chunk[chunkID].blockType[blockIndex]=buildType;
		}
		
		
		
		if(chunk[chunkID].blockArray[blockIndex]-dist<=-127){
			chunk[chunkID].blockArray[blockIndex]=-127;
		}else{
			chunk[chunkID].blockArray[blockIndex]-=dist
		}
	break;
	//Delete
	case 1:

		if(chunk[chunkID].blockArray[blockIndex]+dist>64){
			chunk[chunkID].blockArray[blockIndex]=64;
		}else{
			chunk[chunkID].blockArray[blockIndex]+=dist;
		}
		
		//Delete previous block type if we arent a visible block anymore

		if(chunk[chunkID].blockArray[blockIndex]>=0){
			chunk[chunkID].blockType[blockIndex]=127;
		}
	break;
	case 2:
	//Inherit (for connecting block data)
		chunk[chunkID].blockArray[blockIndex]=amount;	
		chunk[chunkID].blockType[blockIndex] = buildType;
	break;
	}
	
 
	
	//Unoptimized checks 
	if(xOff !=0){
		block_change(x+xOff,y,z,2,chunk[chunkID].blockArray[blockIndex],chunk[chunkID].blockType[blockIndex]);
	}
	if(yOff !=0){
		block_change(x,y+yOff,z,2,chunk[chunkID].blockArray[blockIndex],chunk[chunkID].blockType[blockIndex]);
	}
	if(zOff !=0){
		block_change(x,y,z+zOff,2,chunk[chunkID].blockArray[blockIndex],chunk[chunkID].blockType[blockIndex]);
	}

	

	
	//Flag chunk to re-draw
	chunk[chunkID].flags.reDraw=1;

}



//Chunk functions

//Returns chunk XYZ from block space XYZ - 2 removing the borderStyle
//This is used for chunk selection in game space
chunk_get_no_border =function(x,y,z){
	return([Math.floor(x/ (blockSettings.chunk.XYZ-2)),Math.floor(y/ (blockSettings.chunk.XYZ-2)),Math.floor(z/(blockSettings.chunk.XYZ-2))]);
}

//Returns chunkID from chunk XYZ
chunk_returnID = function(x,y,z){
	return(x+blockSettings.chunk.space*(y+blockSettings.chunk.space*z));
}

//Returns chunk XYZ from block space XYZ
chunk_get =function(x,y,z){
	return([Math.floor(x/blockSettings.chunk.XYZ),Math.floor(y/blockSettings.chunk.XYZ),Math.floor(z/blockSettings.chunk.XYZ)]);
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
			blockArray : new Int8Array(Math.pow(blockSettings.chunk.XYZ,3)).fill(64),
			//List of block types , filled for chunk dimensions cubed 
			blockType : new Uint8Array(Math.pow(blockSettings.chunk.XYZ,3)).fill(127),
			//Draw 
			flags : {
				reDraw : 0,
				processing : 0,
			},
			//Scale of LOD 1,2,4
			LOD : 1,
			
			//Distance of last LOD change 
			lastLOD : 0,
			
			//Individual drawData for each LOD is stored at meshing
			drawData : { 
			1 : 
				{
				position : [],
				indice : [],
				color : [],
				},
			2 :
				{
				position : [],
				indice : [],
				color : [],
				},
			4 : 
				{
				position : [],
				indice : [],
				color : [],
				},
			}
		}
	
	}
	
	var dist = distance_3d(player.chunk,chunk[chunkID].coords);
	if(dist>=blockSettings.processDistance.XY*3){
			chunk[chunkID].LOD=4;
	//NEAR LOD
	}else{
		if(dist>=blockSettings.processDistance.XY*2){
			chunk[chunkID].LOD=2;
		}

	}
}

//Flags a chunk's sector to re draw (used for LOD changing or remeshing)
chunk_draw_sector=function(chunkID){
	var sectorPosition = sector_get(chunk[chunkID].coords[0],chunk[chunkID].coords[1],chunk[chunkID].coords[2]);
	//Draw the sector now that it has new information
	var sectorID=sector_returnID(sectorPosition[0],sectorPosition[1],sectorPosition[2]);
	if(sector[sectorID]==null){
		sector_create(sectorPosition[0],sectorPosition[1],sectorPosition[2]);
	}
	sector[sectorID].reDraw=1;
}


//Meshes a chunk at each LOD and stores data in drawData 
chunk_mesh = function(chunkID){
					
	mesh_naive(chunk[chunkID].blockArray,chunk[chunkID].blockType, [blockSettings.chunk.XYZ,blockSettings.chunk.XYZ,blockSettings.chunk.XYZ],
	[chunk[chunkID].coords[0]*((blockSettings.chunk.XYZ-2)/1),
	chunk[chunkID].coords[1]*( (blockSettings.chunk.XYZ-2)/1),
	chunk[chunkID].coords[2]*((blockSettings.chunk.XYZ-2)/1)],
	1,chunkID)

	var chunkInput = NearestFilter(chunkID,chunk[chunkID].blockArray,chunk[chunkID].blockType,[blockSettings.chunk.XYZ,blockSettings.chunk.XYZ,blockSettings.chunk.XYZ],2);
	mesh_naive(chunkInput[0],chunkInput[1], chunkInput[2],
	[chunk[chunkID].coords[0]*((blockSettings.chunk.XYZ-2)/2),
	chunk[chunkID].coords[1]*( (blockSettings.chunk.XYZ-2)/2),
	chunk[chunkID].coords[2]*((blockSettings.chunk.XYZ-2)/2)],
	2,chunkID);

	var chunkInput = NearestFilter(chunkID,chunk[chunkID].blockArray,chunk[chunkID].blockType,[blockSettings.chunk.XYZ,blockSettings.chunk.XYZ,blockSettings.chunk.XYZ],4);
	mesh_naive(chunkInput[0],chunkInput[1], chunkInput[2],
	[chunk[chunkID].coords[0]*((blockSettings.chunk.XYZ-2)/4),
	chunk[chunkID].coords[1]*( (blockSettings.chunk.XYZ-2)/4),
	chunk[chunkID].coords[2]*((blockSettings.chunk.XYZ-2)/4)],
	4,chunkID);
					
					
}


//Function that runs through nearby chunks next to the camera, and processes their draw data if they are flagged to.

chunk_process = function() {
	

		//Agressive nearby processing 
		
		//Create empty list of chunk ID's we are going to process.
		var processList = [];
		//Amount of chunks we have processed
		var procAmount =0;
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
		
		//Sort the list of chunks by distance
		processList.sort(function(a,b){
			return(a[1]-b[1]);
		});

		
		//Loop through the process list. 
		
		for(var k = 0 ; k<processList.length ; k++){
			var chunkID = processList[k][0];

			if(chunk[chunkID].LOD!=1){
				chunk[chunkID].LOD=1;
				chunk[chunkID].lastLOD=0;
				chunk_draw_sector(chunkID);
			}

			//If chunk is flagged to be re-drawn
			if( chunk[chunkID].flags.reDraw>=1 ){
				//if(chunk[chunkID].flags.reDraw>=processList[k][1]/2+4 || processList[k][1]<=0){
					//procAmount+=1;
					 
					chunk_mesh(chunkID);
					
					chunk[chunkID].flags.reDraw=0;
			//	}else{
				//	chunk[chunkID].flags.reDraw+=1;
				//}
			}
			
			//End loop if we have hit our processLimit
			if(procAmount>=blockSettings.processLimit){
				break;
			}
		}

		

		//Less aggressive 
		
		//Flag to keep the less aggressive far loop going 
		var farLoop=1;
		
		//Skip loop if we have hit our limit
		procAmount=0;
		//Reset process amount to keep track of how many chunks far out we are processing 
		//Amount allowed to process in one frame
		var checkLimit = blockSettings.processDistanceFarSearchLimit;
		while(farLoop==1){
			checkLimit--;
			//Get chunkID using camX+xOffset for each offset
			var chunkID= chunk_returnID(player.chunk[0]+blockSettings.processCoords[0],player.chunk[1]+blockSettings.processCoords[1],player.chunk[2]+blockSettings.processCoords[2]);
			//If the chunk exists add it to our lists and add the distance to camera.
			if(chunk[chunkID]!=null){
				//If the chunk is outside of your normal processing range 
				if( Math.abs(chunk[chunkID].coords[0] - player.chunk[0]) > blockSettings.processDistance.XY || Math.abs(chunk[chunkID].coords[1] - player.chunk[1]) > blockSettings.processDistance.XY || Math.abs(chunk[chunkID].coords[2] - player.chunk[2]) > blockSettings.processDistance.Z){ 
					//Get distance from player chunk

					var dist = distance_3d(player.chunk,chunk[chunkID].coords);
	
					if(dist >= blockSettings.processDistance.XY*2){
						//FAR LOD 
						if(dist>=blockSettings.processDistance.XY*3){
							if(chunk[chunkID].LOD!=4 && Math.abs(chunk[chunkID].lastLOD-dist) > blockSettings.processDistance.XY){	
								chunk[chunkID].lastLOD=dist;
								chunk[chunkID].LOD=4;
								chunk_draw_sector(chunkID);
							}
						//NEAR LOD
						}else{
							if(chunk[chunkID].LOD!=2 && Math.abs(chunk[chunkID].lastLOD-dist) > blockSettings.processDistance.XY){
								chunk[chunkID].lastLOD=dist;
								chunk[chunkID].LOD=2;
								chunk_draw_sector(chunkID);
		
							}
						}
					//NO LOD
					}
					
					//Redraw if flagged
					if(chunk[chunkID].flags.reDraw>0){
						if(chunk[chunkID].flags.reDraw>=dist){
						 
							chunk_mesh(chunkID);
					
							chunk[chunkID].flags.reDraw=0;
							//procAmount+=1;
						}else{
							chunk[chunkID].flags.reDraw+=1;
						}
					}
				
				}
			
			}
			
			//Iterate coordinates
			blockSettings.processCoords[0]+=1;
			
			//Check X
			switch(blockSettings.processCoords[0]){
				//Go to next number if we hit the limit
				case blockSettings.processDistanceFar:
					blockSettings.processCoords[0] = -blockSettings.processDistanceFar;
					blockSettings.processCoords[1]+=1;
				break;
			}
			//Check Y
			switch(blockSettings.processCoords[1]){
				//Go to next number if we hit the limit
				case blockSettings.processDistanceFar:
					blockSettings.processCoords[1] = -blockSettings.processDistanceFar
					blockSettings.processCoords[2]+=1;
				break;
			}
			//Check Z
			switch(blockSettings.processCoords[2]){
				//End the loop and reset our number if we finish the loop
				case blockSettings.processDistanceFar:
					blockSettings.processCoords[2] = -blockSettings.processDistanceFar;
					farLoop=0;
				break;
			}
			
			//End loop if we hit process limit or check limit
			if(procAmount>=blockSettings.processLimit || checkLimit <=0){
				farLoop=0;
			}

			
		
		}
	
}

setInterval(function(){
	if(started==1){
		chunk_process();
		sector_process();
	}
},20);


//Sector functions

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
		activeSectors.push(sectorID);
		//Create new chunk
		sector[sectorID]={
			//reDraw flag
			reDraw : 1,
			//coordinates
			coords : [x,y,z],
			
		}
		
	}
}

sector_process = function(){
		//Create empty list of chunk ID's we are going to process.
		var processList = [];
		//Amount of chunks we have processed
		var procAmount =0;
		//Loop through our process distance (Not the same as view distance, you might be able to see farther than you process (Just like IRL)).
		//These will determine the offsets we add to our camera chunk to select a chunk to process nearby.
		for(var xx=-blockSettings.processDistance.XY*3 ;xx<=blockSettings.processDistance.XY*3;xx++){
		for(var yy=-blockSettings.processDistance.XY*3 ;yy<=blockSettings.processDistance.XY*3;yy++){
		for(var zz=-blockSettings.processDistance.Z*3 ;zz<=blockSettings.processDistance.Z*3;zz++){
			
			//Get sectorID using camX+xOffset for each offset
			var sectorID= sector_returnID(player.sector[0]+xx,player.sector[1]+yy,player.sector[2]+zz);
			//If the sectorID exists add it to our lists and add the distance to camera.
			if(sector[sectorID]!=null){
				processList.push([sectorID,distance_3d(sector[sectorID].coords,player.sector)]);	
			}
		}}}
		
		//Sort the list of sectors by distance
		processList.sort(function(a,b){
			return(a[1]-b[1]);
		});

		
		//Loop through the process list. 
		
		for(var k = 0 ; k<processList.length ; k++){
			var sectorID = processList[k][0];


			//If chunk is flagged to be re-drawn
			if( sector[sectorID].reDraw>=1){
				if(sector[sectorID].reDraw>=(processList[k][1])){
					procAmount+=1;
					 
					if( Date.now() - sectorCoolDown > Math.min(sectorCoolDownLimit*(processList[k][1]+1),sectorCoolDownLimit*14)){
					//if( Date.now() - sectorCoolDown >sectorCoolDownLimit){
						 sectorCoolDown = Date.now();
						var result = sector_draw(sector[sectorID].coords,blockSettings.sector.XYZ);
						self.postMessage({
							id : 'sector',
							sectorID : sectorID,
							coords : sector[sectorID].coords,
							size : result[0],
							indice : result[1],
							position : result[2],
							color : result[3],
						},[result[1],result[2],result[3]]);
						sector[sectorID].reDraw=0;
					
					}
					
				}else{
					sector[sectorID].reDraw+=1;
				}
			}
			
			//End loop if we have hit our processLimit
			if(procAmount>=blockSettings.processLimit){
				break;
			}
		}
}


//Random Functions

//3D distance function 
function distance_3d( v1, v2 ) {
    var dx = v1[0] - v2[0];
    var dy = v1[1] - v2[1];
    var dz = v1[2] - v2[2];
    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}

//2D distance function 
function distance_2d( v1, v2 ) {
    var dx = v1[0] - v2[0];
    var dy = v1[1] - v2[1];
    return Math.sqrt( dx * dx + dy * dy  );
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


/* NOISE JS 

ISC License

Copyright (c) 2013, Joseph Gentle

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAM+WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.

*/


//LZstring compression
var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);

/*
MIT License  FOR LZString

Copyright (c) 2013 pieroxy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*

Copyright (c) 2015-2019, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
!function(t,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n((t=t||self).glMatrix={})}(this,function(t){"use strict";var n=1e-6,a="undefined"!=typeof Float32Array?Float32Array:Array,r=Math.random;var u=Math.PI/180;Math.hypot||(Math.hypot=function(){for(var t=0,n=arguments.length;n--;)t+=arguments[n]*arguments[n];return Math.sqrt(t)});var e=Object.freeze({EPSILON:n,get ARRAY_TYPE(){return a},RANDOM:r,setMatrixArrayType:function(t){a=t},toRadian:function(t){return t*u},equals:function(t,a){return Math.abs(t-a)<=n*Math.max(1,Math.abs(t),Math.abs(a))}});function o(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=a[0],c=a[1],h=a[2],s=a[3];return t[0]=r*i+e*c,t[1]=u*i+o*c,t[2]=r*h+e*s,t[3]=u*h+o*s,t}function i(t,n,a){return t[0]=n[0]-a[0],t[1]=n[1]-a[1],t[2]=n[2]-a[2],t[3]=n[3]-a[3],t}var c=o,h=i,s=Object.freeze({create:function(){var t=new a(4);return a!=Float32Array&&(t[1]=0,t[2]=0),t[0]=1,t[3]=1,t},clone:function(t){var n=new a(4);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n},copy:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t},identity:function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t},fromValues:function(t,n,r,u){var e=new a(4);return e[0]=t,e[1]=n,e[2]=r,e[3]=u,e},set:function(t,n,a,r,u){return t[0]=n,t[1]=a,t[2]=r,t[3]=u,t},transpose:function(t,n){if(t===n){var a=n[1];t[1]=n[2],t[2]=a}else t[0]=n[0],t[1]=n[2],t[2]=n[1],t[3]=n[3];return t},invert:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=a*e-u*r;return o?(o=1/o,t[0]=e*o,t[1]=-r*o,t[2]=-u*o,t[3]=a*o,t):null},adjoint:function(t,n){var a=n[0];return t[0]=n[3],t[1]=-n[1],t[2]=-n[2],t[3]=a,t},determinant:function(t){return t[0]*t[3]-t[2]*t[1]},multiply:o,rotate:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=Math.sin(a),c=Math.cos(a);return t[0]=r*c+e*i,t[1]=u*c+o*i,t[2]=r*-i+e*c,t[3]=u*-i+o*c,t},scale:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=a[0],c=a[1];return t[0]=r*i,t[1]=u*i,t[2]=e*c,t[3]=o*c,t},fromRotation:function(t,n){var a=Math.sin(n),r=Math.cos(n);return t[0]=r,t[1]=a,t[2]=-a,t[3]=r,t},fromScaling:function(t,n){return t[0]=n[0],t[1]=0,t[2]=0,t[3]=n[1],t},str:function(t){return"mat2("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+")"},frob:function(t){return Math.hypot(t[0],t[1],t[2],t[3])},LDU:function(t,n,a,r){return t[2]=r[2]/r[0],a[0]=r[0],a[1]=r[1],a[3]=r[3]-t[2]*a[1],[t,n,a]},add:function(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t[2]=n[2]+a[2],t[3]=n[3]+a[3],t},subtract:i,exactEquals:function(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]&&t[3]===n[3]},equals:function(t,a){var r=t[0],u=t[1],e=t[2],o=t[3],i=a[0],c=a[1],h=a[2],s=a[3];return Math.abs(r-i)<=n*Math.max(1,Math.abs(r),Math.abs(i))&&Math.abs(u-c)<=n*Math.max(1,Math.abs(u),Math.abs(c))&&Math.abs(e-h)<=n*Math.max(1,Math.abs(e),Math.abs(h))&&Math.abs(o-s)<=n*Math.max(1,Math.abs(o),Math.abs(s))},multiplyScalar:function(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a,t[3]=n[3]*a,t},multiplyScalarAndAdd:function(t,n,a,r){return t[0]=n[0]+a[0]*r,t[1]=n[1]+a[1]*r,t[2]=n[2]+a[2]*r,t[3]=n[3]+a[3]*r,t},mul:c,sub:h});function M(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=a[0],s=a[1],M=a[2],f=a[3],l=a[4],v=a[5];return t[0]=r*h+e*s,t[1]=u*h+o*s,t[2]=r*M+e*f,t[3]=u*M+o*f,t[4]=r*l+e*v+i,t[5]=u*l+o*v+c,t}function f(t,n,a){return t[0]=n[0]-a[0],t[1]=n[1]-a[1],t[2]=n[2]-a[2],t[3]=n[3]-a[3],t[4]=n[4]-a[4],t[5]=n[5]-a[5],t}var l=M,v=f,b=Object.freeze({create:function(){var t=new a(6);return a!=Float32Array&&(t[1]=0,t[2]=0,t[4]=0,t[5]=0),t[0]=1,t[3]=1,t},clone:function(t){var n=new a(6);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n[4]=t[4],n[5]=t[5],n},copy:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t},identity:function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t[4]=0,t[5]=0,t},fromValues:function(t,n,r,u,e,o){var i=new a(6);return i[0]=t,i[1]=n,i[2]=r,i[3]=u,i[4]=e,i[5]=o,i},set:function(t,n,a,r,u,e,o){return t[0]=n,t[1]=a,t[2]=r,t[3]=u,t[4]=e,t[5]=o,t},invert:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=n[4],i=n[5],c=a*e-r*u;return c?(c=1/c,t[0]=e*c,t[1]=-r*c,t[2]=-u*c,t[3]=a*c,t[4]=(u*i-e*o)*c,t[5]=(r*o-a*i)*c,t):null},determinant:function(t){return t[0]*t[3]-t[1]*t[2]},multiply:M,rotate:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=Math.sin(a),s=Math.cos(a);return t[0]=r*s+e*h,t[1]=u*s+o*h,t[2]=r*-h+e*s,t[3]=u*-h+o*s,t[4]=i,t[5]=c,t},scale:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=a[0],s=a[1];return t[0]=r*h,t[1]=u*h,t[2]=e*s,t[3]=o*s,t[4]=i,t[5]=c,t},translate:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=a[0],s=a[1];return t[0]=r,t[1]=u,t[2]=e,t[3]=o,t[4]=r*h+e*s+i,t[5]=u*h+o*s+c,t},fromRotation:function(t,n){var a=Math.sin(n),r=Math.cos(n);return t[0]=r,t[1]=a,t[2]=-a,t[3]=r,t[4]=0,t[5]=0,t},fromScaling:function(t,n){return t[0]=n[0],t[1]=0,t[2]=0,t[3]=n[1],t[4]=0,t[5]=0,t},fromTranslation:function(t,n){return t[0]=1,t[1]=0,t[2]=0,t[3]=1,t[4]=n[0],t[5]=n[1],t},str:function(t){return"mat2d("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+")"},frob:function(t){return Math.hypot(t[0],t[1],t[2],t[3],t[4],t[5],1)},add:function(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t[2]=n[2]+a[2],t[3]=n[3]+a[3],t[4]=n[4]+a[4],t[5]=n[5]+a[5],t},subtract:f,multiplyScalar:function(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a,t[3]=n[3]*a,t[4]=n[4]*a,t[5]=n[5]*a,t},multiplyScalarAndAdd:function(t,n,a,r){return t[0]=n[0]+a[0]*r,t[1]=n[1]+a[1]*r,t[2]=n[2]+a[2]*r,t[3]=n[3]+a[3]*r,t[4]=n[4]+a[4]*r,t[5]=n[5]+a[5]*r,t},exactEquals:function(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]&&t[3]===n[3]&&t[4]===n[4]&&t[5]===n[5]},equals:function(t,a){var r=t[0],u=t[1],e=t[2],o=t[3],i=t[4],c=t[5],h=a[0],s=a[1],M=a[2],f=a[3],l=a[4],v=a[5];return Math.abs(r-h)<=n*Math.max(1,Math.abs(r),Math.abs(h))&&Math.abs(u-s)<=n*Math.max(1,Math.abs(u),Math.abs(s))&&Math.abs(e-M)<=n*Math.max(1,Math.abs(e),Math.abs(M))&&Math.abs(o-f)<=n*Math.max(1,Math.abs(o),Math.abs(f))&&Math.abs(i-l)<=n*Math.max(1,Math.abs(i),Math.abs(l))&&Math.abs(c-v)<=n*Math.max(1,Math.abs(c),Math.abs(v))},mul:l,sub:v});function m(){var t=new a(9);return a!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[5]=0,t[6]=0,t[7]=0),t[0]=1,t[4]=1,t[8]=1,t}function d(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=n[8],f=a[0],l=a[1],v=a[2],b=a[3],m=a[4],d=a[5],x=a[6],p=a[7],y=a[8];return t[0]=f*r+l*o+v*h,t[1]=f*u+l*i+v*s,t[2]=f*e+l*c+v*M,t[3]=b*r+m*o+d*h,t[4]=b*u+m*i+d*s,t[5]=b*e+m*c+d*M,t[6]=x*r+p*o+y*h,t[7]=x*u+p*i+y*s,t[8]=x*e+p*c+y*M,t}function x(t,n,a){return t[0]=n[0]-a[0],t[1]=n[1]-a[1],t[2]=n[2]-a[2],t[3]=n[3]-a[3],t[4]=n[4]-a[4],t[5]=n[5]-a[5],t[6]=n[6]-a[6],t[7]=n[7]-a[7],t[8]=n[8]-a[8],t}var p=d,y=x,q=Object.freeze({create:m,fromMat4:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[4],t[4]=n[5],t[5]=n[6],t[6]=n[8],t[7]=n[9],t[8]=n[10],t},clone:function(t){var n=new a(9);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n[4]=t[4],n[5]=t[5],n[6]=t[6],n[7]=t[7],n[8]=t[8],n},copy:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t},fromValues:function(t,n,r,u,e,o,i,c,h){var s=new a(9);return s[0]=t,s[1]=n,s[2]=r,s[3]=u,s[4]=e,s[5]=o,s[6]=i,s[7]=c,s[8]=h,s},set:function(t,n,a,r,u,e,o,i,c,h){return t[0]=n,t[1]=a,t[2]=r,t[3]=u,t[4]=e,t[5]=o,t[6]=i,t[7]=c,t[8]=h,t},identity:function(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=0,t[7]=0,t[8]=1,t},transpose:function(t,n){if(t===n){var a=n[1],r=n[2],u=n[5];t[1]=n[3],t[2]=n[6],t[3]=a,t[5]=n[7],t[6]=r,t[7]=u}else t[0]=n[0],t[1]=n[3],t[2]=n[6],t[3]=n[1],t[4]=n[4],t[5]=n[7],t[6]=n[2],t[7]=n[5],t[8]=n[8];return t},invert:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=n[4],i=n[5],c=n[6],h=n[7],s=n[8],M=s*o-i*h,f=-s*e+i*c,l=h*e-o*c,v=a*M+r*f+u*l;return v?(v=1/v,t[0]=M*v,t[1]=(-s*r+u*h)*v,t[2]=(i*r-u*o)*v,t[3]=f*v,t[4]=(s*a-u*c)*v,t[5]=(-i*a+u*e)*v,t[6]=l*v,t[7]=(-h*a+r*c)*v,t[8]=(o*a-r*e)*v,t):null},adjoint:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=n[4],i=n[5],c=n[6],h=n[7],s=n[8];return t[0]=o*s-i*h,t[1]=u*h-r*s,t[2]=r*i-u*o,t[3]=i*c-e*s,t[4]=a*s-u*c,t[5]=u*e-a*i,t[6]=e*h-o*c,t[7]=r*c-a*h,t[8]=a*o-r*e,t},determinant:function(t){var n=t[0],a=t[1],r=t[2],u=t[3],e=t[4],o=t[5],i=t[6],c=t[7],h=t[8];return n*(h*e-o*c)+a*(-h*u+o*i)+r*(c*u-e*i)},multiply:d,translate:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=n[8],f=a[0],l=a[1];return t[0]=r,t[1]=u,t[2]=e,t[3]=o,t[4]=i,t[5]=c,t[6]=f*r+l*o+h,t[7]=f*u+l*i+s,t[8]=f*e+l*c+M,t},rotate:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=n[8],f=Math.sin(a),l=Math.cos(a);return t[0]=l*r+f*o,t[1]=l*u+f*i,t[2]=l*e+f*c,t[3]=l*o-f*r,t[4]=l*i-f*u,t[5]=l*c-f*e,t[6]=h,t[7]=s,t[8]=M,t},scale:function(t,n,a){var r=a[0],u=a[1];return t[0]=r*n[0],t[1]=r*n[1],t[2]=r*n[2],t[3]=u*n[3],t[4]=u*n[4],t[5]=u*n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t},fromTranslation:function(t,n){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=n[0],t[7]=n[1],t[8]=1,t},fromRotation:function(t,n){var a=Math.sin(n),r=Math.cos(n);return t[0]=r,t[1]=a,t[2]=0,t[3]=-a,t[4]=r,t[5]=0,t[6]=0,t[7]=0,t[8]=1,t},fromScaling:function(t,n){return t[0]=n[0],t[1]=0,t[2]=0,t[3]=0,t[4]=n[1],t[5]=0,t[6]=0,t[7]=0,t[8]=1,t},fromMat2d:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=0,t[3]=n[2],t[4]=n[3],t[5]=0,t[6]=n[4],t[7]=n[5],t[8]=1,t},fromQuat:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=a+a,i=r+r,c=u+u,h=a*o,s=r*o,M=r*i,f=u*o,l=u*i,v=u*c,b=e*o,m=e*i,d=e*c;return t[0]=1-M-v,t[3]=s-d,t[6]=f+m,t[1]=s+d,t[4]=1-h-v,t[7]=l-b,t[2]=f-m,t[5]=l+b,t[8]=1-h-M,t},normalFromMat4:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=n[4],i=n[5],c=n[6],h=n[7],s=n[8],M=n[9],f=n[10],l=n[11],v=n[12],b=n[13],m=n[14],d=n[15],x=a*i-r*o,p=a*c-u*o,y=a*h-e*o,q=r*c-u*i,g=r*h-e*i,A=u*h-e*c,w=s*b-M*v,R=s*m-f*v,z=s*d-l*v,P=M*m-f*b,j=M*d-l*b,I=f*d-l*m,S=x*I-p*j+y*P+q*z-g*R+A*w;return S?(S=1/S,t[0]=(i*I-c*j+h*P)*S,t[1]=(c*z-o*I-h*R)*S,t[2]=(o*j-i*z+h*w)*S,t[3]=(u*j-r*I-e*P)*S,t[4]=(a*I-u*z+e*R)*S,t[5]=(r*z-a*j-e*w)*S,t[6]=(b*A-m*g+d*q)*S,t[7]=(m*y-v*A-d*p)*S,t[8]=(v*g-b*y+d*x)*S,t):null},projection:function(t,n,a){return t[0]=2/n,t[1]=0,t[2]=0,t[3]=0,t[4]=-2/a,t[5]=0,t[6]=-1,t[7]=1,t[8]=1,t},str:function(t){return"mat3("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+", "+t[6]+", "+t[7]+", "+t[8]+")"},frob:function(t){return Math.hypot(t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7],t[8])},add:function(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t[2]=n[2]+a[2],t[3]=n[3]+a[3],t[4]=n[4]+a[4],t[5]=n[5]+a[5],t[6]=n[6]+a[6],t[7]=n[7]+a[7],t[8]=n[8]+a[8],t},subtract:x,multiplyScalar:function(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a,t[3]=n[3]*a,t[4]=n[4]*a,t[5]=n[5]*a,t[6]=n[6]*a,t[7]=n[7]*a,t[8]=n[8]*a,t},multiplyScalarAndAdd:function(t,n,a,r){return t[0]=n[0]+a[0]*r,t[1]=n[1]+a[1]*r,t[2]=n[2]+a[2]*r,t[3]=n[3]+a[3]*r,t[4]=n[4]+a[4]*r,t[5]=n[5]+a[5]*r,t[6]=n[6]+a[6]*r,t[7]=n[7]+a[7]*r,t[8]=n[8]+a[8]*r,t},exactEquals:function(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]&&t[3]===n[3]&&t[4]===n[4]&&t[5]===n[5]&&t[6]===n[6]&&t[7]===n[7]&&t[8]===n[8]},equals:function(t,a){var r=t[0],u=t[1],e=t[2],o=t[3],i=t[4],c=t[5],h=t[6],s=t[7],M=t[8],f=a[0],l=a[1],v=a[2],b=a[3],m=a[4],d=a[5],x=a[6],p=a[7],y=a[8];return Math.abs(r-f)<=n*Math.max(1,Math.abs(r),Math.abs(f))&&Math.abs(u-l)<=n*Math.max(1,Math.abs(u),Math.abs(l))&&Math.abs(e-v)<=n*Math.max(1,Math.abs(e),Math.abs(v))&&Math.abs(o-b)<=n*Math.max(1,Math.abs(o),Math.abs(b))&&Math.abs(i-m)<=n*Math.max(1,Math.abs(i),Math.abs(m))&&Math.abs(c-d)<=n*Math.max(1,Math.abs(c),Math.abs(d))&&Math.abs(h-x)<=n*Math.max(1,Math.abs(h),Math.abs(x))&&Math.abs(s-p)<=n*Math.max(1,Math.abs(s),Math.abs(p))&&Math.abs(M-y)<=n*Math.max(1,Math.abs(M),Math.abs(y))},mul:p,sub:y});function g(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t}function A(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=n[8],f=n[9],l=n[10],v=n[11],b=n[12],m=n[13],d=n[14],x=n[15],p=a[0],y=a[1],q=a[2],g=a[3];return t[0]=p*r+y*i+q*M+g*b,t[1]=p*u+y*c+q*f+g*m,t[2]=p*e+y*h+q*l+g*d,t[3]=p*o+y*s+q*v+g*x,p=a[4],y=a[5],q=a[6],g=a[7],t[4]=p*r+y*i+q*M+g*b,t[5]=p*u+y*c+q*f+g*m,t[6]=p*e+y*h+q*l+g*d,t[7]=p*o+y*s+q*v+g*x,p=a[8],y=a[9],q=a[10],g=a[11],t[8]=p*r+y*i+q*M+g*b,t[9]=p*u+y*c+q*f+g*m,t[10]=p*e+y*h+q*l+g*d,t[11]=p*o+y*s+q*v+g*x,p=a[12],y=a[13],q=a[14],g=a[15],t[12]=p*r+y*i+q*M+g*b,t[13]=p*u+y*c+q*f+g*m,t[14]=p*e+y*h+q*l+g*d,t[15]=p*o+y*s+q*v+g*x,t}function w(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=r+r,c=u+u,h=e+e,s=r*i,M=r*c,f=r*h,l=u*c,v=u*h,b=e*h,m=o*i,d=o*c,x=o*h;return t[0]=1-(l+b),t[1]=M+x,t[2]=f-d,t[3]=0,t[4]=M-x,t[5]=1-(s+b),t[6]=v+m,t[7]=0,t[8]=f+d,t[9]=v-m,t[10]=1-(s+l),t[11]=0,t[12]=a[0],t[13]=a[1],t[14]=a[2],t[15]=1,t}function R(t,n){return t[0]=n[12],t[1]=n[13],t[2]=n[14],t}function z(t,n){var a=n[0],r=n[1],u=n[2],e=n[4],o=n[5],i=n[6],c=n[8],h=n[9],s=n[10];return t[0]=Math.hypot(a,r,u),t[1]=Math.hypot(e,o,i),t[2]=Math.hypot(c,h,s),t}function P(t,n){var r=new a(3);z(r,n);var u=1/r[0],e=1/r[1],o=1/r[2],i=n[0]*u,c=n[1]*e,h=n[2]*o,s=n[4]*u,M=n[5]*e,f=n[6]*o,l=n[8]*u,v=n[9]*e,b=n[10]*o,m=i+M+b,d=0;return m>0?(d=2*Math.sqrt(m+1),t[3]=.25*d,t[0]=(f-v)/d,t[1]=(l-h)/d,t[2]=(c-s)/d):i>M&&i>b?(d=2*Math.sqrt(1+i-M-b),t[3]=(f-v)/d,t[0]=.25*d,t[1]=(c+s)/d,t[2]=(l+h)/d):M>b?(d=2*Math.sqrt(1+M-i-b),t[3]=(l-h)/d,t[0]=(c+s)/d,t[1]=.25*d,t[2]=(f+v)/d):(d=2*Math.sqrt(1+b-i-M),t[3]=(c-s)/d,t[0]=(l+h)/d,t[1]=(f+v)/d,t[2]=.25*d),t}function j(t,n,a){return t[0]=n[0]-a[0],t[1]=n[1]-a[1],t[2]=n[2]-a[2],t[3]=n[3]-a[3],t[4]=n[4]-a[4],t[5]=n[5]-a[5],t[6]=n[6]-a[6],t[7]=n[7]-a[7],t[8]=n[8]-a[8],t[9]=n[9]-a[9],t[10]=n[10]-a[10],t[11]=n[11]-a[11],t[12]=n[12]-a[12],t[13]=n[13]-a[13],t[14]=n[14]-a[14],t[15]=n[15]-a[15],t}var I=A,S=j,E=Object.freeze({create:function(){var t=new a(16);return a!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0),t[0]=1,t[5]=1,t[10]=1,t[15]=1,t},clone:function(t){var n=new a(16);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n[4]=t[4],n[5]=t[5],n[6]=t[6],n[7]=t[7],n[8]=t[8],n[9]=t[9],n[10]=t[10],n[11]=t[11],n[12]=t[12],n[13]=t[13],n[14]=t[14],n[15]=t[15],n},copy:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],t},fromValues:function(t,n,r,u,e,o,i,c,h,s,M,f,l,v,b,m){var d=new a(16);return d[0]=t,d[1]=n,d[2]=r,d[3]=u,d[4]=e,d[5]=o,d[6]=i,d[7]=c,d[8]=h,d[9]=s,d[10]=M,d[11]=f,d[12]=l,d[13]=v,d[14]=b,d[15]=m,d},set:function(t,n,a,r,u,e,o,i,c,h,s,M,f,l,v,b,m){return t[0]=n,t[1]=a,t[2]=r,t[3]=u,t[4]=e,t[5]=o,t[6]=i,t[7]=c,t[8]=h,t[9]=s,t[10]=M,t[11]=f,t[12]=l,t[13]=v,t[14]=b,t[15]=m,t},identity:g,transpose:function(t,n){if(t===n){var a=n[1],r=n[2],u=n[3],e=n[6],o=n[7],i=n[11];t[1]=n[4],t[2]=n[8],t[3]=n[12],t[4]=a,t[6]=n[9],t[7]=n[13],t[8]=r,t[9]=e,t[11]=n[14],t[12]=u,t[13]=o,t[14]=i}else t[0]=n[0],t[1]=n[4],t[2]=n[8],t[3]=n[12],t[4]=n[1],t[5]=n[5],t[6]=n[9],t[7]=n[13],t[8]=n[2],t[9]=n[6],t[10]=n[10],t[11]=n[14],t[12]=n[3],t[13]=n[7],t[14]=n[11],t[15]=n[15];return t},invert:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=n[4],i=n[5],c=n[6],h=n[7],s=n[8],M=n[9],f=n[10],l=n[11],v=n[12],b=n[13],m=n[14],d=n[15],x=a*i-r*o,p=a*c-u*o,y=a*h-e*o,q=r*c-u*i,g=r*h-e*i,A=u*h-e*c,w=s*b-M*v,R=s*m-f*v,z=s*d-l*v,P=M*m-f*b,j=M*d-l*b,I=f*d-l*m,S=x*I-p*j+y*P+q*z-g*R+A*w;return S?(S=1/S,t[0]=(i*I-c*j+h*P)*S,t[1]=(u*j-r*I-e*P)*S,t[2]=(b*A-m*g+d*q)*S,t[3]=(f*g-M*A-l*q)*S,t[4]=(c*z-o*I-h*R)*S,t[5]=(a*I-u*z+e*R)*S,t[6]=(m*y-v*A-d*p)*S,t[7]=(s*A-f*y+l*p)*S,t[8]=(o*j-i*z+h*w)*S,t[9]=(r*z-a*j-e*w)*S,t[10]=(v*g-b*y+d*x)*S,t[11]=(M*y-s*g-l*x)*S,t[12]=(i*R-o*P-c*w)*S,t[13]=(a*P-r*R+u*w)*S,t[14]=(b*p-v*q-m*x)*S,t[15]=(s*q-M*p+f*x)*S,t):null},adjoint:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=n[4],i=n[5],c=n[6],h=n[7],s=n[8],M=n[9],f=n[10],l=n[11],v=n[12],b=n[13],m=n[14],d=n[15];return t[0]=i*(f*d-l*m)-M*(c*d-h*m)+b*(c*l-h*f),t[1]=-(r*(f*d-l*m)-M*(u*d-e*m)+b*(u*l-e*f)),t[2]=r*(c*d-h*m)-i*(u*d-e*m)+b*(u*h-e*c),t[3]=-(r*(c*l-h*f)-i*(u*l-e*f)+M*(u*h-e*c)),t[4]=-(o*(f*d-l*m)-s*(c*d-h*m)+v*(c*l-h*f)),t[5]=a*(f*d-l*m)-s*(u*d-e*m)+v*(u*l-e*f),t[6]=-(a*(c*d-h*m)-o*(u*d-e*m)+v*(u*h-e*c)),t[7]=a*(c*l-h*f)-o*(u*l-e*f)+s*(u*h-e*c),t[8]=o*(M*d-l*b)-s*(i*d-h*b)+v*(i*l-h*M),t[9]=-(a*(M*d-l*b)-s*(r*d-e*b)+v*(r*l-e*M)),t[10]=a*(i*d-h*b)-o*(r*d-e*b)+v*(r*h-e*i),t[11]=-(a*(i*l-h*M)-o*(r*l-e*M)+s*(r*h-e*i)),t[12]=-(o*(M*m-f*b)-s*(i*m-c*b)+v*(i*f-c*M)),t[13]=a*(M*m-f*b)-s*(r*m-u*b)+v*(r*f-u*M),t[14]=-(a*(i*m-c*b)-o*(r*m-u*b)+v*(r*c-u*i)),t[15]=a*(i*f-c*M)-o*(r*f-u*M)+s*(r*c-u*i),t},determinant:function(t){var n=t[0],a=t[1],r=t[2],u=t[3],e=t[4],o=t[5],i=t[6],c=t[7],h=t[8],s=t[9],M=t[10],f=t[11],l=t[12],v=t[13],b=t[14],m=t[15];return(n*o-a*e)*(M*m-f*b)-(n*i-r*e)*(s*m-f*v)+(n*c-u*e)*(s*b-M*v)+(a*i-r*o)*(h*m-f*l)-(a*c-u*o)*(h*b-M*l)+(r*c-u*i)*(h*v-s*l)},multiply:A,translate:function(t,n,a){var r,u,e,o,i,c,h,s,M,f,l,v,b=a[0],m=a[1],d=a[2];return n===t?(t[12]=n[0]*b+n[4]*m+n[8]*d+n[12],t[13]=n[1]*b+n[5]*m+n[9]*d+n[13],t[14]=n[2]*b+n[6]*m+n[10]*d+n[14],t[15]=n[3]*b+n[7]*m+n[11]*d+n[15]):(r=n[0],u=n[1],e=n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=n[8],f=n[9],l=n[10],v=n[11],t[0]=r,t[1]=u,t[2]=e,t[3]=o,t[4]=i,t[5]=c,t[6]=h,t[7]=s,t[8]=M,t[9]=f,t[10]=l,t[11]=v,t[12]=r*b+i*m+M*d+n[12],t[13]=u*b+c*m+f*d+n[13],t[14]=e*b+h*m+l*d+n[14],t[15]=o*b+s*m+v*d+n[15]),t},scale:function(t,n,a){var r=a[0],u=a[1],e=a[2];return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=n[3]*r,t[4]=n[4]*u,t[5]=n[5]*u,t[6]=n[6]*u,t[7]=n[7]*u,t[8]=n[8]*e,t[9]=n[9]*e,t[10]=n[10]*e,t[11]=n[11]*e,t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],t},rotate:function(t,a,r,u){var e,o,i,c,h,s,M,f,l,v,b,m,d,x,p,y,q,g,A,w,R,z,P,j,I=u[0],S=u[1],E=u[2],O=Math.hypot(I,S,E);return O<n?null:(I*=O=1/O,S*=O,E*=O,e=Math.sin(r),i=1-(o=Math.cos(r)),c=a[0],h=a[1],s=a[2],M=a[3],f=a[4],l=a[5],v=a[6],b=a[7],m=a[8],d=a[9],x=a[10],p=a[11],y=I*I*i+o,q=S*I*i+E*e,g=E*I*i-S*e,A=I*S*i-E*e,w=S*S*i+o,R=E*S*i+I*e,z=I*E*i+S*e,P=S*E*i-I*e,j=E*E*i+o,t[0]=c*y+f*q+m*g,t[1]=h*y+l*q+d*g,t[2]=s*y+v*q+x*g,t[3]=M*y+b*q+p*g,t[4]=c*A+f*w+m*R,t[5]=h*A+l*w+d*R,t[6]=s*A+v*w+x*R,t[7]=M*A+b*w+p*R,t[8]=c*z+f*P+m*j,t[9]=h*z+l*P+d*j,t[10]=s*z+v*P+x*j,t[11]=M*z+b*P+p*j,a!==t&&(t[12]=a[12],t[13]=a[13],t[14]=a[14],t[15]=a[15]),t)},rotateX:function(t,n,a){var r=Math.sin(a),u=Math.cos(a),e=n[4],o=n[5],i=n[6],c=n[7],h=n[8],s=n[9],M=n[10],f=n[11];return n!==t&&(t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15]),t[4]=e*u+h*r,t[5]=o*u+s*r,t[6]=i*u+M*r,t[7]=c*u+f*r,t[8]=h*u-e*r,t[9]=s*u-o*r,t[10]=M*u-i*r,t[11]=f*u-c*r,t},rotateY:function(t,n,a){var r=Math.sin(a),u=Math.cos(a),e=n[0],o=n[1],i=n[2],c=n[3],h=n[8],s=n[9],M=n[10],f=n[11];return n!==t&&(t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15]),t[0]=e*u-h*r,t[1]=o*u-s*r,t[2]=i*u-M*r,t[3]=c*u-f*r,t[8]=e*r+h*u,t[9]=o*r+s*u,t[10]=i*r+M*u,t[11]=c*r+f*u,t},rotateZ:function(t,n,a){var r=Math.sin(a),u=Math.cos(a),e=n[0],o=n[1],i=n[2],c=n[3],h=n[4],s=n[5],M=n[6],f=n[7];return n!==t&&(t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15]),t[0]=e*u+h*r,t[1]=o*u+s*r,t[2]=i*u+M*r,t[3]=c*u+f*r,t[4]=h*u-e*r,t[5]=s*u-o*r,t[6]=M*u-i*r,t[7]=f*u-c*r,t},fromTranslation:function(t,n){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=n[0],t[13]=n[1],t[14]=n[2],t[15]=1,t},fromScaling:function(t,n){return t[0]=n[0],t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=n[1],t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=n[2],t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},fromRotation:function(t,a,r){var u,e,o,i=r[0],c=r[1],h=r[2],s=Math.hypot(i,c,h);return s<n?null:(i*=s=1/s,c*=s,h*=s,u=Math.sin(a),o=1-(e=Math.cos(a)),t[0]=i*i*o+e,t[1]=c*i*o+h*u,t[2]=h*i*o-c*u,t[3]=0,t[4]=i*c*o-h*u,t[5]=c*c*o+e,t[6]=h*c*o+i*u,t[7]=0,t[8]=i*h*o+c*u,t[9]=c*h*o-i*u,t[10]=h*h*o+e,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t)},fromXRotation:function(t,n){var a=Math.sin(n),r=Math.cos(n);return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=r,t[6]=a,t[7]=0,t[8]=0,t[9]=-a,t[10]=r,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},fromYRotation:function(t,n){var a=Math.sin(n),r=Math.cos(n);return t[0]=r,t[1]=0,t[2]=-a,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=a,t[9]=0,t[10]=r,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},fromZRotation:function(t,n){var a=Math.sin(n),r=Math.cos(n);return t[0]=r,t[1]=a,t[2]=0,t[3]=0,t[4]=-a,t[5]=r,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},fromRotationTranslation:w,fromQuat2:function(t,n){var r=new a(3),u=-n[0],e=-n[1],o=-n[2],i=n[3],c=n[4],h=n[5],s=n[6],M=n[7],f=u*u+e*e+o*o+i*i;return f>0?(r[0]=2*(c*i+M*u+h*o-s*e)/f,r[1]=2*(h*i+M*e+s*u-c*o)/f,r[2]=2*(s*i+M*o+c*e-h*u)/f):(r[0]=2*(c*i+M*u+h*o-s*e),r[1]=2*(h*i+M*e+s*u-c*o),r[2]=2*(s*i+M*o+c*e-h*u)),w(t,n,r),t},getTranslation:R,getScaling:z,getRotation:P,fromRotationTranslationScale:function(t,n,a,r){var u=n[0],e=n[1],o=n[2],i=n[3],c=u+u,h=e+e,s=o+o,M=u*c,f=u*h,l=u*s,v=e*h,b=e*s,m=o*s,d=i*c,x=i*h,p=i*s,y=r[0],q=r[1],g=r[2];return t[0]=(1-(v+m))*y,t[1]=(f+p)*y,t[2]=(l-x)*y,t[3]=0,t[4]=(f-p)*q,t[5]=(1-(M+m))*q,t[6]=(b+d)*q,t[7]=0,t[8]=(l+x)*g,t[9]=(b-d)*g,t[10]=(1-(M+v))*g,t[11]=0,t[12]=a[0],t[13]=a[1],t[14]=a[2],t[15]=1,t},fromRotationTranslationScaleOrigin:function(t,n,a,r,u){var e=n[0],o=n[1],i=n[2],c=n[3],h=e+e,s=o+o,M=i+i,f=e*h,l=e*s,v=e*M,b=o*s,m=o*M,d=i*M,x=c*h,p=c*s,y=c*M,q=r[0],g=r[1],A=r[2],w=u[0],R=u[1],z=u[2],P=(1-(b+d))*q,j=(l+y)*q,I=(v-p)*q,S=(l-y)*g,E=(1-(f+d))*g,O=(m+x)*g,T=(v+p)*A,D=(m-x)*A,F=(1-(f+b))*A;return t[0]=P,t[1]=j,t[2]=I,t[3]=0,t[4]=S,t[5]=E,t[6]=O,t[7]=0,t[8]=T,t[9]=D,t[10]=F,t[11]=0,t[12]=a[0]+w-(P*w+S*R+T*z),t[13]=a[1]+R-(j*w+E*R+D*z),t[14]=a[2]+z-(I*w+O*R+F*z),t[15]=1,t},fromQuat:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=a+a,i=r+r,c=u+u,h=a*o,s=r*o,M=r*i,f=u*o,l=u*i,v=u*c,b=e*o,m=e*i,d=e*c;return t[0]=1-M-v,t[1]=s+d,t[2]=f-m,t[3]=0,t[4]=s-d,t[5]=1-h-v,t[6]=l+b,t[7]=0,t[8]=f+m,t[9]=l-b,t[10]=1-h-M,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},frustum:function(t,n,a,r,u,e,o){var i=1/(a-n),c=1/(u-r),h=1/(e-o);return t[0]=2*e*i,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=2*e*c,t[6]=0,t[7]=0,t[8]=(a+n)*i,t[9]=(u+r)*c,t[10]=(o+e)*h,t[11]=-1,t[12]=0,t[13]=0,t[14]=o*e*2*h,t[15]=0,t},perspective:function(t,n,a,r,u){var e,o=1/Math.tan(n/2);return t[0]=o/a,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=o,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=-1,t[12]=0,t[13]=0,t[15]=0,null!=u&&u!==1/0?(e=1/(r-u),t[10]=(u+r)*e,t[14]=2*u*r*e):(t[10]=-1,t[14]=-2*r),t},perspectiveFromFieldOfView:function(t,n,a,r){var u=Math.tan(n.upDegrees*Math.PI/180),e=Math.tan(n.downDegrees*Math.PI/180),o=Math.tan(n.leftDegrees*Math.PI/180),i=Math.tan(n.rightDegrees*Math.PI/180),c=2/(o+i),h=2/(u+e);return t[0]=c,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=h,t[6]=0,t[7]=0,t[8]=-(o-i)*c*.5,t[9]=(u-e)*h*.5,t[10]=r/(a-r),t[11]=-1,t[12]=0,t[13]=0,t[14]=r*a/(a-r),t[15]=0,t},ortho:function(t,n,a,r,u,e,o){var i=1/(n-a),c=1/(r-u),h=1/(e-o);return t[0]=-2*i,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=-2*c,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=2*h,t[11]=0,t[12]=(n+a)*i,t[13]=(u+r)*c,t[14]=(o+e)*h,t[15]=1,t},lookAt:function(t,a,r,u){var e,o,i,c,h,s,M,f,l,v,b=a[0],m=a[1],d=a[2],x=u[0],p=u[1],y=u[2],q=r[0],A=r[1],w=r[2];return Math.abs(b-q)<n&&Math.abs(m-A)<n&&Math.abs(d-w)<n?g(t):(M=b-q,f=m-A,l=d-w,e=p*(l*=v=1/Math.hypot(M,f,l))-y*(f*=v),o=y*(M*=v)-x*l,i=x*f-p*M,(v=Math.hypot(e,o,i))?(e*=v=1/v,o*=v,i*=v):(e=0,o=0,i=0),c=f*i-l*o,h=l*e-M*i,s=M*o-f*e,(v=Math.hypot(c,h,s))?(c*=v=1/v,h*=v,s*=v):(c=0,h=0,s=0),t[0]=e,t[1]=c,t[2]=M,t[3]=0,t[4]=o,t[5]=h,t[6]=f,t[7]=0,t[8]=i,t[9]=s,t[10]=l,t[11]=0,t[12]=-(e*b+o*m+i*d),t[13]=-(c*b+h*m+s*d),t[14]=-(M*b+f*m+l*d),t[15]=1,t)},targetTo:function(t,n,a,r){var u=n[0],e=n[1],o=n[2],i=r[0],c=r[1],h=r[2],s=u-a[0],M=e-a[1],f=o-a[2],l=s*s+M*M+f*f;l>0&&(s*=l=1/Math.sqrt(l),M*=l,f*=l);var v=c*f-h*M,b=h*s-i*f,m=i*M-c*s;return(l=v*v+b*b+m*m)>0&&(v*=l=1/Math.sqrt(l),b*=l,m*=l),t[0]=v,t[1]=b,t[2]=m,t[3]=0,t[4]=M*m-f*b,t[5]=f*v-s*m,t[6]=s*b-M*v,t[7]=0,t[8]=s,t[9]=M,t[10]=f,t[11]=0,t[12]=u,t[13]=e,t[14]=o,t[15]=1,t},str:function(t){return"mat4("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+", "+t[6]+", "+t[7]+", "+t[8]+", "+t[9]+", "+t[10]+", "+t[11]+", "+t[12]+", "+t[13]+", "+t[14]+", "+t[15]+")"},frob:function(t){return Math.hypot(t[0],t[1],t[3],t[4],t[5],t[6],t[7],t[8],t[9],t[10],t[11],t[12],t[13],t[14],t[15])},add:function(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t[2]=n[2]+a[2],t[3]=n[3]+a[3],t[4]=n[4]+a[4],t[5]=n[5]+a[5],t[6]=n[6]+a[6],t[7]=n[7]+a[7],t[8]=n[8]+a[8],t[9]=n[9]+a[9],t[10]=n[10]+a[10],t[11]=n[11]+a[11],t[12]=n[12]+a[12],t[13]=n[13]+a[13],t[14]=n[14]+a[14],t[15]=n[15]+a[15],t},subtract:j,multiplyScalar:function(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a,t[3]=n[3]*a,t[4]=n[4]*a,t[5]=n[5]*a,t[6]=n[6]*a,t[7]=n[7]*a,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=n[11]*a,t[12]=n[12]*a,t[13]=n[13]*a,t[14]=n[14]*a,t[15]=n[15]*a,t},multiplyScalarAndAdd:function(t,n,a,r){return t[0]=n[0]+a[0]*r,t[1]=n[1]+a[1]*r,t[2]=n[2]+a[2]*r,t[3]=n[3]+a[3]*r,t[4]=n[4]+a[4]*r,t[5]=n[5]+a[5]*r,t[6]=n[6]+a[6]*r,t[7]=n[7]+a[7]*r,t[8]=n[8]+a[8]*r,t[9]=n[9]+a[9]*r,t[10]=n[10]+a[10]*r,t[11]=n[11]+a[11]*r,t[12]=n[12]+a[12]*r,t[13]=n[13]+a[13]*r,t[14]=n[14]+a[14]*r,t[15]=n[15]+a[15]*r,t},exactEquals:function(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]&&t[3]===n[3]&&t[4]===n[4]&&t[5]===n[5]&&t[6]===n[6]&&t[7]===n[7]&&t[8]===n[8]&&t[9]===n[9]&&t[10]===n[10]&&t[11]===n[11]&&t[12]===n[12]&&t[13]===n[13]&&t[14]===n[14]&&t[15]===n[15]},equals:function(t,a){var r=t[0],u=t[1],e=t[2],o=t[3],i=t[4],c=t[5],h=t[6],s=t[7],M=t[8],f=t[9],l=t[10],v=t[11],b=t[12],m=t[13],d=t[14],x=t[15],p=a[0],y=a[1],q=a[2],g=a[3],A=a[4],w=a[5],R=a[6],z=a[7],P=a[8],j=a[9],I=a[10],S=a[11],E=a[12],O=a[13],T=a[14],D=a[15];return Math.abs(r-p)<=n*Math.max(1,Math.abs(r),Math.abs(p))&&Math.abs(u-y)<=n*Math.max(1,Math.abs(u),Math.abs(y))&&Math.abs(e-q)<=n*Math.max(1,Math.abs(e),Math.abs(q))&&Math.abs(o-g)<=n*Math.max(1,Math.abs(o),Math.abs(g))&&Math.abs(i-A)<=n*Math.max(1,Math.abs(i),Math.abs(A))&&Math.abs(c-w)<=n*Math.max(1,Math.abs(c),Math.abs(w))&&Math.abs(h-R)<=n*Math.max(1,Math.abs(h),Math.abs(R))&&Math.abs(s-z)<=n*Math.max(1,Math.abs(s),Math.abs(z))&&Math.abs(M-P)<=n*Math.max(1,Math.abs(M),Math.abs(P))&&Math.abs(f-j)<=n*Math.max(1,Math.abs(f),Math.abs(j))&&Math.abs(l-I)<=n*Math.max(1,Math.abs(l),Math.abs(I))&&Math.abs(v-S)<=n*Math.max(1,Math.abs(v),Math.abs(S))&&Math.abs(b-E)<=n*Math.max(1,Math.abs(b),Math.abs(E))&&Math.abs(m-O)<=n*Math.max(1,Math.abs(m),Math.abs(O))&&Math.abs(d-T)<=n*Math.max(1,Math.abs(d),Math.abs(T))&&Math.abs(x-D)<=n*Math.max(1,Math.abs(x),Math.abs(D))},mul:I,sub:S});function O(){var t=new a(3);return a!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t}function T(t){var n=t[0],a=t[1],r=t[2];return Math.hypot(n,a,r)}function D(t,n,r){var u=new a(3);return u[0]=t,u[1]=n,u[2]=r,u}function F(t,n,a){return t[0]=n[0]-a[0],t[1]=n[1]-a[1],t[2]=n[2]-a[2],t}function L(t,n,a){return t[0]=n[0]*a[0],t[1]=n[1]*a[1],t[2]=n[2]*a[2],t}function V(t,n,a){return t[0]=n[0]/a[0],t[1]=n[1]/a[1],t[2]=n[2]/a[2],t}function Q(t,n){var a=n[0]-t[0],r=n[1]-t[1],u=n[2]-t[2];return Math.hypot(a,r,u)}function Y(t,n){var a=n[0]-t[0],r=n[1]-t[1],u=n[2]-t[2];return a*a+r*r+u*u}function X(t){var n=t[0],a=t[1],r=t[2];return n*n+a*a+r*r}function Z(t,n){var a=n[0],r=n[1],u=n[2],e=a*a+r*r+u*u;return e>0&&(e=1/Math.sqrt(e)),t[0]=n[0]*e,t[1]=n[1]*e,t[2]=n[2]*e,t}function _(t,n){return t[0]*n[0]+t[1]*n[1]+t[2]*n[2]}function B(t,n,a){var r=n[0],u=n[1],e=n[2],o=a[0],i=a[1],c=a[2];return t[0]=u*c-e*i,t[1]=e*o-r*c,t[2]=r*i-u*o,t}var N,k=F,U=L,W=V,C=Q,G=Y,H=T,J=X,K=(N=O(),function(t,n,a,r,u,e){var o,i;for(n||(n=3),a||(a=0),i=r?Math.min(r*n+a,t.length):t.length,o=a;o<i;o+=n)N[0]=t[o],N[1]=t[o+1],N[2]=t[o+2],u(N,N,e),t[o]=N[0],t[o+1]=N[1],t[o+2]=N[2];return t}),$=Object.freeze({create:O,clone:function(t){var n=new a(3);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n},length:T,fromValues:D,copy:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t},set:function(t,n,a,r){return t[0]=n,t[1]=a,t[2]=r,t},add:function(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t[2]=n[2]+a[2],t},subtract:F,multiply:L,divide:V,ceil:function(t,n){return t[0]=Math.ceil(n[0]),t[1]=Math.ceil(n[1]),t[2]=Math.ceil(n[2]),t},floor:function(t,n){return t[0]=Math.floor(n[0]),t[1]=Math.floor(n[1]),t[2]=Math.floor(n[2]),t},min:function(t,n,a){return t[0]=Math.min(n[0],a[0]),t[1]=Math.min(n[1],a[1]),t[2]=Math.min(n[2],a[2]),t},max:function(t,n,a){return t[0]=Math.max(n[0],a[0]),t[1]=Math.max(n[1],a[1]),t[2]=Math.max(n[2],a[2]),t},round:function(t,n){return t[0]=Math.round(n[0]),t[1]=Math.round(n[1]),t[2]=Math.round(n[2]),t},scale:function(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a,t},scaleAndAdd:function(t,n,a,r){return t[0]=n[0]+a[0]*r,t[1]=n[1]+a[1]*r,t[2]=n[2]+a[2]*r,t},distance:Q,squaredDistance:Y,squaredLength:X,negate:function(t,n){return t[0]=-n[0],t[1]=-n[1],t[2]=-n[2],t},inverse:function(t,n){return t[0]=1/n[0],t[1]=1/n[1],t[2]=1/n[2],t},normalize:Z,dot:_,cross:B,lerp:function(t,n,a,r){var u=n[0],e=n[1],o=n[2];return t[0]=u+r*(a[0]-u),t[1]=e+r*(a[1]-e),t[2]=o+r*(a[2]-o),t},hermite:function(t,n,a,r,u,e){var o=e*e,i=o*(2*e-3)+1,c=o*(e-2)+e,h=o*(e-1),s=o*(3-2*e);return t[0]=n[0]*i+a[0]*c+r[0]*h+u[0]*s,t[1]=n[1]*i+a[1]*c+r[1]*h+u[1]*s,t[2]=n[2]*i+a[2]*c+r[2]*h+u[2]*s,t},bezier:function(t,n,a,r,u,e){var o=1-e,i=o*o,c=e*e,h=i*o,s=3*e*i,M=3*c*o,f=c*e;return t[0]=n[0]*h+a[0]*s+r[0]*M+u[0]*f,t[1]=n[1]*h+a[1]*s+r[1]*M+u[1]*f,t[2]=n[2]*h+a[2]*s+r[2]*M+u[2]*f,t},random:function(t,n){n=n||1;var a=2*r()*Math.PI,u=2*r()-1,e=Math.sqrt(1-u*u)*n;return t[0]=Math.cos(a)*e,t[1]=Math.sin(a)*e,t[2]=u*n,t},transformMat4:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=a[3]*r+a[7]*u+a[11]*e+a[15];return o=o||1,t[0]=(a[0]*r+a[4]*u+a[8]*e+a[12])/o,t[1]=(a[1]*r+a[5]*u+a[9]*e+a[13])/o,t[2]=(a[2]*r+a[6]*u+a[10]*e+a[14])/o,t},transformMat3:function(t,n,a){var r=n[0],u=n[1],e=n[2];return t[0]=r*a[0]+u*a[3]+e*a[6],t[1]=r*a[1]+u*a[4]+e*a[7],t[2]=r*a[2]+u*a[5]+e*a[8],t},transformQuat:function(t,n,a){var r=a[0],u=a[1],e=a[2],o=a[3],i=n[0],c=n[1],h=n[2],s=u*h-e*c,M=e*i-r*h,f=r*c-u*i,l=u*f-e*M,v=e*s-r*f,b=r*M-u*s,m=2*o;return s*=m,M*=m,f*=m,l*=2,v*=2,b*=2,t[0]=i+s+l,t[1]=c+M+v,t[2]=h+f+b,t},rotateX:function(t,n,a,r){var u=[],e=[];return u[0]=n[0]-a[0],u[1]=n[1]-a[1],u[2]=n[2]-a[2],e[0]=u[0],e[1]=u[1]*Math.cos(r)-u[2]*Math.sin(r),e[2]=u[1]*Math.sin(r)+u[2]*Math.cos(r),t[0]=e[0]+a[0],t[1]=e[1]+a[1],t[2]=e[2]+a[2],t},rotateY:function(t,n,a,r){var u=[],e=[];return u[0]=n[0]-a[0],u[1]=n[1]-a[1],u[2]=n[2]-a[2],e[0]=u[2]*Math.sin(r)+u[0]*Math.cos(r),e[1]=u[1],e[2]=u[2]*Math.cos(r)-u[0]*Math.sin(r),t[0]=e[0]+a[0],t[1]=e[1]+a[1],t[2]=e[2]+a[2],t},rotateZ:function(t,n,a,r){var u=[],e=[];return u[0]=n[0]-a[0],u[1]=n[1]-a[1],u[2]=n[2]-a[2],e[0]=u[0]*Math.cos(r)-u[1]*Math.sin(r),e[1]=u[0]*Math.sin(r)+u[1]*Math.cos(r),e[2]=u[2],t[0]=e[0]+a[0],t[1]=e[1]+a[1],t[2]=e[2]+a[2],t},angle:function(t,n){var a=D(t[0],t[1],t[2]),r=D(n[0],n[1],n[2]);Z(a,a),Z(r,r);var u=_(a,r);return u>1?0:u<-1?Math.PI:Math.acos(u)},zero:function(t){return t[0]=0,t[1]=0,t[2]=0,t},str:function(t){return"vec3("+t[0]+", "+t[1]+", "+t[2]+")"},exactEquals:function(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]},equals:function(t,a){var r=t[0],u=t[1],e=t[2],o=a[0],i=a[1],c=a[2];return Math.abs(r-o)<=n*Math.max(1,Math.abs(r),Math.abs(o))&&Math.abs(u-i)<=n*Math.max(1,Math.abs(u),Math.abs(i))&&Math.abs(e-c)<=n*Math.max(1,Math.abs(e),Math.abs(c))},sub:k,mul:U,div:W,dist:C,sqrDist:G,len:H,sqrLen:J,forEach:K});function tt(){var t=new a(4);return a!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0,t[3]=0),t}function nt(t){var n=new a(4);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n}function at(t,n,r,u){var e=new a(4);return e[0]=t,e[1]=n,e[2]=r,e[3]=u,e}function rt(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t}function ut(t,n,a,r,u){return t[0]=n,t[1]=a,t[2]=r,t[3]=u,t}function et(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t[2]=n[2]+a[2],t[3]=n[3]+a[3],t}function ot(t,n,a){return t[0]=n[0]-a[0],t[1]=n[1]-a[1],t[2]=n[2]-a[2],t[3]=n[3]-a[3],t}function it(t,n,a){return t[0]=n[0]*a[0],t[1]=n[1]*a[1],t[2]=n[2]*a[2],t[3]=n[3]*a[3],t}function ct(t,n,a){return t[0]=n[0]/a[0],t[1]=n[1]/a[1],t[2]=n[2]/a[2],t[3]=n[3]/a[3],t}function ht(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a,t[3]=n[3]*a,t}function st(t,n){var a=n[0]-t[0],r=n[1]-t[1],u=n[2]-t[2],e=n[3]-t[3];return Math.hypot(a,r,u,e)}function Mt(t,n){var a=n[0]-t[0],r=n[1]-t[1],u=n[2]-t[2],e=n[3]-t[3];return a*a+r*r+u*u+e*e}function ft(t){var n=t[0],a=t[1],r=t[2],u=t[3];return Math.hypot(n,a,r,u)}function lt(t){var n=t[0],a=t[1],r=t[2],u=t[3];return n*n+a*a+r*r+u*u}function vt(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=a*a+r*r+u*u+e*e;return o>0&&(o=1/Math.sqrt(o)),t[0]=a*o,t[1]=r*o,t[2]=u*o,t[3]=e*o,t}function bt(t,n){return t[0]*n[0]+t[1]*n[1]+t[2]*n[2]+t[3]*n[3]}function mt(t,n,a,r){var u=n[0],e=n[1],o=n[2],i=n[3];return t[0]=u+r*(a[0]-u),t[1]=e+r*(a[1]-e),t[2]=o+r*(a[2]-o),t[3]=i+r*(a[3]-i),t}function dt(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]&&t[3]===n[3]}function xt(t,a){var r=t[0],u=t[1],e=t[2],o=t[3],i=a[0],c=a[1],h=a[2],s=a[3];return Math.abs(r-i)<=n*Math.max(1,Math.abs(r),Math.abs(i))&&Math.abs(u-c)<=n*Math.max(1,Math.abs(u),Math.abs(c))&&Math.abs(e-h)<=n*Math.max(1,Math.abs(e),Math.abs(h))&&Math.abs(o-s)<=n*Math.max(1,Math.abs(o),Math.abs(s))}var pt=ot,yt=it,qt=ct,gt=st,At=Mt,wt=ft,Rt=lt,zt=function(){var t=tt();return function(n,a,r,u,e,o){var i,c;for(a||(a=4),r||(r=0),c=u?Math.min(u*a+r,n.length):n.length,i=r;i<c;i+=a)t[0]=n[i],t[1]=n[i+1],t[2]=n[i+2],t[3]=n[i+3],e(t,t,o),n[i]=t[0],n[i+1]=t[1],n[i+2]=t[2],n[i+3]=t[3];return n}}(),Pt=Object.freeze({create:tt,clone:nt,fromValues:at,copy:rt,set:ut,add:et,subtract:ot,multiply:it,divide:ct,ceil:function(t,n){return t[0]=Math.ceil(n[0]),t[1]=Math.ceil(n[1]),t[2]=Math.ceil(n[2]),t[3]=Math.ceil(n[3]),t},floor:function(t,n){return t[0]=Math.floor(n[0]),t[1]=Math.floor(n[1]),t[2]=Math.floor(n[2]),t[3]=Math.floor(n[3]),t},min:function(t,n,a){return t[0]=Math.min(n[0],a[0]),t[1]=Math.min(n[1],a[1]),t[2]=Math.min(n[2],a[2]),t[3]=Math.min(n[3],a[3]),t},max:function(t,n,a){return t[0]=Math.max(n[0],a[0]),t[1]=Math.max(n[1],a[1]),t[2]=Math.max(n[2],a[2]),t[3]=Math.max(n[3],a[3]),t},round:function(t,n){return t[0]=Math.round(n[0]),t[1]=Math.round(n[1]),t[2]=Math.round(n[2]),t[3]=Math.round(n[3]),t},scale:ht,scaleAndAdd:function(t,n,a,r){return t[0]=n[0]+a[0]*r,t[1]=n[1]+a[1]*r,t[2]=n[2]+a[2]*r,t[3]=n[3]+a[3]*r,t},distance:st,squaredDistance:Mt,length:ft,squaredLength:lt,negate:function(t,n){return t[0]=-n[0],t[1]=-n[1],t[2]=-n[2],t[3]=-n[3],t},inverse:function(t,n){return t[0]=1/n[0],t[1]=1/n[1],t[2]=1/n[2],t[3]=1/n[3],t},normalize:vt,dot:bt,cross:function(t,n,a,r){var u=a[0]*r[1]-a[1]*r[0],e=a[0]*r[2]-a[2]*r[0],o=a[0]*r[3]-a[3]*r[0],i=a[1]*r[2]-a[2]*r[1],c=a[1]*r[3]-a[3]*r[1],h=a[2]*r[3]-a[3]*r[2],s=n[0],M=n[1],f=n[2],l=n[3];return t[0]=M*h-f*c+l*i,t[1]=-s*h+f*o-l*e,t[2]=s*c-M*o+l*u,t[3]=-s*i+M*e-f*u,t},lerp:mt,random:function(t,n){var a,u,e,o,i,c;n=n||1;do{i=(a=2*r()-1)*a+(u=2*r()-1)*u}while(i>=1);do{c=(e=2*r()-1)*e+(o=2*r()-1)*o}while(c>=1);var h=Math.sqrt((1-i)/c);return t[0]=n*a,t[1]=n*u,t[2]=n*e*h,t[3]=n*o*h,t},transformMat4:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3];return t[0]=a[0]*r+a[4]*u+a[8]*e+a[12]*o,t[1]=a[1]*r+a[5]*u+a[9]*e+a[13]*o,t[2]=a[2]*r+a[6]*u+a[10]*e+a[14]*o,t[3]=a[3]*r+a[7]*u+a[11]*e+a[15]*o,t},transformQuat:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=a[0],i=a[1],c=a[2],h=a[3],s=h*r+i*e-c*u,M=h*u+c*r-o*e,f=h*e+o*u-i*r,l=-o*r-i*u-c*e;return t[0]=s*h+l*-o+M*-c-f*-i,t[1]=M*h+l*-i+f*-o-s*-c,t[2]=f*h+l*-c+s*-i-M*-o,t[3]=n[3],t},zero:function(t){return t[0]=0,t[1]=0,t[2]=0,t[3]=0,t},str:function(t){return"vec4("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+")"},exactEquals:dt,equals:xt,sub:pt,mul:yt,div:qt,dist:gt,sqrDist:At,len:wt,sqrLen:Rt,forEach:zt});function jt(){var t=new a(4);return a!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t[3]=1,t}function It(t,n,a){a*=.5;var r=Math.sin(a);return t[0]=r*n[0],t[1]=r*n[1],t[2]=r*n[2],t[3]=Math.cos(a),t}function St(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=a[0],c=a[1],h=a[2],s=a[3];return t[0]=r*s+o*i+u*h-e*c,t[1]=u*s+o*c+e*i-r*h,t[2]=e*s+o*h+r*c-u*i,t[3]=o*s-r*i-u*c-e*h,t}function Et(t,n,a){a*=.5;var r=n[0],u=n[1],e=n[2],o=n[3],i=Math.sin(a),c=Math.cos(a);return t[0]=r*c+o*i,t[1]=u*c+e*i,t[2]=e*c-u*i,t[3]=o*c-r*i,t}function Ot(t,n,a){a*=.5;var r=n[0],u=n[1],e=n[2],o=n[3],i=Math.sin(a),c=Math.cos(a);return t[0]=r*c-e*i,t[1]=u*c+o*i,t[2]=e*c+r*i,t[3]=o*c-u*i,t}function Tt(t,n,a){a*=.5;var r=n[0],u=n[1],e=n[2],o=n[3],i=Math.sin(a),c=Math.cos(a);return t[0]=r*c+u*i,t[1]=u*c-r*i,t[2]=e*c+o*i,t[3]=o*c-e*i,t}function Dt(t,a,r,u){var e,o,i,c,h,s=a[0],M=a[1],f=a[2],l=a[3],v=r[0],b=r[1],m=r[2],d=r[3];return(o=s*v+M*b+f*m+l*d)<0&&(o=-o,v=-v,b=-b,m=-m,d=-d),1-o>n?(e=Math.acos(o),i=Math.sin(e),c=Math.sin((1-u)*e)/i,h=Math.sin(u*e)/i):(c=1-u,h=u),t[0]=c*s+h*v,t[1]=c*M+h*b,t[2]=c*f+h*m,t[3]=c*l+h*d,t}function Ft(t,n){var a,r=n[0]+n[4]+n[8];if(r>0)a=Math.sqrt(r+1),t[3]=.5*a,a=.5/a,t[0]=(n[5]-n[7])*a,t[1]=(n[6]-n[2])*a,t[2]=(n[1]-n[3])*a;else{var u=0;n[4]>n[0]&&(u=1),n[8]>n[3*u+u]&&(u=2);var e=(u+1)%3,o=(u+2)%3;a=Math.sqrt(n[3*u+u]-n[3*e+e]-n[3*o+o]+1),t[u]=.5*a,a=.5/a,t[3]=(n[3*e+o]-n[3*o+e])*a,t[e]=(n[3*e+u]+n[3*u+e])*a,t[o]=(n[3*o+u]+n[3*u+o])*a}return t}var Lt,Vt,Qt,Yt,Xt,Zt,_t=nt,Bt=at,Nt=rt,kt=ut,Ut=et,Wt=St,Ct=ht,Gt=bt,Ht=mt,Jt=ft,Kt=Jt,$t=lt,tn=$t,nn=vt,an=dt,rn=xt,un=(Lt=O(),Vt=D(1,0,0),Qt=D(0,1,0),function(t,n,a){var r=_(n,a);return r<-.999999?(B(Lt,Vt,n),H(Lt)<1e-6&&B(Lt,Qt,n),Z(Lt,Lt),It(t,Lt,Math.PI),t):r>.999999?(t[0]=0,t[1]=0,t[2]=0,t[3]=1,t):(B(Lt,n,a),t[0]=Lt[0],t[1]=Lt[1],t[2]=Lt[2],t[3]=1+r,nn(t,t))}),en=(Yt=jt(),Xt=jt(),function(t,n,a,r,u,e){return Dt(Yt,n,u,e),Dt(Xt,a,r,e),Dt(t,Yt,Xt,2*e*(1-e)),t}),on=(Zt=m(),function(t,n,a,r){return Zt[0]=a[0],Zt[3]=a[1],Zt[6]=a[2],Zt[1]=r[0],Zt[4]=r[1],Zt[7]=r[2],Zt[2]=-n[0],Zt[5]=-n[1],Zt[8]=-n[2],nn(t,Ft(t,Zt))}),cn=Object.freeze({create:jt,identity:function(t){return t[0]=0,t[1]=0,t[2]=0,t[3]=1,t},setAxisAngle:It,getAxisAngle:function(t,a){var r=2*Math.acos(a[3]),u=Math.sin(r/2);return u>n?(t[0]=a[0]/u,t[1]=a[1]/u,t[2]=a[2]/u):(t[0]=1,t[1]=0,t[2]=0),r},multiply:St,rotateX:Et,rotateY:Ot,rotateZ:Tt,calculateW:function(t,n){var a=n[0],r=n[1],u=n[2];return t[0]=a,t[1]=r,t[2]=u,t[3]=Math.sqrt(Math.abs(1-a*a-r*r-u*u)),t},slerp:Dt,random:function(t){var n=r(),a=r(),u=r(),e=Math.sqrt(1-n),o=Math.sqrt(n);return t[0]=e*Math.sin(2*Math.PI*a),t[1]=e*Math.cos(2*Math.PI*a),t[2]=o*Math.sin(2*Math.PI*u),t[3]=o*Math.cos(2*Math.PI*u),t},invert:function(t,n){var a=n[0],r=n[1],u=n[2],e=n[3],o=a*a+r*r+u*u+e*e,i=o?1/o:0;return t[0]=-a*i,t[1]=-r*i,t[2]=-u*i,t[3]=e*i,t},conjugate:function(t,n){return t[0]=-n[0],t[1]=-n[1],t[2]=-n[2],t[3]=n[3],t},fromMat3:Ft,fromEuler:function(t,n,a,r){var u=.5*Math.PI/180;n*=u,a*=u,r*=u;var e=Math.sin(n),o=Math.cos(n),i=Math.sin(a),c=Math.cos(a),h=Math.sin(r),s=Math.cos(r);return t[0]=e*c*s-o*i*h,t[1]=o*i*s+e*c*h,t[2]=o*c*h-e*i*s,t[3]=o*c*s+e*i*h,t},str:function(t){return"quat("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+")"},clone:_t,fromValues:Bt,copy:Nt,set:kt,add:Ut,mul:Wt,scale:Ct,dot:Gt,lerp:Ht,length:Jt,len:Kt,squaredLength:$t,sqrLen:tn,normalize:nn,exactEquals:an,equals:rn,rotationTo:un,sqlerp:en,setAxes:on});function hn(t,n,a){var r=.5*a[0],u=.5*a[1],e=.5*a[2],o=n[0],i=n[1],c=n[2],h=n[3];return t[0]=o,t[1]=i,t[2]=c,t[3]=h,t[4]=r*h+u*c-e*i,t[5]=u*h+e*o-r*c,t[6]=e*h+r*i-u*o,t[7]=-r*o-u*i-e*c,t}function sn(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t}var Mn=Nt;var fn=Nt;function ln(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=a[4],c=a[5],h=a[6],s=a[7],M=n[4],f=n[5],l=n[6],v=n[7],b=a[0],m=a[1],d=a[2],x=a[3];return t[0]=r*x+o*b+u*d-e*m,t[1]=u*x+o*m+e*b-r*d,t[2]=e*x+o*d+r*m-u*b,t[3]=o*x-r*b-u*m-e*d,t[4]=r*s+o*i+u*h-e*c+M*x+v*b+f*d-l*m,t[5]=u*s+o*c+e*i-r*h+f*x+v*m+l*b-M*d,t[6]=e*s+o*h+r*c-u*i+l*x+v*d+M*m-f*b,t[7]=o*s-r*i-u*c-e*h+v*x-M*b-f*m-l*d,t}var vn=ln;var bn=Gt;var mn=Jt,dn=mn,xn=$t,pn=xn;var yn=Object.freeze({create:function(){var t=new a(8);return a!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0,t[4]=0,t[5]=0,t[6]=0,t[7]=0),t[3]=1,t},clone:function(t){var n=new a(8);return n[0]=t[0],n[1]=t[1],n[2]=t[2],n[3]=t[3],n[4]=t[4],n[5]=t[5],n[6]=t[6],n[7]=t[7],n},fromValues:function(t,n,r,u,e,o,i,c){var h=new a(8);return h[0]=t,h[1]=n,h[2]=r,h[3]=u,h[4]=e,h[5]=o,h[6]=i,h[7]=c,h},fromRotationTranslationValues:function(t,n,r,u,e,o,i){var c=new a(8);c[0]=t,c[1]=n,c[2]=r,c[3]=u;var h=.5*e,s=.5*o,M=.5*i;return c[4]=h*u+s*r-M*n,c[5]=s*u+M*t-h*r,c[6]=M*u+h*n-s*t,c[7]=-h*t-s*n-M*r,c},fromRotationTranslation:hn,fromTranslation:function(t,n){return t[0]=0,t[1]=0,t[2]=0,t[3]=1,t[4]=.5*n[0],t[5]=.5*n[1],t[6]=.5*n[2],t[7]=0,t},fromRotation:function(t,n){return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=0,t[5]=0,t[6]=0,t[7]=0,t},fromMat4:function(t,n){var r=jt();P(r,n);var u=new a(3);return R(u,n),hn(t,r,u),t},copy:sn,identity:function(t){return t[0]=0,t[1]=0,t[2]=0,t[3]=1,t[4]=0,t[5]=0,t[6]=0,t[7]=0,t},set:function(t,n,a,r,u,e,o,i,c){return t[0]=n,t[1]=a,t[2]=r,t[3]=u,t[4]=e,t[5]=o,t[6]=i,t[7]=c,t},getReal:Mn,getDual:function(t,n){return t[0]=n[4],t[1]=n[5],t[2]=n[6],t[3]=n[7],t},setReal:fn,setDual:function(t,n){return t[4]=n[0],t[5]=n[1],t[6]=n[2],t[7]=n[3],t},getTranslation:function(t,n){var a=n[4],r=n[5],u=n[6],e=n[7],o=-n[0],i=-n[1],c=-n[2],h=n[3];return t[0]=2*(a*h+e*o+r*c-u*i),t[1]=2*(r*h+e*i+u*o-a*c),t[2]=2*(u*h+e*c+a*i-r*o),t},translate:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=.5*a[0],c=.5*a[1],h=.5*a[2],s=n[4],M=n[5],f=n[6],l=n[7];return t[0]=r,t[1]=u,t[2]=e,t[3]=o,t[4]=o*i+u*h-e*c+s,t[5]=o*c+e*i-r*h+M,t[6]=o*h+r*c-u*i+f,t[7]=-r*i-u*c-e*h+l,t},rotateX:function(t,n,a){var r=-n[0],u=-n[1],e=-n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=i*o+s*r+c*e-h*u,f=c*o+s*u+h*r-i*e,l=h*o+s*e+i*u-c*r,v=s*o-i*r-c*u-h*e;return Et(t,n,a),r=t[0],u=t[1],e=t[2],o=t[3],t[4]=M*o+v*r+f*e-l*u,t[5]=f*o+v*u+l*r-M*e,t[6]=l*o+v*e+M*u-f*r,t[7]=v*o-M*r-f*u-l*e,t},rotateY:function(t,n,a){var r=-n[0],u=-n[1],e=-n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=i*o+s*r+c*e-h*u,f=c*o+s*u+h*r-i*e,l=h*o+s*e+i*u-c*r,v=s*o-i*r-c*u-h*e;return Ot(t,n,a),r=t[0],u=t[1],e=t[2],o=t[3],t[4]=M*o+v*r+f*e-l*u,t[5]=f*o+v*u+l*r-M*e,t[6]=l*o+v*e+M*u-f*r,t[7]=v*o-M*r-f*u-l*e,t},rotateZ:function(t,n,a){var r=-n[0],u=-n[1],e=-n[2],o=n[3],i=n[4],c=n[5],h=n[6],s=n[7],M=i*o+s*r+c*e-h*u,f=c*o+s*u+h*r-i*e,l=h*o+s*e+i*u-c*r,v=s*o-i*r-c*u-h*e;return Tt(t,n,a),r=t[0],u=t[1],e=t[2],o=t[3],t[4]=M*o+v*r+f*e-l*u,t[5]=f*o+v*u+l*r-M*e,t[6]=l*o+v*e+M*u-f*r,t[7]=v*o-M*r-f*u-l*e,t},rotateByQuatAppend:function(t,n,a){var r=a[0],u=a[1],e=a[2],o=a[3],i=n[0],c=n[1],h=n[2],s=n[3];return t[0]=i*o+s*r+c*e-h*u,t[1]=c*o+s*u+h*r-i*e,t[2]=h*o+s*e+i*u-c*r,t[3]=s*o-i*r-c*u-h*e,i=n[4],c=n[5],h=n[6],s=n[7],t[4]=i*o+s*r+c*e-h*u,t[5]=c*o+s*u+h*r-i*e,t[6]=h*o+s*e+i*u-c*r,t[7]=s*o-i*r-c*u-h*e,t},rotateByQuatPrepend:function(t,n,a){var r=n[0],u=n[1],e=n[2],o=n[3],i=a[0],c=a[1],h=a[2],s=a[3];return t[0]=r*s+o*i+u*h-e*c,t[1]=u*s+o*c+e*i-r*h,t[2]=e*s+o*h+r*c-u*i,t[3]=o*s-r*i-u*c-e*h,i=a[4],c=a[5],h=a[6],s=a[7],t[4]=r*s+o*i+u*h-e*c,t[5]=u*s+o*c+e*i-r*h,t[6]=e*s+o*h+r*c-u*i,t[7]=o*s-r*i-u*c-e*h,t},rotateAroundAxis:function(t,a,r,u){if(Math.abs(u)<n)return sn(t,a);var e=Math.hypot(r[0],r[1],r[2]);u*=.5;var o=Math.sin(u),i=o*r[0]/e,c=o*r[1]/e,h=o*r[2]/e,s=Math.cos(u),M=a[0],f=a[1],l=a[2],v=a[3];t[0]=M*s+v*i+f*h-l*c,t[1]=f*s+v*c+l*i-M*h,t[2]=l*s+v*h+M*c-f*i,t[3]=v*s-M*i-f*c-l*h;var b=a[4],m=a[5],d=a[6],x=a[7];return t[4]=b*s+x*i+m*h-d*c,t[5]=m*s+x*c+d*i-b*h,t[6]=d*s+x*h+b*c-m*i,t[7]=x*s-b*i-m*c-d*h,t},add:function(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t[2]=n[2]+a[2],t[3]=n[3]+a[3],t[4]=n[4]+a[4],t[5]=n[5]+a[5],t[6]=n[6]+a[6],t[7]=n[7]+a[7],t},multiply:ln,mul:vn,scale:function(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t[2]=n[2]*a,t[3]=n[3]*a,t[4]=n[4]*a,t[5]=n[5]*a,t[6]=n[6]*a,t[7]=n[7]*a,t},dot:bn,lerp:function(t,n,a,r){var u=1-r;return bn(n,a)<0&&(r=-r),t[0]=n[0]*u+a[0]*r,t[1]=n[1]*u+a[1]*r,t[2]=n[2]*u+a[2]*r,t[3]=n[3]*u+a[3]*r,t[4]=n[4]*u+a[4]*r,t[5]=n[5]*u+a[5]*r,t[6]=n[6]*u+a[6]*r,t[7]=n[7]*u+a[7]*r,t},invert:function(t,n){var a=xn(n);return t[0]=-n[0]/a,t[1]=-n[1]/a,t[2]=-n[2]/a,t[3]=n[3]/a,t[4]=-n[4]/a,t[5]=-n[5]/a,t[6]=-n[6]/a,t[7]=n[7]/a,t},conjugate:function(t,n){return t[0]=-n[0],t[1]=-n[1],t[2]=-n[2],t[3]=n[3],t[4]=-n[4],t[5]=-n[5],t[6]=-n[6],t[7]=n[7],t},length:mn,len:dn,squaredLength:xn,sqrLen:pn,normalize:function(t,n){var a=xn(n);if(a>0){a=Math.sqrt(a);var r=n[0]/a,u=n[1]/a,e=n[2]/a,o=n[3]/a,i=n[4],c=n[5],h=n[6],s=n[7],M=r*i+u*c+e*h+o*s;t[0]=r,t[1]=u,t[2]=e,t[3]=o,t[4]=(i-r*M)/a,t[5]=(c-u*M)/a,t[6]=(h-e*M)/a,t[7]=(s-o*M)/a}return t},str:function(t){return"quat2("+t[0]+", "+t[1]+", "+t[2]+", "+t[3]+", "+t[4]+", "+t[5]+", "+t[6]+", "+t[7]+")"},exactEquals:function(t,n){return t[0]===n[0]&&t[1]===n[1]&&t[2]===n[2]&&t[3]===n[3]&&t[4]===n[4]&&t[5]===n[5]&&t[6]===n[6]&&t[7]===n[7]},equals:function(t,a){var r=t[0],u=t[1],e=t[2],o=t[3],i=t[4],c=t[5],h=t[6],s=t[7],M=a[0],f=a[1],l=a[2],v=a[3],b=a[4],m=a[5],d=a[6],x=a[7];return Math.abs(r-M)<=n*Math.max(1,Math.abs(r),Math.abs(M))&&Math.abs(u-f)<=n*Math.max(1,Math.abs(u),Math.abs(f))&&Math.abs(e-l)<=n*Math.max(1,Math.abs(e),Math.abs(l))&&Math.abs(o-v)<=n*Math.max(1,Math.abs(o),Math.abs(v))&&Math.abs(i-b)<=n*Math.max(1,Math.abs(i),Math.abs(b))&&Math.abs(c-m)<=n*Math.max(1,Math.abs(c),Math.abs(m))&&Math.abs(h-d)<=n*Math.max(1,Math.abs(h),Math.abs(d))&&Math.abs(s-x)<=n*Math.max(1,Math.abs(s),Math.abs(x))}});function qn(){var t=new a(2);return a!=Float32Array&&(t[0]=0,t[1]=0),t}function gn(t,n,a){return t[0]=n[0]-a[0],t[1]=n[1]-a[1],t}function An(t,n,a){return t[0]=n[0]*a[0],t[1]=n[1]*a[1],t}function wn(t,n,a){return t[0]=n[0]/a[0],t[1]=n[1]/a[1],t}function Rn(t,n){var a=n[0]-t[0],r=n[1]-t[1];return Math.hypot(a,r)}function zn(t,n){var a=n[0]-t[0],r=n[1]-t[1];return a*a+r*r}function Pn(t){var n=t[0],a=t[1];return Math.hypot(n,a)}function jn(t){var n=t[0],a=t[1];return n*n+a*a}var In=Pn,Sn=gn,En=An,On=wn,Tn=Rn,Dn=zn,Fn=jn,Ln=function(){var t=qn();return function(n,a,r,u,e,o){var i,c;for(a||(a=2),r||(r=0),c=u?Math.min(u*a+r,n.length):n.length,i=r;i<c;i+=a)t[0]=n[i],t[1]=n[i+1],e(t,t,o),n[i]=t[0],n[i+1]=t[1];return n}}(),Vn=Object.freeze({create:qn,clone:function(t){var n=new a(2);return n[0]=t[0],n[1]=t[1],n},fromValues:function(t,n){var r=new a(2);return r[0]=t,r[1]=n,r},copy:function(t,n){return t[0]=n[0],t[1]=n[1],t},set:function(t,n,a){return t[0]=n,t[1]=a,t},add:function(t,n,a){return t[0]=n[0]+a[0],t[1]=n[1]+a[1],t},subtract:gn,multiply:An,divide:wn,ceil:function(t,n){return t[0]=Math.ceil(n[0]),t[1]=Math.ceil(n[1]),t},floor:function(t,n){return t[0]=Math.floor(n[0]),t[1]=Math.floor(n[1]),t},min:function(t,n,a){return t[0]=Math.min(n[0],a[0]),t[1]=Math.min(n[1],a[1]),t},max:function(t,n,a){return t[0]=Math.max(n[0],a[0]),t[1]=Math.max(n[1],a[1]),t},round:function(t,n){return t[0]=Math.round(n[0]),t[1]=Math.round(n[1]),t},scale:function(t,n,a){return t[0]=n[0]*a,t[1]=n[1]*a,t},scaleAndAdd:function(t,n,a,r){return t[0]=n[0]+a[0]*r,t[1]=n[1]+a[1]*r,t},distance:Rn,squaredDistance:zn,length:Pn,squaredLength:jn,negate:function(t,n){return t[0]=-n[0],t[1]=-n[1],t},inverse:function(t,n){return t[0]=1/n[0],t[1]=1/n[1],t},normalize:function(t,n){var a=n[0],r=n[1],u=a*a+r*r;return u>0&&(u=1/Math.sqrt(u)),t[0]=n[0]*u,t[1]=n[1]*u,t},dot:function(t,n){return t[0]*n[0]+t[1]*n[1]},cross:function(t,n,a){var r=n[0]*a[1]-n[1]*a[0];return t[0]=t[1]=0,t[2]=r,t},lerp:function(t,n,a,r){var u=n[0],e=n[1];return t[0]=u+r*(a[0]-u),t[1]=e+r*(a[1]-e),t},random:function(t,n){n=n||1;var a=2*r()*Math.PI;return t[0]=Math.cos(a)*n,t[1]=Math.sin(a)*n,t},transformMat2:function(t,n,a){var r=n[0],u=n[1];return t[0]=a[0]*r+a[2]*u,t[1]=a[1]*r+a[3]*u,t},transformMat2d:function(t,n,a){var r=n[0],u=n[1];return t[0]=a[0]*r+a[2]*u+a[4],t[1]=a[1]*r+a[3]*u+a[5],t},transformMat3:function(t,n,a){var r=n[0],u=n[1];return t[0]=a[0]*r+a[3]*u+a[6],t[1]=a[1]*r+a[4]*u+a[7],t},transformMat4:function(t,n,a){var r=n[0],u=n[1];return t[0]=a[0]*r+a[4]*u+a[12],t[1]=a[1]*r+a[5]*u+a[13],t},rotate:function(t,n,a,r){var u=n[0]-a[0],e=n[1]-a[1],o=Math.sin(r),i=Math.cos(r);return t[0]=u*i-e*o+a[0],t[1]=u*o+e*i+a[1],t},angle:function(t,n){var a=t[0],r=t[1],u=n[0],e=n[1],o=a*a+r*r;o>0&&(o=1/Math.sqrt(o));var i=u*u+e*e;i>0&&(i=1/Math.sqrt(i));var c=(a*u+r*e)*o*i;return c>1?0:c<-1?Math.PI:Math.acos(c)},zero:function(t){return t[0]=0,t[1]=0,t},str:function(t){return"vec2("+t[0]+", "+t[1]+")"},exactEquals:function(t,n){return t[0]===n[0]&&t[1]===n[1]},equals:function(t,a){var r=t[0],u=t[1],e=a[0],o=a[1];return Math.abs(r-e)<=n*Math.max(1,Math.abs(r),Math.abs(e))&&Math.abs(u-o)<=n*Math.max(1,Math.abs(u),Math.abs(o))},len:In,sub:Sn,mul:En,div:On,dist:Tn,sqrDist:Dn,sqrLen:Fn,forEach:Ln});t.glMatrix=e,t.mat2=s,t.mat2d=b,t.mat3=q,t.mat4=E,t.quat=cn,t.quat2=yn,t.vec2=Vn,t.vec3=$,t.vec4=Pt,Object.defineProperty(t,"__esModule",{value:!0})});


//
// Mesh Simplification Unit
// (C) by Sven Forstmann in 2014
// License : MIT (http://opensource.org/licenses/MIT)
// https://github.com/sp4cerat/Fast-Quadric-Mesh-Simplification
// http://www.gamedev.net/topic/656486-high-speed-quadric-mesh-simplification-without-problems-resolved/
// http://voxels.blogspot.com/2014/05/quadric-mesh-simplification-with-source.html
// https://github.com/neurolabusc/Fast-Quadric-Mesh-Simplification-Pascal-
//

// JS Port by Joshua Koo in 2016
// https://github.com/zz85 @blurspline

// https://github.com/neurolabusc/Fast-Quadric-Mesh-Simplification-Pascal-/blob/master/meshify_simplify_quadric.pas

SimplifyModifier = function SimplifyModifier() {

}

SimplifyModifier.modify =

(function() {
	function SymetricMatrix() {
		// init
		this.m = new Array(10).fill(0);
	}


	SymetricMatrix.prototype = {
		set: function set(
			m11, m12, m13, m14,
			m22, m23, m24,
			m33, m34,
			m44 ) {

			this.m[0] = m11;
			this.m[1] = m12;
			this.m[2] = m13;
			this.m[3] = m14;

			this.m[4] = m22;
			this.m[5] = m23;
			this.m[6] = m24;

			this.m[7] = m33;
			this.m[8] = m34;

			this.m[9] = m44;
			return this;
		},

		makePlane: function makePlane( a, b, c, d ) {
			return this.set(
				a * a, a * b, a * c, a * d,
				       b * b, b * c, b * d,
				              c * c, c * d,
				                     d * d
			);
		},

		det: function determinant(
				a11, a12, a13,
				a21, a22, a23,
				a31, a32, a33
			) {
			var det = this.m[ a11 ] * this.m[ a22 ] * this.m[ a33 ]
	 			+ this.m[ a13 ] * this.m[ a21 ] * this.m[ a32 ]
				+ this.m[ a12 ] * this.m[ a23 ] * this.m[ a31 ]
	 			- this.m[ a13 ] * this.m[ a22 ] * this.m[ a31 ]
				- this.m[ a11 ] * this.m[ a23 ] * this.m[ a32 ]
	 			- this.m[ a12 ] * this.m[ a21 ] * this.m[ a33 ];
	 		return det;
		},

		// produces new Matrix
		add: function add( n ) {
			return new SymetricMatrix().set(
				this.m[0] + n.m[0],
				this.m[1] + n.m[1],
				this.m[2] + n.m[2],
				this.m[3] + n.m[3],

				this.m[4] + n.m[4],
				this.m[5] + n.m[5],
				this.m[6] + n.m[6],

				this.m[7] + n.m[7],
				this.m[8] + n.m[8],

				this.m[9] + n.m[9]
			);
		},

		addSelf: function addSelf( n ) {
			this.m[0]+=n.m[0];   this.m[1]+=n.m[1];   this.m[2]+=n.m[2];   this.m[3]+=n.m[3];
			this.m[4]+=n.m[4];   this.m[5]+=n.m[5];   this.m[6]+=n.m[6];   this.m[7]+=n.m[7];
			this.m[8]+=n.m[8];   this.m[9]+=n.m[9]
		}
	};

	/* Model Objects */

	function Triangle() {
		this.v = new Array(3); // indices for array
		this.err = new Array(4); // errors
		this.deleted = false;
		this.dirty = false;
		this.n = glMatrix.vec3.create(); // Normal
	}

	// function Vector3(x, y, z) {
	// 	this[0] = x;
	// 	this[1] = y;
	// 	this[2] = z;
	// };

	function Vertex(vector) {
		this.p = glMatrix.vec3.fromValues(vector[0],vector[1],vector[2]);
		this.tstart = -1;
		this.tcount = -1;
		this.q = new SymetricMatrix();
		this.border = false;
	}

	function Ref() {
		// this.tid = -1;
		// this.tvertex = -1;
	}


	function init(origVertices, origFaces) {
			
		/*vertices = origVertices.map(
			v => {
				var vert = new Vertex(v);
				return vert;
			}
		);*/
		
		vertices = [];
		for(var i=0; i<origVertices.length; i+=3){
			var vert = new Vertex([origVertices[i],origVertices[i+1],origVertices[i+2]]);
			vertices.push(vert);
		}

		trianges = [];
		
		for(var i=0; i<origFaces.length; i+=3){
			var tri = new Triangle();
			tri.v[0] = origFaces[i];
			tri.v[1] = origFaces[i+1];
			tri.v[2] = origFaces[i+2];
			triangles.push(tri);
		}
		
		/*
		triangles = origFaces.map( f => {
			var tri = new Triangle();
			tri.v[0] = f[0];
			tri.v[1] = f[1];
			tri.v[2] = f[2];
			return tri;
		});*/
	}

	var triangles = []; // Triangle
	var vertices = []; // Vertex
	var refs = []; // Ref

	function resize(array, count) {
		if (count < array.length) {
			return array.splice(count);
		}

		if (count > array.length) {
			// in JS, arrays need not be expanded
			// console.log('more');
		}
	}

	//
	// Main simplification function
	//
	// target_count  : target nr. of triangles
	// agressiveness : sharpness to increase the threshold.
	//                 5..8 are good numbers
	//                 more iterations yield higher quality
	//
	function simplify_mesh(target_count, agressiveness) {
		if (agressiveness === undefined) agressiveness = 7;

		// TODO normalize_mesh to max length 1?

		console.time('simplify_mesh');

		var i, il;

		// set all triangles to non deleted
		for ( i = 0, il = triangles.length; i < il; i++ ) {
			triangles[ i ].deleted = false;
		}


		console.timeEnd('simplify_mesh');

		// main iteration loop

		var deleted_triangles = 0;
		var deleted0 = [], deleted1 = []; // std::vector<int>
		var triangle_count = triangles.length;


		for (var iteration = 0; iteration < 100; iteration++ ) {
			console.log("iteration %d - triangles %d, tris\n",
				iteration, triangle_count - deleted_triangles, triangles.length);



			if ( triangle_count - deleted_triangles <= target_count ){
			console.log('BROKE',triangle_count,deleted_triangles,target_count);
				break;
			}
			// update mesh once in a while
			if( iteration % 5 === 0 ) {
				update_mesh(iteration);
			}

			// clear dirty flag
			for(var j = 0; j < triangles.length; j++) {
				triangles[ j ].dirty = false;
			}

			//
			// All triangles with edges below the threshold will be removed
			//
			// The following numbers works well for most models.
			// If it does not, try to adjust the 3 parameters
			//
			var threshold = 0.000000001 * Math.pow( iteration + 3, agressiveness );

			// remove vertices & mark deleted triangles
			for ( i = 0, il = triangles.length; i < il; i++ ) {
				var t = triangles[ i ];
				if ( t.err[3] > threshold ||
					t.deleted || t.dirty ) continue;

				for ( j = 0; j < 3; j ++ ) {

					if ( t.err[j] < threshold ) {

						var i0 = t.v[ j ];
						var v0 = vertices[ i0 ];

						var i1 = t.v[ (j + 1) % 3 ];
						var v1 = vertices[ i1 ];

						// Border check
						if (v0.border != v1.border) continue;

						// Compute vertex to collapse to
						var p = glMatrix.vec3.create();
						calculate_error( i0, i1, p );
						// console.log('Compute vertex to collapse to', p);

						resize(deleted0, v0.tcount); // normals temporarily
						resize(deleted1, v1.tcount); // normals temporarily

						// dont remove if flipped
						if( flipped( p, i0, i1, v0, v1, deleted0 ) ) continue;
						if( flipped( p, i1, i0, v1, v0, deleted1 ) ) continue;

						// not flipped, so remove edge
						// console.log('not flipped, remove edge');
						// console.log(v0.p, p);
						v0.p = p;
						// v0.q = v1.q + v0.q;
						v0.q.addSelf( v1.q );

						var tstart = refs.length;

						// CONTINUE

						deleted_triangles = update_triangles( i0, v0, deleted0, deleted_triangles );
						// console.log('deleted triangle v0', deleted_triangles);
						deleted_triangles = update_triangles( i0, v1, deleted1, deleted_triangles );
						// console.log('deleted triangle v1', deleted_triangles);

						var tcount = refs.length - tstart;

						if (tcount <= v0.tcount ) {
							// console.log('save ram?');
							// if(tcount)
							// 	move(refs, v0.tstart, tstart, tcount);
						}
						else
							// append
							v0.tstart = tstart;

						v0.tcount=tcount;
						break;

					}
				} // end for j

				// done?
				if (triangle_count - deleted_triangles
					<= target_count)
					break;
			}

		} // end iteration

		function move(refs, dest, source, count) {
			for (var i = 0; i < count; i++) {
				refs[dest + i] = refs[source + i];
			}
		}

		// clean up mesh
		compact_mesh();

		// ready
		console.timeEnd('simplify_mesh');

		// int timeEnd=timeGetTime();
		// printf("%s - %d/%d %d%% removed in %d ms\n",__FUNCTION__,
		// 	triangle_count-deleted_triangles,
		// 	triangle_count,deleted_triangles*100/triangle_count,
		// 	timeEnd-timeStart);

	}

	// Check if a triangle flips when this edge is removed

	var n = glMatrix.vec3.create();
	var d1 = glMatrix.vec3.create();
	var d2 = glMatrix.vec3.create();

	function /*bool*/ flipped(
		/* vec3f */ p,
		/*int*/ i0,
		/*int*/ i1,
		/*Vertex*/ v0,
		/*Vertex*/ v1, // not needed
		/*std::vector<int>*/ deleted)
	{
		// var bordercount = 0;
		for ( var k = 0; k < v0.tcount; k ++ ) {
			// Triangle &
			var t = triangles[refs[v0.tstart+k].tid];
			if (t.deleted) continue;

			var s = refs[v0.tstart + k].tvertex;
			var id1 = t.v[(s+1) % 3];
			var id2 = t.v[(s+2) % 3];

			if(id1==i1 || id2==i1) // delete ?
			{
				// bordercount++;
				deleted[k] = true;
				continue;
			}
			/* vec3f */
			glMatrix.vec3.subtract(d1,vertices[id1].p,p);
			glMatrix.vec3.subtract(d2,vertices[id2].p,p);
			glMatrix.vec3.normalize(d1,d1);
			glMatrix.vec3.normalize(d2,d2);
			
			// d1.subVectors( vertices[id1].p, p).normalize();
			// d2.subVectors( vertices[id2].p, p).normalize();
			// if(Math.abs(d1.dot(d2))>0.999) return true;
			
			if(Math.abs(glMatrix.vec3.dot(d1,d2))>0.999) return true;
			
			/*vec3f  n;*/
			
			glMatrix.vec3.cross(n,d1,d2);
			glMatrix.vec3.normalize(n,n);
			
			//n.crossVectors(d1,d2).normalize();
			deleted[k] = false;
			if(glMatrix.vec3.dot(n,t.n)<0.2) return true;
		}
		return false;
	}

	// Update triangle connections and edge error after a edge is collapsed

	function update_triangles(/*int*/ i0,
		/*Vertex &*/ v,
		/*std::vector<int> & */deleted,
		/*int &*/ deleted_triangles )
	{
		// console.log('update_triangles');
		// vec3f p;
		var p = glMatrix.vec3.create();
		for (var k = 0; k < v.tcount; k++)
		{
			var /*Ref &*/ r = refs[ v.tstart + k ];
			var /*Triangle &*/ t = triangles[ r.tid ];

			if( t.deleted ) continue;
			if( deleted[k] ) {
				t.deleted = true;
				deleted_triangles++;
				continue;
			}
			t.v[r.tvertex] = i0;
			t.dirty = true;

			t.err[0] = calculate_error( t.v[0], t.v[1], p );
			t.err[1] = calculate_error( t.v[1], t.v[2], p );
			t.err[2] = calculate_error( t.v[2], t.v[0], p );
			t.err[3] = Math.min( t.err[0], t.err[1], t.err[2] );
			refs.push( r );
		}
		return deleted_triangles;
	}

	// compact triangles, compute edge error and build reference list
	function update_mesh( iteration ) /*int*/
	{
		// console.log('update_mesh', iteration, triangles.length);
		if ( iteration > 0 ) {
			// compact triangles
			var dst = 0;
			for (var i = 0; i < triangles.length; i++) {
				var target = triangles[i];
				if(!target.deleted) {
					triangles[dst++] = target;
				}
			}

			console.log('not deleted dst', triangles.length, dst);
			triangles.splice( dst );

		}
		//
		// Init Quadrics by Plane & Edge Errors
		//
		// required at the beginning ( iteration == 0 )
		// recomputing during the simplification is not required,
		// but mostly improves the result for closed meshes
		//
		if( iteration === 0 ) {
			for (var i = 0; i < vertices.length; i++ ) {
				// may not need to do this.
				vertices[i].q = new SymetricMatrix();
			}

			for (var i = 0; i < triangles.length; i++) {
				var /*Triangle &*/ t = triangles[i];
				// var n, p[3]; /* vec3f */

				var n = glMatrix.vec3.create();

				var p = new Array(3);
				var p1p0 = glMatrix.vec3.create();
				var p2p0 = glMatrix.vec3.create();

				for (var j = 0; j < 3; j++) {
					p[j] = vertices[t.v[j]].p;
				}
				
				glMatrix.vec3.subtract(p1p0,p[1],p[0]);
				glMatrix.vec3.subtract(p2p0,p[2],p[0]);
				// p1p0.subVectors(p[1], p[0]);
				// p2p0.subVectors(p[2], p[0]);

				glMatrix.vec3.cross(n,p1p0,p2p0);
				glMatrix.vec3.normalize(n,n);
				
				//n.crossVectors(p1p0, p2p0).normalize();
				t.n = n;
				var tmp = new SymetricMatrix().makePlane(
						n[0],
						n[1],
						n[2],
						-glMatrix.vec3.dot(n,p[0]))
						//-n.dot(p[0]))

				for (var j = 0; j < 3; j++) {
					vertices[t.v[j]].q.addSelf(tmp);
				}

				// vertices[t.v[j]].q =
				// vertices[t.v[j]].q.add(SymetricMatrix(n[0],n[1],n[2],-n.dot(p[0])));
			}

			for (var i = 0; i < triangles.length; i++) {

				// Calc Edge Error
				var /*Triangle &*/ t=triangles[i];
				// vec3f p;
				var p = glMatrix.vec3.create();

				for (var j = 0; j < 3; j++) {
					t.err[ j ] = calculate_error( t.v[j], t.v[(j+1)%3], p );
				}

				t.err[ 3 ] = Math.min( t.err[0], t.err[1], t.err[2] );
			}
		}

		// Init Reference ID list
		for (var i = 0; i < vertices.length; i++)
		{
			vertices[i].tstart=0;
			vertices[i].tcount=0;
		}
		for (var i = 0; i < triangles.length; i++)
		{
			/*Triangle &*/
			var t = triangles[i];
			for (j = 0; j < 3; j++) vertices[t.v[j]].tcount++;
		}
		var tstart=0;
		for (var i = 0; i < vertices.length; i++)
		{
			var /*Vertex &*/ v = vertices[i];
			v.tstart = tstart;
			tstart += v.tcount;
			v.tcount = 0;
		}

		// Write References
		// resize(refs, triangles.length * 3)
		console.log('pre ref', refs.length, triangles.length * 3);
		for (var i = refs.length; i < triangles.length * 3; i++) {
			refs[i] = new Ref();
		}

		for (var i = 0; i < triangles.length; i++)
		{
			/*Triangle &*/
			var t = triangles[i];
			for (var j = 0; j < 3; j++)
			{
				/*Vertex &*/
				var v = vertices[ t.v[ j ] ];
				refs[ v.tstart + v.tcount ].tid = i;
				refs[ v.tstart + v.tcount ].tvertex = j;
				v.tcount++;
			}
		}

		// Identify boundary : vertices[].border=0,1
		if( iteration == 0 )
		{
			// std::vector<int> vcount,vids;
			var vcount,vids;


			for (var i = 0; i < vertices.length; i++) {
				vertices[i].border = 0;
			}

			for (var i = 0; i < vertices.length; i++) {
				var /*Vertex &*/ v = vertices[i];
				// vcount.clear();
				// vids.clear();
				vcount = [];
				vids = [];

				for (var j = 0; j < v.tcount; j++) {
					var k = refs[v.tstart + j].tid;
					var /*Triangle &*/ t = triangles[k];

					for (var k = 0; k < 3; k++) {
						var ofs=0,
							id=t.v[k];
						while(ofs < vcount.length) {
							if(vids[ofs]==id) break;
							ofs++;
						}

						if(ofs == vcount.length) {
							vcount.push(1);
							vids.push(id);
						}
						else {
							vcount[ofs]++;
						}
					}
				}
				for (var j = 0; j < vcount.length; j++) {
					if(vcount[j]==1) {
						vertices[vids[j]].border=1;
					}
				}
			}
		}
	}

	// Finally compact mesh before exiting

	function compact_mesh()
	{
		console.log('compact_mesh');
		var /*int */ dst=0;
		for (var i = 0; i < vertices.length; i++) {
			vertices[i].tcount=0;
		}
		for (var i = 0; i < triangles.length; i++) {
			if(!triangles[i].deleted) {
				var /*Triangle &*/ t = triangles[i];
				triangles[dst++] = t;
				for (var j = 0; j < 3; j++)
					vertices[t.v[j]].tcount = 1;
			}
		}
		resize(triangles, dst);
		dst = 0;
		for (var i = 0; i < vertices.length; i++) {
			if (vertices[i].tcount) {
				vertices[i].tstart = dst;
				vertices[dst].p = vertices[i].p;
				dst++;
			}
		}

		for (var i = 0; i < triangles.length; i++) {
			var /*Triangle &*/ t = triangles[i];
			for (var j = 0; j < 3; j++)
				t.v[j] = vertices[t.v[j]].tstart;
		}
		console.log('%cCompact Mesh', 'background:#f00', vertices.length, dst);
		resize(vertices, dst);
		console.log('%cCompact Mesh ok', 'background:#f00', vertices.length, dst);
	}

	// Error between vertex and Quadric

	function vertex_error(/*SymetricMatrix*/ q, /*double*/ x, y, z) {
		return q.m[0]*x*x + 2*q.m[1]*x*y + 2*q.m[2]*x*z + 2*q.m[3]*x + q.m[4]*y*y
			+ 2*q.m[5]*y*z + 2*q.m[6]*y + q.m[7]*z*z + 2*q.m[8]*z + q.m[9];
	}

	// Error for one edge
	// if DECIMATE is defined vertex positions are NOT interpolated
	// Luebke Survey of Polygonal Simplification Algorithms:  "vertices of a model simplified by the decimation algorithm are a subset of the original model’s vertices."
	// http://www.cs.virginia.edu/~luebke/publications/pdf/cg+a.2001.pdf

	function calculate_error(id_v1, id_v2, p_result)
	{
		
		// compute interpolated vertex
		var vertex1 = vertices[id_v1];
		var vertex2 = vertices[id_v2];
		var q = vertex1.q.add(vertex2.q);
		var border = vertex1.border && vertex2.border;
		var error = 0;
		var det = q.det(0, 1, 2, 1, 4, 5, 2, 5, 7);

		if ( det !== 0 && !border ) {
			// q_delta is invertible
			p_result[0] = -1/det*(q.det(1, 2, 3, 4, 5, 6, 5, 7, 8));	// vx = A41/det(q_delta)
			p_result[1] =  1/det*(q.det(0, 2, 3, 1, 5, 6, 2, 7, 8));	// vy = A42/det(q_delta)
			p_result[2] = -1/det*(q.det(0, 1, 3, 1, 4, 6, 2, 5, 8));	// vz = A43/det(q_delta)
			error = vertex_error(q, p_result[0], p_result[1], p_result[2]);
		}
		else {
			// det = 0 -> try to find best result
			var /*vec3f*/ p1 = vertex1.p;
			var /*vec3f*/ p2 = vertex2.p;
			
			var p3 = glMatrix.vec3.create();
			glMatrix.vec3.add(p3,p1,p2);
			glMatrix.vec3.scale(p3,p3,0.5);
			//var /*vec3f*/ p3 = new Vector3().addVectors(p1, p2).multiplyScalar(0.5);
			
			var error1 = vertex_error(q, p1[0], p1[2], p1[3]);
			var error2 = vertex_error(q, p2[0], p2[1], p2[3]);
			var error3 = vertex_error(q, p3[0], p3[1], p3[3]);
			error = Math.min(error1, error2, error3);
			// if (error1 === error) p_result.copy(p1);
			// if (error2 === error) p_result.copy(p2);
			// if (error3 === error) p_result.copy(p3);
			 if (error1 === error) p_result = p1.slice();
			 if (error2 === error) p_result = p2.slice();
			 if (error3 === error) p_result = p3.slice();
			
		}

		return error;
	}
	return function simplifyModify(geometry) {



		// convert format
		init( geometry.vertices, geometry.faces );

		// simplify!
		// simplify_mesh(geometry.faces.length * 0.5 | 0, 7);
		// simplify_mesh(geometry.faces.length - 2, 4);

		console.time('simplify')
		//simplify_mesh(150, 7);
		simplify_mesh(geometry.faces.length/3/10,8);
		console.timeEnd('simplify')


		console.log('old vertices ' + geometry.vertices.length, 'old faces ' + geometry.faces.length);

		console.log('new vertices ' + vertices.length, 'old faces ' + triangles.length);


		// TODO convert to buffer geometry.
		var newGeo = {
			vertices : [],
			faces : [],
		}

		for ( i = 0; i < vertices.length; i ++ ) {

			var v = vertices[ i ];
			newGeo.vertices.push( v.p[0],v.p[1],v.p[2])

		}

		for ( i = 0; i < triangles.length; i ++ ) {

			var tri = triangles[ i ];
			newGeo.faces.push(
				tri.v[0],
				tri.v[1],
				tri.v[2]
			);
		}

		return newGeo;

	}
	


})()