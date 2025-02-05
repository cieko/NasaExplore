const launchesDatabase = require('./launches.mongo')
const planets = require('./planets.mongo')

const DEFAULT_FLIGHT_NUMBER = 100;
const launches = new Map()

// let latestFlightNumber = 100 // last flight Number that was scheduled

const launch = {
  flightNumber: 100,
  mission: 'Kepler Exploration X',
  rocket: 'Explorer IS1',
  launchDate: new Date('December 27, 2030'),
  target: 'Kepler-442 b',
  customers: ['ZTM', 'NASA'],
  upcoming: true,
  success: true
};

// launches.set(launch.flightNumber, launch) // indexing using flightNumber
saveLaunch(launch)

async function existsLaunchWithId(launchId) {
  // return launches.has(launchId)
  return await launchesDatabase.findOne({
    flightNumber: launchId,
  })
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase
      .findOne() // return the first document
      .sort('-flightNumber'); // criteria to sort in asc order

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches() {
  // return Array.from(launches.values())
  return await launchesDatabase
      .find({}, { '_id': 0, '__v': 0 }) // exculde id and version
}

async function saveLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target
  })

  if (!planet) {
    throw new Error('No matching planet was found') // built in node error class
  }

  await launchesDatabase.findOneAndUpdate({
    flightNumber: launch.flightNumber, // check for the document already exists or not
  }, launch,
  { upsert: true }); // if not then insert
}

async function scheduleNewLaunch(launch) {

  const newFlightNumber = await getLatestFlightNumber() + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['ZTM', 'NASA'],
    flightNumber: newFlightNumber
  });

  await saveLaunch(newLaunch);
}

// function addNewLaunch(launch) {
//   latestFlightNumber += 1;
//   launches.set(
//     latestFlightNumber, 
//     Object.assign(launch, {
//       customers: ['ZTM', 'NASA'],
//       upcoming: true,
//       success: true,
//       flightNumber: latestFlightNumber,
//     })
//   )
// }

async function abortLaunchById(launchId) {
  // launch.delete(launchId) --> completely remove

  // const aborted = launches.get(launchId)
  // aborted.upcoming = false
  // aborted.success = false

  // return aborted

  const aborted = await launchesDatabase.updateOne({
    flightNumber: launchId
  }, {
    upcoming: false,
    success: false
  });

  // return aborted.ok === 1 && aborted.nModified === 1; // for mongodb version less than 6
  return aborted.modifiedCount === 1; // mongodb version 6 and above (FEB 2025)
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  addNewLaunch: scheduleNewLaunch,
  abortLaunchById,
}