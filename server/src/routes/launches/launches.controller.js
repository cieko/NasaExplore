
const {
  getAllLaunches,
  addNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
} = require('../../models/launches.model')

async function httpGetAllLaunches(req, res) {
  return res.status(200).json(await getAllLaunches())
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  // VALIDATION
  if (!launch.mission || !launch.rocket || !launch.launchDate || !launch.target) {
    return res.status(400).json({ error: 'Missing required launch property' }); // client errors (bad request)
  }

  launch.launchDate = new Date(launch.launchDate);
  // if (launch.launchDate.toString() === 'Invalid Date') {
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: 'Invalid launch date'
    })
  }

  // addNewLaunch(launch)
  await addNewLaunch(launch); // aligned with mongodb now
  console.log(launch)
  return res.status(201).json(launch) // created status
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);

  const existLaunch = await existsLaunchWithId(launchId)
  // return 404, if launch not found
  if (!existLaunch) {
    return res.status(404).json({
      error: 'Launch not found'
    })
  }

  const aborted = await abortLaunchById(launchId)
  if (!aborted) {
    return res.status(400).json({
      error: 'Failed to Abort the misson'
    }) // bad request
  }

  return res.status(200).json({
    ok: true
  })
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
}