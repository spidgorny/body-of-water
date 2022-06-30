const img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'img.png';
const canvas = document.getElementById('canvas');
console.log(canvas);
let ctx

img.onload = function () {
	img.style.display = 'none';
	console.log(img.width, img.height);
	canvas.style.width = img.width + 'px';
	canvas.style.height = img.height + 'px'
	canvas.width = img.width
	canvas.height = img.height
	ctx = canvas.getContext('2d');
	console.log(ctx);
	resetCanvas();
}

function resetCanvas() {
	ctx.drawImage(img, 0, 0);
}

function rgba(data) {
	return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${(data[3] ?? 255) / 255})`
}

function pick(event, destination) {
	const x = event.layerX;
	const y = event.layerY;
	const pixel = ctx.getImageData(x, y, 1, 1);
	const data = pixel.data;
	// console.log({data})

	const pickColor = rgba(data);
	ctx.rect(x, y, 5, 5)

	return {x, y, pickColor};
}

let seaColor = [157, 192, 245] // 'rgba(157, 192, 245, 1)'

function getSeaPercent(x, y, radius) {
	let seaPixels = 0
	for (let yy = y - radius; yy < y + radius; yy++) {
		for (let xx = x - radius; xx < x + radius; xx++) {
			let {data} = ctx.getImageData(xx, yy, 1, 1);
			data = data.slice(0, 3)
			if (data.join(',') === seaColor.join(',')) {
				seaPixels++
			}
		}
	}
	let denom = radius * radius * 2 * 2;
	console.log(seaPixels, '/', denom, seaPixels / denom)
	return seaPixels / denom
}

function showSingleRadiusWaterContent(x, y, radius, seaPercent) {

	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.stroke();

	ctx.beginPath();
	ctx.fillStyle = rgba(seaColor.map(x => x * seaPercent));
	ctx.arc(x, y, radius - 2, 0, 2 * Math.PI);
	ctx.fill();
}

canvas.addEventListener('click', function (event) {
	let {x, y, pickColor} = pick(event);
	console.log(x, y, pickColor);
	resetCanvas();
	let radius = 10
	// const seaPercent = getSeaPercent(x, y, radius);
	// showSingleRadiusWaterContent(x, y, radius)
	for (let radius = 10; radius < 1000; radius+=20) {
		resetCanvas();
		const seaPercent = getSeaPercent(x, y, radius);
		showSingleRadiusWaterContent(x, y, radius, seaPercent)
		if (seaPercent > 0.1) {
			console.log('final', radius, seaPercent)
			break;
		}
	}
});
