// import {shp} from "shapefile.js/dist/lib/Shapefile/parsers";
import shapefile from "shapefile";
import * as turf from '@turf/turf'

const shapeFileName = 'shape/ne_10m_coastline.shp'
// const shape = await shp(shapeFileName);
// console.log(shape)

export async function readShapes() {
	const source = await shapefile.open(shapeFileName)

	let shapes = []
	let shape;
	do {
		shape = await source.read()
		shape.value && shapes.push(shape.value)
	} while (!shape.done)

	console.log('shapes', shapes.length)
	return shapes
}

export function findClosestShape(shapes, pt) {
	let minDistance;
	for (let line of shapes) {
		const distance = turf.pointToLineDistance(pt, line, {units: 'kilometers'});
		// console.log({distance})
		if (!minDistance) {
			minDistance = {
				distance,
				line
			}
		} else if (minDistance.distance > distance) {
			minDistance = {
				distance,
				line
			}
		}
	}
	return minDistance
}
