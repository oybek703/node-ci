jest.setTimeout(120000)
const mongoose = require('mongoose')
const {mongoURI} = require('../config/keys')
require('../models/User')

mongoose.Promise = global.Promise
mongoose.connect(mongoURI, {useMongoClient: true})
