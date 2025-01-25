const launches = new Map()

let latestFlightNumber = 100 // last flight Number that was scheduled

const launch = {
  flightNumber: 100,
  mission: 'Kepler Exploration X',
  rocket: 'Explorer IS1',
  launchDate: new Date('December 27, 2030'),
  target: 'Kepler-442 b',
  customer: ['ZTM', 'NASA'],
  upcoming: true,
  success: true
};

launches.set(launch.flightNumber, launch) // indexing using flightNumber

function existsLaunchWithId(launchId) {
  return launches.has(launchId)
}

function getAllLaunches() {
  return Array.from(launches.values())
}

function addNewLaunch(launch) {
  latestFlightNumber += 1;
  launches.set(
    latestFlightNumber, 
    Object.assign(launch, {
      customer: ['ZTM', 'NASA'],
      upcoming: true,
      success: true,
      flightNumber: latestFlightNumber,
    })
  )
}

function abortLaunchById(launchId) {
  // launch.delete(launchId) --> completely remove

  const aborted = launches.get(launchId)
  aborted.upcoming = false
  aborted.success = false

  return aborted
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
}