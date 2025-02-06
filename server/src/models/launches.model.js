const launchesDatabase = require('./launches.mongo')
const planets = require('./planets.mongo')
const axios = require('axios')

const DEFAULT_FLIGHT_NUMBER = 100;
// const launches = new Map()

// let latestFlightNumber = 100 // last flight Number that was scheduled

// const launch = {
//   flightNumber: 100, // flight_number
//   mission: 'Kepler Exploration X',  // name
//   rocket: 'Explorer IS1',  // rocket.name
//   launchDate: new Date('December 27, 2030'), // date_local
//   target: 'Kepler-442 b', // NA
//   customers: ['ZTM', 'NASA'], // payload.customers
//   upcoming: true, // upcoming
//   success: true // success
// };

// launches.set(launch.flightNumber, launch) // indexing using flightNumber
// saveLaunch(launch)

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query"

async function populateLaunches() {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1
          }
        },
        {
          path: 'payloads',
          select: {
            'customer': 1
          }
        }
      ]
    }
  })

  if (response.status !== 200) {
    console.log('Problem downloading launch data')
    throw new Error('Launch data download failed')
  }

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads']
    const customer = payloads.flatMap((payload) => {
      return payload['id']
    })

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customer
    }

    console.log(launch)

    // TODO: populate launches collection
    await saveLaunch(launch)
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat'
  })

  if (firstLaunch) {
    console.log('Launch data already loaded')
  } else {
    await populateLaunches()
  }
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter)
}

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

async function getAllLaunches(skip, limit) {
  // return Array.from(launches.values())
  return await launchesDatabase
      .find({}, { '_id': 0, '__v': 0 }) // exculde id and version
      .sort({ flightNumber: -1 }) // latest first
      .skip(skip) // skip documents
      .limit(limit); // limit of documents to be sent
}

async function saveLaunch(launch) {
  // const planet = await planets.findOne({
  //   keplerName: launch.target
  // })

  // if (!planet) {
  //   throw new Error('No matching planet was found') // built in node error class
  // }

  await launchesDatabase.findOneAndUpdate({
    flightNumber: launch.flightNumber, // check for the document already exists or not
  }, launch,
  { upsert: true }); // if not then insert
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target
  })

  if (!planet) {
    throw new Error('No matching planet was found') // built in node error class
  }

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
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  addNewLaunch: scheduleNewLaunch,
  abortLaunchById,
}