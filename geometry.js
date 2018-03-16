var mathUtil = require('./mathUtil');
var polyline = require('@mapbox/polyline');

var DEFAULT_TOLERANCE = 0.1;

 /**
 * Returns sin(initial bearing from (lat1,lng1) to (lat3,lng3) minus initial bearing
 * from (lat1, lng1) to (lat2,lng2)).
 */
function sinDeltaBearing( lat1, lng1, lat2, lng2, lat3, lng3) {
    
    let sinLat1 = Math.sin(lat1);
    let cosLat2 = Math.cos(lat2);
    let cosLat3 = Math.cos(lat3);
    let lat31 = lat3 - lat1;
    let lng31 = lng3 - lng1;
    let lat21 = lat2 - lat1;
    let lng21 = lng2 - lng1;
    let a = Math.sin(lng31) * cosLat3;
    let c = Math.sin(lng21) * cosLat2;
    let b = Math.sin(lat31) + 2 * sinLat1 * cosLat3 * mathUtil.hav(lng31);
    let d = Math.sin(lat21) + 2 * sinLat1 * cosLat2 * mathUtil.hav(lng21);
    let denom = (a * a + b * b) * (c * c + d * d);
    return denom <= 0 ? 1 : (a * d - b * c) / Math.sqrt(denom);
}  

function isOnSegmentGC( lat1, lng1, lat2, lng2, lat3, lng3, havTolerance) {
	  
	let havDist13 = mathUtil.havDistance(lat1, lat3, lng1 - lng3);
	if (havDist13 <= havTolerance) {
	    return true;
	}
	
	let havDist23 = mathUtil.havDistance(lat2, lat3, lng2 - lng3);
	if (havDist23 <= havTolerance) {
	    return true;
	}
	
	let sinBearing = sinDeltaBearing(lat1, lng1, lat2, lng2, lat3, lng3);
	let sinDist13 = mathUtil.sinFromHav(havDist13);

	let havCrossTrack = mathUtil.havFromSin(sinDist13 * sinBearing);

	if (havCrossTrack > havTolerance) {
	    return false;
	}
	
	let havDist12 = mathUtil.havDistance(lat1, lat2, lng1 - lng2);
	let term = havDist12 + havCrossTrack * (1 - 2 * havDist12);
	if (havDist13 > term || havDist23 > term) {
	    return false;
	}
	if (havDist12 < 0.74) {
	    return true;
	}
	let cosCrossTrack = 1 - 2 * havCrossTrack;
	let havAlongTrack13 = (havDist13 - havCrossTrack) / cosCrossTrack;
	let havAlongTrack23 = (havDist23 - havCrossTrack) / cosCrossTrack;
	let sinSumAlongTrack = mathUtil.sinSumFromHav(havAlongTrack13, havAlongTrack23);
	return sinSumAlongTrack > 0;  // Compare with half-circle == PI using sign of sin().

}

function isLocationOnEdgeOrPath(point, poly, closed, geodesic, toleranceEarth) {

	poly = polyline.decode(poly);
        
    let size = poly.length;
    
    if (size == 0) {
        return false;
    }
    
    let tolerance = toleranceEarth / mathUtil.EARTH_RADIUS;
    let havTolerance = mathUtil.hav(tolerance);
    let lat3 = mathUtil.deg2rad(point.lat);
    let lng3 = mathUtil.deg2rad(point.lng);

    let prev = typeof(closed !== 'undefined') ? poly[size - 1] : 0;
    let lat1 = mathUtil.deg2rad(prev[0]);
    let lng1 = mathUtil.deg2rad(prev[1]);

    if (geodesic) {
        for (let val of poly) {
            let lat2 = mathUtil.deg2rad(val[0]);
            let lng2 = mathUtil.deg2rad(val[1]);

            
            if (isOnSegmentGC(lat1, lng1, lat2, lng2, lat3, lng3, havTolerance)) {
                return true;
            }
            lat1 = lat2;
            lng1 = lng2;
        }
    } else {
        // TODO
    	/*
        // We project the points to mercator space, where the Rhumb segment is a straight line,
        // and compute the geodesic distance between point3 and the closest point on the
        // segment. This method is an approximation, because it uses "closest" in mercator
        // space which is not "closest" on the sphere -- but the error is small because
        // "tolerance" is small.
        minAcceptable = lat3 - tolerance;
        maxAcceptable = lat3 + tolerance;
        y1 = MathUtil::mercator(lat1);
        y3 = MathUtil::mercator(lat3);
        xTry = [];
        foreach(poly as val) {
            lat2 = mathUtil.deg2rad(val['lat']);
            y2 = MathUtil::mercator(lat2);
            lng2 = mathUtil.deg2rad(val['lng']);                
            if (max(lat1, lat2) >= minAcceptable && min(lat1, lat2) <= maxAcceptable) {
                // We offset longitudes by -lng1; the implicit x1 is 0.
                x2 = MathUtil::wrap(lng2 - lng1, -M_PI, M_PI);
                x3Base = MathUtil::wrap(lng3 - lng1, -M_PI, M_PI);
                xTry[0] = x3Base;
                // Also explore wrapping of x3Base around the world in both directions.
                xTry[1] = x3Base + 2 * M_PI;
                xTry[2] = x3Base - 2 * M_PI;
                
                foreach(xTry as x3) {
                    dy = y2 - y1;
                    len2 = x2 * x2 + dy * dy;
                    t = len2 <= 0 ? 0 : MathUtil::clamp((x3 * x2 + (y3 - y1) * dy) / len2, 0, 1);
                    xClosest = t * x2;
                    yClosest = y1 + t * dy;
                    latClosest = MathUtil::inverseMercator(yClosest);
                    havDist = MathUtil::havDistance(lat3, latClosest, x3 - xClosest);
                    if (havDist < havTolerance) {
                        return true;
                    }
                }
            }
            lat1 = lat2;
            lng1 = lng2;
            y1 = y2;
        }
        */
    }
    
    return false;
}

function isLocationOnEdge(point, polygon, tolerance = DEFAULT_TOLERANCE, geodesic = true) {
    return isLocationOnEdgeOrPath(point, polygon, true, geodesic, tolerance);
}

function isLocationOnPath(point, polyline, tolerance = DEFAULT_TOLERANCE, geodesic = true) {
	return isLocationOnEdgeOrPath(point, polyline, false, geodesic, tolerance);
}    



module.exports = {
	isLocationOnPath : isLocationOnPath
};