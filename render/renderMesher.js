/*
RetroVox Chunk Meshing 9/20/2019

This file will contain the code that meshes a chunk together and sets its draw data.
It takes a blockArray and returns the verticie information that draws the triangles to make up a scene.
*/


//Container for all of our chunk data
var chunk = new Map();
//Container for all of our sector data
var sector = new Map();

var sectorCoolDownLimit = 1500;
var sectorCoolDown = Date.now();


//Array containing chunks active
var activeChunks = [];
//Array for sectors active
var activeSectors=[];

var started = 0;

cursor = {
	buildStrength : 2,
	buildType : 1,
};
!function(t){var o=t.noise={};function r(t,o,r){this.x=t,this.y=o,this.z=r}r.prototype.dot2=function(t,o){return this.x*t+this.y*o},r.prototype.dot3=function(t,o,r){return this.x*t+this.y*o+this.z*r};var n=[new r(1,1,0),new r(-1,1,0),new r(1,-1,0),new r(-1,-1,0),new r(1,0,1),new r(-1,0,1),new r(1,0,-1),new r(-1,0,-1),new r(0,1,1),new r(0,-1,1),new r(0,1,-1),new r(0,-1,-1)],e=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],a=new Array(512),i=new Array(512);o.seed=function(t){t>0&&t<1&&(t*=65536),(t=Math.floor(t))<256&&(t|=t<<8);for(var o=0;o<256;o++){var r;r=1&o?e[o]^255&t:e[o]^t>>8&255,a[o]=a[o+256]=r,i[o]=i[o+256]=n[r%12]}},o.seed(0);var d=.5*(Math.sqrt(3)-1),f=(3-Math.sqrt(3))/6,h=1/6;function u(t){return t*t*t*(t*(6*t-15)+10)}function s(t,o,r){return(1-r)*t+r*o}o.simplex2=function(t,o){var r,n,e=(t+o)*d,h=Math.floor(t+e),u=Math.floor(o+e),s=(h+u)*f,l=t-h+s,w=o-u+s;l>w?(r=1,n=0):(r=0,n=1);var v=l-r+f,M=w-n+f,c=l-1+2*f,p=w-1+2*f,y=i[(h&=255)+a[u&=255]],x=i[h+r+a[u+n]],m=i[h+1+a[u+1]],q=.5-l*l-w*w,z=.5-v*v-M*M,A=.5-c*c-p*p;return 70*((q<0?0:(q*=q)*q*y.dot2(l,w))+(z<0?0:(z*=z)*z*x.dot2(v,M))+(A<0?0:(A*=A)*A*m.dot2(c,p)))},o.simplex3=function(t,o,r){var n,e,d,f,u,s,l=(t+o+r)*(1/3),w=Math.floor(t+l),v=Math.floor(o+l),M=Math.floor(r+l),c=(w+v+M)*h,p=t-w+c,y=o-v+c,x=r-M+c;p>=y?y>=x?(n=1,e=0,d=0,f=1,u=1,s=0):p>=x?(n=1,e=0,d=0,f=1,u=0,s=1):(n=0,e=0,d=1,f=1,u=0,s=1):y<x?(n=0,e=0,d=1,f=0,u=1,s=1):p<x?(n=0,e=1,d=0,f=0,u=1,s=1):(n=0,e=1,d=0,f=1,u=1,s=0);var m=p-n+h,q=y-e+h,z=x-d+h,A=p-f+2*h,b=y-u+2*h,g=x-s+2*h,j=p-1+.5,k=y-1+.5,B=x-1+.5,C=i[(w&=255)+a[(v&=255)+a[M&=255]]],D=i[w+n+a[v+e+a[M+d]]],E=i[w+f+a[v+u+a[M+s]]],F=i[w+1+a[v+1+a[M+1]]],G=.6-p*p-y*y-x*x,H=.6-m*m-q*q-z*z,I=.6-A*A-b*b-g*g,J=.6-j*j-k*k-B*B;return 32*((G<0?0:(G*=G)*G*C.dot3(p,y,x))+(H<0?0:(H*=H)*H*D.dot3(m,q,z))+(I<0?0:(I*=I)*I*E.dot3(A,b,g))+(J<0?0:(J*=J)*J*F.dot3(j,k,B)))},o.perlin2=function(t,o){var r=Math.floor(t),n=Math.floor(o);t-=r,o-=n;var e=i[(r&=255)+a[n&=255]].dot2(t,o),d=i[r+a[n+1]].dot2(t,o-1),f=i[r+1+a[n]].dot2(t-1,o),h=i[r+1+a[n+1]].dot2(t-1,o-1),l=u(t);return s(s(e,f,l),s(d,h,l),u(o))},o.perlin3=function(t,o,r){var n=Math.floor(t),e=Math.floor(o),d=Math.floor(r);t-=n,o-=e,r-=d;var f=i[(n&=255)+a[(e&=255)+a[d&=255]]].dot3(t,o,r),h=i[n+a[e+a[d+1]]].dot3(t,o,r-1),l=i[n+a[e+1+a[d]]].dot3(t,o-1,r),w=i[n+a[e+1+a[d+1]]].dot3(t,o-1,r-1),v=i[n+1+a[e+a[d]]].dot3(t-1,o,r),M=i[n+1+a[e+a[d+1]]].dot3(t-1,o,r-1),c=i[n+1+a[e+1+a[d]]].dot3(t-1,o-1,r),p=i[n+1+a[e+1+a[d+1]]].dot3(t-1,o-1,r-1),y=u(t),x=u(o),m=u(r);return s(s(s(f,v,y),s(h,M,y),m),s(s(l,c,y),s(w,p,y),m),x)}}(this);

