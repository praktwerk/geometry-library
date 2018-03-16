var EARTH_RADIUS = 6371009;

function hav(x) {
    sinHalf = Math.sin(x * 0.5);
    return sinHalf * sinHalf;
}

/**
 * Returns hav() of distance from (lat1, lng1) to (lat2, lng2) on the unit sphere.
 */
function havDistance(lat1, lat2, dLng) {
    return hav(lat1 - lat2) + hav(dLng) * Math.cos(lat1) * Math.cos(lat2);
}

// Given h==hav(x), returns sin(abs(x)).
function sinFromHav(h) {
    return 2 * Math.sqrt(h * (1 - h));
}

// Returns hav(asin(x)).
function havFromSin(x) {
    let x2 = x * x;
    return x2 / (1 + Math.sqrt(1 - x2)) * .5;
}

// Returns sin(arcHav(x) + arcHav(y)).
function sinSumFromHav(x, y) {
    let a = Math.sqrt(x * (1 - x));
    let b = Math.sqrt(y * (1 - y));
    return 2 * (a + b - 2 * (a * y + b * x));
}

function deg2rad (angle) {
	//  discuss at: http://locutus.io/php/deg2rad/
	// original by: Enrique Gonzalez
	// improved by: Thomas Grainger (http://graingert.co.uk)
	//   example 1: deg2rad(45)
	//   returns 1: 0.7853981633974483

	return angle * 0.017453292519943295 // (angle / 180) * Math.PI;
}

module.exports = {
	EARTH_RADIUS : EARTH_RADIUS,
	hav : hav, 
	havDistance : havDistance,
	sinFromHav : sinFromHav,
	havFromSin : havFromSin,
	sinSumFromHav : sinSumFromHav,
	deg2rad : deg2rad
};