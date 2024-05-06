import './index.css'
import { DateTime } from 'luxon'
import { CronJob } from 'cron'

const parts = {
  hour: document.getElementById("hour"),
  minute: document.getElementById("minute"),
  second: document.getElementById("second"),
  day: document.getElementById("day"),
  date: document.getElementById("date"),
  timezone: document.getElementById("timezone"),
  indicator: document.getElementById("indicator"),
  progress: document.getElementById("progress")
}

/* const cronJobs = {
  hourly: {
    jobs: [
      async function () {
        // get sunrise and sunset times from some API
      }
    ],
    lastRun: undefined
  }
} */

let location

async function getLocation() {
  await navigator.geolocation.getCurrentPosition(setLocation, (error) => console.log(error))
}

function setLocation(pos) {
  location = [pos.latitude, pos.longitude]
  console.log(location)
  updateSunTimes()
}

function calculateDayPart(dateTime) {
  return dateTime.hour / 24 + (dateTime.minute / (24 * 60)) + (dateTime.second / (24 * 60 * 60))
}

function getCronTimeForEvery12HoursFromNow() {
  const now = DateTime.now()
  const hours = now.hour < 12 ? [now.hour, now.hour + 12] : [now.hour - 12, now.hour]
  return `${now.minute} ${hours.join(",")} * * *`
}

function updateSunTimes() {
  if (location === undefined) {
    return
  }

  console.info(`Updating sun times for ${location.lat}, ${location.lng}.`)
  const apiUrl = `https://api.sunrisesunset.io/json?lat=${location.lat}&lng=${location.lng}`
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      console.log(data.results)
      return {
        firstLight: DateTime.fromFormat(`${data.results.date} ${data.results.first_light}`, 'yyyy-MM-dd tt', { zone: data.results.timezone }),
        dawn: DateTime.fromFormat(`${data.results.date} ${data.results.dawn}`, 'yyyy-MM-dd tt', { zone: data.results.timezone }),
        sunrise: DateTime.fromFormat(`${data.results.date} ${data.results.sunrise}`, 'yyyy-MM-dd tt', { zone: data.results.timezone }),
        sunset: DateTime.fromFormat(`${data.results.date} ${data.results.sunset}`, 'yyyy-MM-dd tt', { zone: data.results.timezone }),
        dusk: DateTime.fromFormat(`${data.results.date} ${data.results.dusk}`, 'yyyy-MM-dd tt', { zone: data.results.timezone }),
        lastLight: DateTime.fromFormat(`${data.results.date} ${data.results.last_light}`, 'yyyy-MM-dd tt', { zone: data.results.timezone })
      }
    })
    .then(sunTimes => updateSunGraph(sunTimes))
    .catch(error => console.error('Error fetching sunrise and sunset data:', error))
}

function updateSunGraph(sunTimes) {
  console.log(sunTimes)

  const indicators = {
    firstLight: document.getElementById('first-light-indicator'),
    dawn: document.getElementById('dawn-indicator'),
    daytime: document.getElementById('daytime-indicator'),
    dusk: document.getElementById('dusk-indicator'),
    lastLight: document.getElementById('last-light-indicator')
  }

  const dayParts = {
    firstLight: calculateDayPart(sunTimes.firstLight),
    dawn: calculateDayPart(sunTimes.dawn),
    sunrise: calculateDayPart(sunTimes.sunrise),
    sunset: calculateDayPart(sunTimes.sunset),
    dusk: calculateDayPart(sunTimes.dusk),
    lastLight: calculateDayPart(sunTimes.lastLight)
  }

  indicators.firstLight.style.left = `${dayParts.firstLight * 100}%`
  indicators.firstLight.style.width = `${(dayParts.dawn - dayParts.firstLight) * 100}%`
  indicators.dawn.style.left = `${dayParts.dawn * 100}%`
  indicators.dawn.style.width = `${(dayParts.sunrise - dayParts.dawn) * 100}%`
  indicators.daytime.style.left = `${dayParts.sunrise * 100}%`
  indicators.daytime.style.width = `${(dayParts.sunset - dayParts.sunrise) * 100}%`
  indicators.dusk.style.right = `${(1 - dayParts.dusk) * 100}%`
  indicators.dusk.style.width = `${(dayParts.dusk - dayParts.sunset) * 100}%`
  indicators.lastLight.style.right = `${(1 - dayParts.lastLight) * 100}%`
  indicators.lastLight.style.width = `${(dayParts.lastLight - dayParts.dusk) * 100}%`
}

const cronJobs = [
  CronJob.from({
    cronTime: getCronTimeForEvery12HoursFromNow(),
    onTick: getLocation,
    start: true,
    runOnInit: true
  })
]

function tick() {
  const now = DateTime.now()

  // run cron jobs at the top of the hour
  // if minute == 0 and cron job hasn't run in the last 3600 seconds :
  // run cron job, store last run time


  // if (!cronJobs.hourly.lastRun) {

  // } else if (now.minute == 0 && now.toUnixInteger() - cronJobs.hourly.lastRun > 3600) {

  // }

  // run cron job on first run
  // if last run time is undefined :
  // run cron job

  parts.day.textContent = now.toFormat('ccc').toUpperCase()
  parts.date.textContent = now.toFormat('yyyy-LL-dd')
  parts.timezone.textContent = now.toFormat('ZZZZ')

  parts.hour.textContent = now.toFormat('HH')
  parts.minute.textContent = now.toFormat('mm')
  parts.second.textContent = now.toFormat('ss')

  parts.indicator.style.visibility = now.second % 2 == 0 ? "visible" : "hidden"

  const progress = calculateDayPart(now)
  parts.progress.classList.remove("hidden")
  parts.progress.style.left = `${progress * 100}%`

  setTimeout(tick, 1000 - now.millisecond)
}

document.body.addEventListener('click', () => {
  getLocation()
})

tick()