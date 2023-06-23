;(function () {
	// Register the Service Worker
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', function () {
			navigator.serviceWorker
				.register('/serviceWorker.js')
				.then((res) => console.log('service worker registered'))
				.catch((err) => console.log('service worker not registered', err))
		})
	}

	// Constants
	const dialog = document.querySelector('dialog')
	const deleteAllButton = document.querySelector('#delete-all-btn')
	const calButton = document.querySelector('#cal-btn')
	const closeButton = document.querySelector('#close-btn')
	const repeatButton = document.querySelector('#repeat-btn')
	const madeLabel = document.querySelector('#made-label')
	const totalLabel = document.querySelector('#total-label')
	const saveButton = document.querySelector('#save-btn')
	const missedButton = document.querySelector('#missed-btn')
	const madeButton = document.querySelector('#made-btn')
	const missedDecButton = document.querySelector('#missed-dec-btn')
	const madeDecButton = document.querySelector('#made-dec-btn')
	const madedDecButton = document.querySelector('#missed-dec-btn')
	const tableBody = document.querySelector('#table-body')
	const openRequest = indexedDB.open('freeThrowsDatabase', 1)

	// Variables
	let made = 0
	let missed = 0
	let db

	// Events
	calButton.addEventListener('click', function () {
		dialog.showModal()
	})
	closeButton.addEventListener('click', function () {
		dialog.close()
	})
	repeatButton.addEventListener('click', function () {
		made = 0
		missed = 0
		updateScore()
	})
	madeButton.addEventListener('click', function () {
		made++
		updateScore()
	})
	missedButton.addEventListener('click', function () {
		missed++
		updateScore()
	})
	madeDecButton.addEventListener('click', function () {
		if (made > 0) {
			made--
			updateScore()
		}
	})
	missedDecButton.addEventListener('click', function () {
		if (missed > 0) {
			missed--
			updateScore()
		}
	})
	saveButton.addEventListener('click', function () {
		saveScore()
	})
	deleteAllButton.addEventListener('click', function () {
		deleteAll()
	})

	// Functions
	function updateScore() {
		madeLabel.textContent = made
		totalLabel.textContent = '/' + (made + missed)
		saveButton.textContent = 'Save'
	}

	function saveScore() {
		if (made + missed > 0 && saveButton.textContent !== 'Saved') {
			const newEntry = {
				id: Date.now(),
				date: new Date().toISOString(),
				made,
				missed,
			}

			addEntryToTable(newEntry)
			addEntryToDb(newEntry)

			saveButton.textContent = 'Saved'
		}
	}

	function createDataRow({ id, date, made, missed }) {
		const dateObj = new Date(date)
		const day = dateObj.getDate()
		const month = dateObj.getMonth()
		const newRow = document.createElement('tr')

		newRow.id = id
		newRow.innerHTML = `
			<tr>
				<td>${day}. ${month}.</td>
				<td>${made}</td>
				<td>${missed}</td>
				<td>${Math.round((made / (made + missed)) * 100)}%</td>
			</tr>
		`
		const deleteButton = document.createElement('button')
		deleteButton.onclick = () => deleteScore(id)
		deleteButton.innerHTML = `
			<img src="images/delete.png" alt="Delete Icon"/>
		`
		const deleteButtonContainer = document.createElement('td')
		deleteButtonContainer.appendChild(deleteButton)
		newRow.appendChild(deleteButtonContainer)

		return newRow
	}

	function addEntryToTable(newEntry) {
		const newRow = createDataRow(newEntry)

		tableBody.appendChild(newRow)
	}

	function addEntryToDb(newEntry) {
		if (db) {
			const request = db
				.transaction(['scoresStore'], 'readwrite')
				.objectStore('scoresStore')
				.add(newEntry)

			/* request.onsuccess = function () {
				console.log("Entry added")
			} */
		}
	}

	function deleteScore(id) {
		const entry = document.getElementById(id)
		entry.remove()

		removeEntryFromDb(id)
	}

	function removeEntryFromDb(id) {
		if (db) {
			const request = db
				.transaction(['scoresStore'], 'readwrite')
				.objectStore('scoresStore')
				.delete(id)

			/* request.onsuccess = function () {
				console.log("Entry deleted")
			} */
		}
	}

	function getAllEntriesFromDb() {
		if (db) {
			const request = db
				.transaction(['scoresStore'], 'readwrite')
				.objectStore('scoresStore')
				.getAll()

			request.onsuccess = function () {
				const data = request.result
				if (data && data.length > 0) {
					data.forEach((entry) => addEntryToTable(entry))
				}
			}
		}
	}

	function deleteAll() {
		tableBody.innerHTML = ''

		if (db) {
			const request = db
				.transaction(['scoresStore'], 'readwrite')
				.objectStore('scoresStore')
				.clear()

			/* request.onsuccess = function () {
				console.log('All cleared')
			} */
		}
	}

	// IndexedDB
	openRequest.onupgradeneeded = function (e) {
		db = e.target.result
		console.log('running onupgradeneeded')
		db.createObjectStore('scoresStore', { keyPath: 'id' })
	}
	openRequest.onsuccess = function (e) {
		console.log('running onsuccess')
		db = e.target.result
		getAllEntriesFromDb()
	}
	openRequest.onerror = function (e) {
		console.log('Error')
	}
})()
