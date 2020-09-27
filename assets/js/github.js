function htmlToElem(html) {
	var template = document.createElement('template');
	template.innerHTML = html.trim();
	return template.content.childNodes[0];
}

export default async function (elements) {
	if (!elements.length)
		return;

	for (let element of elements) {
		const iframeData = htmlToElem(element.innerHTML)

		const attributes = {
			'username': (iframeData.src).match(/github\.com\/([^/]+)/)[1],
			'hide_border': 'true',
			'theme': 'algolia',
			'bg_color': '00000000'
		}
		const paramsURL = Object.keys(attributes).map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(attributes[k])).join('&')

		const gitStatsURL = (url) => 'https://cors-anywhere.herokuapp.com/'
			+ 'https://github-readme-stats.vercel.app/api'
			+ url
			+ paramsURL;

		const langStatsURL = gitStatsURL('/top-langs?layout=compact&card_width=345&')
		try {
			const langsResponse = await fetch(langStatsURL);
			if (!langsResponse.ok)
				throw new Error();

			const langStatsPage = htmlToElem(await langsResponse.text());
			langStatsPage.removeAttribute('width')
			langStatsPage.removeAttribute('height')
			langStatsPage.setAttribute('viewBox', '24 0 347 85')
			langStatsPage.setAttribute('style', 'width: 100%; filter: drop-shadow(0px 1.75px 1px var(--shadow-color))')

			// Fix Heading Padding
			langStatsPage
				.querySelector('[data-testid="card-title"]')
				.setAttribute('transform', 'translate(25, 20)')

			// Fix body padding
			langStatsPage
				.querySelector('[data-testid="main-card-body"]')
				.setAttribute('transform', 'translate(0, 30)')

			const style = langStatsPage.querySelector('style')
			style.innerHTML = style.innerHTML
				.replace(".lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: #FFFFFF }", ".lang-name { font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif; fill: var(--text-color); font-weight: bold; }")
				.replace("fill: #00AEFF;", "fill: var(--text-color);")

			let i = 0;
			langStatsPage
				.querySelector('[data-testid="lang-items"]')
				.querySelectorAll('g')
				.forEach(r => {
					r.setAttribute("transform", "translate(" + (120 * (i % 3)) + "," + (20 + 20 * Math.floor(i / 3)) + ")");
					i++;
				});

			element.insertAdjacentElement('afterend', langStatsPage)
		} catch {
			const langStatsImage = document.createElement('img')
			langStatsImage.src = langStatsURL
			langStatsImage.setAttribute('style', 'width: 100%; filter: drop-shadow(0px 1.75px 1px var(--shadow-color))')
			element.insertAdjacentElement('afterend', langStatsImage)
		}

		const profStatsURL = gitStatsURL('?hide_title=true&show_icons=true&')
		try {
			const profStatsResponse = await fetch(profStatsURL)
			if (!profStatsResponse.ok)
				throw new Error();

			const profStatsPage = htmlToElem(await profStatsResponse.text());
			profStatsPage.removeAttribute('width')
			profStatsPage.removeAttribute('height')
			profStatsPage.setAttribute('viewBox', '22 0 355 125')
			profStatsPage.setAttribute('style', 'width: 100%; filter: drop-shadow(0px 1.75px 1px var(--shadow-color))')
			profStatsPage.classList.add('mb-2')

			// Move circle rank more left
			profStatsPage
				.querySelector('[data-testid="rank-circle"]')
				.setAttribute('transform', 'translate(330, 52)')

			// Remove Padding
			profStatsPage
				.querySelector('[data-testid="main-card-body"]')
				.removeAttribute('transform')

			let style = profStatsPage.querySelector('style')
			style.innerHTML = style.innerHTML
				.replaceAll("fill: #FFFFFF;", "fill: var(--text-color);")

			profStatsPage
				.querySelectorAll('[data-testid="icon"]')
				.forEach(iconElem => iconElem.setAttribute('x', '35'))

			profStatsPage
				.querySelectorAll('text')
				.forEach(elem => {
					switch (parseInt(elem.getAttribute('x'))) {
						case 25:
							elem.setAttribute('x', '55');
							elem.classList.remove('bold')
							break;
						case 200:
							elem.setAttribute('x', '30');
							elem.classList.add('bold')
							elem.setAttribute('text-anchor', 'end')
							break;
					}

					elem.innerHTML = elem.innerHTML
						.replace('Total Stars', 'Stars Gained')
						.replace('Total Commits', 'Commits Pushed')
						.replace('Total PRs', 'PRs sent')
						.replace('Total Issues', 'Issues Opened')
						.replace(':', '')
				})

			element.insertAdjacentElement('afterend', profStatsPage)
		} catch {
			const profStatsImage = document.createElement('img')
			profStatsImage.src = profStatsURL
			profStatsImage.setAttribute('style', 'width: 100%; filter: drop-shadow(0px 1.75px 1px var(--shadow-color))')
			element.insertAdjacentElement('afterend', profStatsImage)
		}

		try {
			let gitActivityResponse = await fetch('https://cors-anywhere.herokuapp.com/' + (iframeData.src).replace('.pibb', '/raw'))
			if (!gitActivityResponse.ok)
				throw new Error();

			const codeElement = document.createElement('code')
			codeElement.classList.add('language-text')
			codeElement.innerText = await gitActivityResponse.text();

			const preElement = document.createElement('pre')
			preElement.appendChild(codeElement)
			element.insertAdjacentElement('afterend', preElement)
		} catch {
			const iframeElement = document.createElement('iframe')
			iframeElement.setAttribute('src', iframeData.src)
			element.insertAdjacentElement('afterend', iframeElement)
		}
	}
}