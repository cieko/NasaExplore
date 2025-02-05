// const path = require('path');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan')

const api = require('./routes/v1Router')

const app = express();

app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(morgan('combined'));

app.use(express.json()); // parse the response body
// app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/v1', api)
// api.use('/v2', api)

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
// })


module.exports = app;