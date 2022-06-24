import express from "express";
import {findClosestShape, readShapes} from "./shape-read.mjs";
import * as turf from "@turf/turf";

import cors from "cors";

const app = express()
app.use(cors())

const shapes = await readShapes()

app.get('/', (req, res) => {
	const start = new Date()

	let {x, y} = req.query
	console.log(x, y)
	x = Number(x)
	y = Number(y)

	const pt = turf.point([y, x]);
	const minDistance = findClosestShape(shapes, pt)
	console.log(minDistance)
	const nearestPoint = turf.nearestPointOnLine(minDistance.line, pt)

	const json = {
		shapes: shapes.length,
		x, y,
		nearestPoint,
		nearestShore: {
			nearestPoint: nearestPoint.properties.dist,
			units: 'km'
		},
		runtime: (new Date().getTime() - start.getTime()) / 1000,
	}

	res.json(json)
})

app.listen(3000)
