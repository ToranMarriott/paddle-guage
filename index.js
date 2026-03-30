let riverNames = []

const riverSearchBar = document.getElementById("river-search-bar")
const searchPredictions = document.getElementById("search-predictions")
const selectedRiverStations = document.getElementById("station-container")
const searchDropdown = document.getElementById("search-dropdown")
const searchClearBtn = document.getElementById("river-search-delete-btn")

function clearSearch() {
    searchPredictions.innerHTML = ""
    searchDropdown.classList.add('hidden')
}

function normaliseMeasures(measures){
    if (!measures){
        return []
    } else if (Array.isArray(measures)){
        return measures
    } else {
        return [measures]
    }
}

function findValidMeasure(measures){
    return measures.find(function(measure){
        return measure.latestReading &&
        typeof measure.latestReading === 'object' &&
        measure.latestReading.value !== undefined
    })
}

function formatReadingValue(validMeasure){
    if (validMeasure && validMeasure.unitName === "m3/s"){
        return `${validMeasure.latestReading.value.toFixed(2)}m<sup>3</sup>/s`
    } else if (validMeasure && (
        validMeasure.unitName === "m" || 
        validMeasure.unitName === "mASD" || 
        validMeasure.unitName === "mAOD"
    )){
        return `${validMeasure.latestReading.value.toFixed(2)}m`
    } else {
        return "No reading"
    }
}

function buildLevelBadgeHTML(typicalHigh, typicalLow, readingValue){
    if ((readingValue != null && typicalHigh != null) && readingValue >= typicalHigh){
        return `<p class="high-warning-badge warning-badge"><i class="fa-solid fa-triangle-exclamation"></i> High</p>`
    } else if ((readingValue != null && typicalHigh != null) && ((typicalHigh - readingValue) <= (typicalHigh / 10))){
        return `<p class="nearly-high-warning-badge warning-badge"><i class="fa-solid fa-arrow-up"></i> Nearly High</p>`
    } else if ((readingValue != null && typicalLow != null) && readingValue <= typicalLow){
        return `<p class="low-warning-badge warning-badge"><i class="fa-solid fa-droplet-slash"></i> Low</p>`
    } else if ((readingValue != null && typicalLow != null) && ((readingValue - typicalLow) <= (typicalLow / 10))){
        return `<p class="nearly-low-warning-badge warning-badge"><i class="fa-solid fa-arrow-down"></i> Nearly Low</p>`
    } else if (!typicalLow && !typicalHigh) {
        return ``
    } else {
        return `<p class="normal-warning-badge warning-badge"><i class="fa-solid fa-water"></i> Normal</p>`
    }
}

function renderSearchDropdown(riverNames) {
    if (riverSearchBar.value.length > 1) {
        searchDropdown.classList.remove('hidden')
        searchPredictions.innerHTML = riverNames
            .map(river => `<li class="river-card">${river}</li>`)
            .join('')
    } else {
        clearSearch()
    }
}

function buildStationCardHTML(station) {
    const measures = normaliseMeasures(station.measures)
    const validMeasure = findValidMeasure(measures)
    const readingValue = formatReadingValue(validMeasure)
    const typicalHigh = station.stageScale?.typicalRangeHigh
    const typicalLow = station.stageScale?.typicalRangeLow
    const heightWarning = buildLevelBadgeHTML(typicalHigh, typicalLow, validMeasure?.latestReading?.value) 
    return `
        <li class="station-card">
            <div class="station-card-text">
                <p class="station-card-name">${station.label}</p>
                <p class="station-card-town secondary-text">
                    <i class="fa-solid fa-location-dot"></i>
                    ${station.town || 'Unknown town'}
                </p>
            </div>
            <div class="station-card-data">
                <p class="station-card-reading">${readingValue}</p>
                ${heightWarning}
            </div>
        </li>
    `
}

fetch("https://environment.data.gov.uk/flood-monitoring/id/stations?status=Active")
    .then(res => res.json())
    .then(function(data) {
        riverNames = Array.from(new Set(
            data.items
                .map(station => station.riverName)
                .filter(riverName => riverName)
        ))
    })
    .catch( (error) => {
        selectedRiverStations.innerHTML = `<p>Something went wrong. Please try again.</p>`
        console.error(error)
    })

riverSearchBar.addEventListener('input', function(){
    const query = riverSearchBar.value.toLowerCase()
    const matches = riverNames.filter(name => name.toLowerCase().includes(query))
    renderSearchDropdown(matches)
})

searchClearBtn.addEventListener('click', function(){
    riverSearchBar.value = ""
    renderSearchDropdown([])
})

riverSearchBar.addEventListener('focus', () => riverSearchBar.value = "")

searchPredictions.addEventListener('click', function(e) {
    if (e.target.matches('li')) {
        const riverName = e.target.textContent
        selectedRiverStations.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i></div>`
        clearSearch()
        riverSearchBar.value = riverName

        fetch(`https://environment.data.gov.uk/flood-monitoring/id/stations?riverName=${encodeURIComponent(riverName)}`)
            .then(res => res.json())
            .then(function(data) {
                const stations = data.items.filter(station => station.riverName)

                Promise.all(
                    stations.map(function(station){
                        return fetch(station["@id"].replace("http://", "https://"))
                            .then(res => res.json())
                            .then(data => data.items)
                    })
                ).then(function(detailedStations) {
                    selectedRiverStations.innerHTML = detailedStations
                        .map(station => buildStationCardHTML(station))
                        .join('')
                })
                .catch( (error) => {
                    selectedRiverStations.innerHTML = `<p>Something went wrong. Please try again.</p>`
                    console.error(error)
                })
            })
            .catch( (error) => {
                selectedRiverStations.innerHTML = `<p>Something went wrong. Please try again.</p>`
                console.error(error)
            })
    }
})
