/*
RetroVox Main Render 9/23/2019

This file will contain general functions used through-out the project.
*/


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


//Round entire array return new array
Math.roundArray = function(arr){
	var retArray = arr.slice();
	for(var k = 0; k<retArray.length; k++){
		retArray[k] = Math.round(retArray[k]);
	}
	return(retArray);
}