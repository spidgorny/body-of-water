import * as turf from "@turf/turf";
import {findClosestShape, readShapes} from "./shape-read.mjs";

const houseLoc = {latitude: '38.8418087', longitude: '-0.1170455'}

const shapes = await readShapes()
const pt = turf.point([houseLoc.longitude, houseLoc.latitude]);
const minDistance = findClosestShape(shapes, pt)
console.log(minDistance)
const nearestPoint = turf.nearestPointOnLine(minDistance.line, pt)
console.log(nearestPoint)
