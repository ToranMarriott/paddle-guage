# 💧 PaddleGauge

A real-time river level monitoring app built for paddlers — kayakers, canoeists, paddleboarders and anyone who needs to know what a river is doing before they get on the water. [Live demo](https://paddlegauge.netlify.app)

## What it does

PaddleGauge lets you search for any river in England and quickly see the monitoring stations along it, including the latest water level readings and a plain-English status badge showing whether the river is running high, normal, or low.

Data is sourced from the [Environment Agency's Real Time flood-monitoring API](https://environment.data.gov.uk/flood-monitoring/doc/reference).

## Features

- **River search** with live autocomplete across all active monitoring stations in England
- **Station cards** showing the latest reading for each station in metres or m³/s
- **5-state status badges** — High, Nearly High, Normal, Nearly Low, Low — calculated against the Environment Agency's typical range data for each station
- Clean dark UI designed for quick at-a-glance use

## Tech

Vanilla JavaScript, HTML, CSS. No frameworks or build tools — just a frontend making direct calls to a public API.

## Roadmap

PaddleGauge is an early build. Improvements are already well underway, with a longer-term vision to become the go-to knowledge platform for paddlers — not just a gauge viewer, but a place where community experience is attached to river levels.

### In progress

- **Desktop and tablet view** - expand beyond mobile-first to serve desktop and tablet users
- **Backend with scheduled data fetching** — a server will fetch and cache data every 15 minutes, matching the API's update frequency, significantly improving load times for rivers with many stations
- **Altitude-based station ordering** — stations ordered source to sea using elevation data, giving a more intuitive picture of how a river is running along its length
- **Reading trend indicator** — a trajectory arrow showing whether a station's level is rising or falling based on recent readings
- **Improved measure selection** — smarter logic to always surface the most relevant reading type for paddlers
- **Interactive mapping** — plot river gauges on a map and allow users to select gauges directly
- **Expansion** - expand to cover the entire UK by fetching Welsh, Scottish and Northern Irish APIs

### Coming next: 
#### 1) Make it useful for paddlers

- Level history graphs (last 24h / 7 days)
- Save favourite gauges
- Go into gauges on a river for a more detailed view of the data

#### 2) Paddler intelligence

This is where PaddleGauge really starts to differentiate. The goal is to attach paddler knowledge to gauge levels:

- Log paddle sessions and attach ratings to a gauge level ("1.4m – perfect level", "1.8m – pushy")
- Push notifications to collect the data 
- Collate paddling behaviour data from these ratings
- Hazard reports — downed trees, broken weirs, and access issues that display for set time periods
- Community level comments and recommended runnable ranges

#### 3) Smart features

- Level alerts — notify when a river reaches a runnable level or when it is approaching empty or flood
- Rainfall correlation — show upstream rainfall data
- Level forecasts based on recent trends
- Personal paddling history
- Location sharing as a safe paddling feature

#### 4) Community layer

- User accounts
- River condition reports and community photos
- Hazard warning updates and comments
- Recommended lines and portages

This is the long-term plan for the product — paddler knowledge attached to levels that anyone can pull from a public API, but no one else has.

#### 5) Premium (if commercialised)

A freemium model: free tier covers gauges and basic levels, paid tier unlocks alerts, history, forecasts and trip planning tools.

## The vision

> *"Strava meets weather and river level planning for paddlers."*

A place to check levels, conditions, hazards, session history and community reports — all in one place.

## Data attribution

This app uses Environment Agency flood and river level data from the real-time data API (Beta).
