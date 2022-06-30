function extractProperties() {
	let rows = [...document.querySelectorAll('article')].map(x => {
		let priceText = x.querySelector('div.price-row span.item-price')?.innerText
		let price = Number(priceText?.replace(',', '').replace('€', ''))
		let m2Text = x.querySelector('div.item-detail-char span:nth-child(2)')?.innerText
		m2Text = m2Text ? m2Text.split('').filter(a => a >= '0' && a <= '9').join('') : null
		let m2 = Number(m2Text)
		let link = x.querySelector('div.item-info-container a.item-link')
		return {
			el: x,
			name: link?.innerText,
			link: link?.href,
			priceText,
			price,
			m2Text,
			m2,
			pm2: (price/m2).toFixed(2),
		}
	}).filter(x => x.priceText);

	console.table(rows)
	return rows
}

function injectPricePerM2(rows) {
	rows.forEach(x => {
		let priceRow = x.el.querySelector('div.price-row')
		priceRow.style.gap = '10px'
		let pm2div = priceRow.querySelector('span.pm2')
		if (!pm2div) {
			let newDiv = document.createElement('span')
			newDiv.className = 'pm2'
			priceRow.appendChild(newDiv)
			pm2div = newDiv
		}
		pm2div.innerText = x.pm2 + ' eur/m2'
	})
}

async function sleep(time) {
	return new Promise(resolve => setTimeout(resolve, time))
}

async function loadDetailsStoreLocation(rows) {
	for (let item of rows) {
		let link = item.el.querySelector('div.item-info-container a.item-link')
		let url = link.href
		console.log(url)
		if (localStorage.getItem(link + '-mapConfig')) {
			continue
		}
		let res = await fetch(url)
		let html = await res.text()
		let mc = eval('(' + html.match(/var mapConfig(.|\n)+?}/)[0].replace('var mapConfig = ', '') + ')')
		console.log(mc)
		localStorage.setItem(link + '-mapConfig', JSON.stringify(mc))
		await sleep(3000)
	}
	console.log('done')
}

async function loadDistanceToTheSea(rows) {
	for (let item of rows) {
		let link = item.el.querySelector('div.item-info-container a.item-link')
		let mc = localStorage.getItem(link.href + '-mapConfig')
		if (!mc) {
			console.log('run loadDetailsStoreLocation() first')
			continue
		}
		mc = JSON.parse(mc)
		const apiUrl = `http://localhost:3000/?x=${mc.latitude}&y=${mc.longitude}`
		let res = await fetch(apiUrl)
		let apiRes = await res.json()
		let distance = apiRes.nearestShore.nearestPoint
		console.log(link.href, {distance})
		localStorage.setItem(link.href + 'distance', distance)
	}

}

function injectDistance(rows) {
	rows.forEach(x => {
		let link = x.el.querySelector('div.item-info-container a.item-link')
		let distance = localStorage.getItem(link.href + 'distance')
		let priceRow = x.el.querySelector('div.price-row')
		priceRow.style.gap = '10px'
		let pm2div = priceRow.querySelector('span.distance')
		if (!pm2div) {
			let newDiv = document.createElement('span')
			newDiv.className = 'distance'
			priceRow.appendChild(newDiv)
			pm2div = newDiv
		}
		pm2div.innerText = Number(distance).toFixed(2) + ' km to the sea'
	})
}

async function runAll() {
	const rows = extractProperties()
	injectPricePerM2(rows)
	await loadDetailsStoreLocation(rows)
	loadDistanceToTheSea(rows)
	injectDistance(rows)
}
