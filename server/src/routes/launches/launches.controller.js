
const {
  // launches
  getAllLaunches,
  addNewLaunch,
} = require('../../models/launches.model')

function httpGetAllLaunches(req, res) {
  // return res.status(200).json(Array.from(launches.values()))
  return res.status(200).json(getAllLaunches())
}

function httpAddNewLaunch(req, res) {
  const launch = req.body;

  launch.launchDate = new Date(launch.launchDate);

  addNewLaunch(launch)
  return res.status(201).json(launch) // created status
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
}