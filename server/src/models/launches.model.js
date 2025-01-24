const launches = new Map()

let latestFlightNumber = 100 // last flight Number that was scheduled

const launch = {
  flightNumber: 100,
  mission: 'Kepler Exploration X',
  rocket: 'Explorer IS1',
  launchDate: new Date('December 27, 2030'),
  destination: 'Kepler-442 b',
  customer: ['ZTM', 'NASA']
};

launches.set(launch.flightNumber, launch) // indexing using flightNumber

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

module.exports = {
  getAllLaunches,
  addNewLaunch,
}