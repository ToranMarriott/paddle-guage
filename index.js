let availableRivers = []

const riverSearchBar = document.getElementById("river-search-bar")
const searchPredictions = document.getElementById("search-predictions")
const selectedRiverStations = document.getElementById("station-container")
const searchDropdown = document.getElementById("search-dropdown")
const searchDeleteBtn = document.getElementById("river-search-delete-btn")

fetch("https://environment.data.gov.uk/flood-monitoring/id/stations?status=Active")
    .then(res => res.json())
    .then(function(data) {
        availableRivers = Array.from(new Set(
            data.items
                .map(station => station.riverName)
                .filter(riverName => riverName)
        ))
    })

riverSearchBar.addEventListener('input', function(){
    const query = riverSearchBar.value.toLowerCase()
    const matches = availableRivers.filter(name => name.toLowerCase().includes(query))
    renderPredictedSearch(matches)
})

searchDeleteBtn.addEventListener('click', function(){
    riverSearchBar.value = ""
    renderPredictedSearch()
})

function renderPredictedSearch(possibleRivers) {
    if (riverSearchBar.value.length > 1) {
        searchDropdown.classList.remove('hidden')
        searchPredictions.innerHTML = possibleRivers
            .map(river => `<li class="river-card">${river}</li>`)
            .join('')
    } else {
        clearSearch()
    }
}

searchPredictions.addEventListener('click', function(e) {
    const riverName = e.target.textContent

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
                    .map(station => stationCardHtml(station))
                    .join('')
                clearSearch()
                riverSearchBar.value = ""
            })
        })
})

function clearSearch() {
    searchPredictions.innerHTML = ""
    searchDropdown.classList.add('hidden')
}

function stationCardHtml(station) {
    const measures = normaliseMeasures(station.measures)
    const validMeasure = findValidMeasure(measures)
    const readingValue = formatReadingValue(validMeasure)
    const typicalHigh = station.stageScale?.typicalRangeHigh
    const typicalLow = station.stageScale?.typicalRangeLow
    const heightWarning = formatHeightWarning(typicalHigh, typicalLow, validMeasure?.latestReading.value) 
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

function normaliseMeasures(measuresRaw){
    if (!measuresRaw){
        return []
    } else if (Array.isArray(measuresRaw)){
        return measuresRaw
    } else if (!Array.isArray(measuresRaw)){
        return [measuresRaw]
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
        return `${validMeasure.latestReading.value}m<sup>3</sup>/s`
    } else if (validMeasure && (
        validMeasure.unitName === "m" || 
        validMeasure.unitName === "mASD" || 
        validMeasure.unitName === "mAOD"
    )){
        return `${validMeasure.latestReading.value}m`
    } else {
        return "No reading"
    }
}

function formatHeightWarning(typicalHigh, typicalLow, readingValue){
    if ((readingValue && typicalHigh) && readingValue >= typicalHigh){
        return `<p class="high-warning-badge warning-badge"><i class="fa-solid fa-triangle-exclamation"></i> High</p>`
    } else if ((readingValue && typicalHigh) && ((typicalHigh - readingValue) <= (typicalHigh / 10))){
        return `<p class="nearly-high-warning-badge warning-badge"><i class="fa-solid fa-arrow-up"></i> Nearly High</p>`
    } else if ((readingValue && typicalLow) && readingValue <= typicalLow){
        return `<p class="low-warning-badge warning-badge"><i class="fa-solid fa-droplet-slash"></i> Low</p>`
    } else if ((readingValue && typicalLow) && ((readingValue - typicalLow) <= (typicalLow / 10))){
        return `<p class="nearly-low-warning-badge warning-badge"><i class="fa-solid fa-arrow-down"></i> Nearly Low</p>`
    } else if (!typicalLow && !typicalHigh) {
        return ``
    } else {
        return `<p class="normal-warning-badge warning-badge"><i class="fa-solid fa-water"></i> Normal</p>`
    }
}