//Messaging from main thread
self.addEventListener('message', function(e) {
	var message = e.data;
	switch(message.id){
		
		case "cursorData":
			cursor.buildStrength = message.buildStrength;
			cursor.buildType = message.buildType;
		break;
		
		
		case "mapSave":
			var saveArray = [];
			//Loop through active chunks
			for(var k = 0 ; k<activeChunks.length; k++){
				  self.postMessage({
					id : 'loadProgress',
					amount : k+1+'/'+activeChunks.length,
				  });	
				//Compress data and save to array
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
				  chunk[chunkID].flags.reDraw=1;
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
		chunk[chunkID].drawData[lod].position = new dataArrayType(finalVert);
		chunk[chunkID].drawData[lod].color = new Uint8Array(finalColor);
		chunk[chunkID].drawData[lod].indice = new Uint32Array(faces);
		
		chunk_draw_sector(chunkID);
		
		
	//Return draw data for cursor chunk
	}else{
		return [(new dataArrayType(finalVert)).buffer, (new Uint8Array(finalColor)).buffer, (new Uint32Array(faces)).buffer];
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
	if(dist>=blockSettings.LODdistance[1]){
			chunk[chunkID].LOD=4;
	//NEAR LOD
	}else{
		if(dist>=blockSettings.LODdistance[0]){
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
				chunk_draw_sector(chunkID);
			}

			//If chunk is flagged to be re-drawn
			if( chunk[chunkID].flags.reDraw>=1 ){
				if(chunk[chunkID].flags.reDraw>=processList[k][1]/2+4 || processList[k][1]<=1){
					procAmount+=1;
					 
					chunk_mesh(chunkID);
					
					chunk[chunkID].flags.reDraw=0;
				}else{
					chunk[chunkID].flags.reDraw+=1;
				}
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
		if(procAmount>=blockSettings.processLimit){
			farLoop=0;
		}
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
	
					if(dist >= blockSettings.LODdistance[0]){
						//FAR LOD 
						if(dist>=blockSettings.LODdistance[1]){
							if(chunk[chunkID].LOD!=4 && Math.abs(chunk[chunkID].lastLOD-dist) > 4){	
								chunk[chunkID].lastLOD=dist;
								chunk[chunkID].LOD=4;
								chunk_draw_sector(chunkID);
							}
						//NEAR LOD
						}else{
							if(chunk[chunkID].LOD!=2 && Math.abs(chunk[chunkID].lastLOD-dist) > 4){
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
							procAmount+=1;
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
		for(var xx=-blockSettings.processDistance.XY ;xx<=blockSettings.processDistance.XY;xx++){
		for(var yy=-blockSettings.processDistance.XY ;yy<=blockSettings.processDistance.XY;yy++){
		for(var zz=-blockSettings.processDistance.Z ;zz<=blockSettings.processDistance.Z;zz++){
			
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
				if(sector[sectorID].reDraw>=processList[k][1]*2+10){
					procAmount+=1;
					 
					if( Date.now() - sectorCoolDown > sectorCoolDownLimit || processList[k][0]<=0){
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