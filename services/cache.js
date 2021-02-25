const mongoose = require('mongoose')
const redis = require('redis')
const {promisify} = require('util')
const {redisURL} = require('../config/keys')

const client = redis.createClient(redisURL)
const originalExec = mongoose.Query.prototype.exec

client.hget = promisify(client.hget)
client.hset = promisify(client.hset)

mongoose.Query.prototype.cache = function (options = {}) {
    this.makeCash = true
    this.hashKey = JSON.stringify(options.key || '')
    return this
}

mongoose.Query.prototype.exec = async function () {
    if(!this.makeCash) {
        return originalExec.apply(this, arguments)
    }
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }))
    const cacheValue = await client.hget(this.hashKey, key)
    if (cacheValue) {
        console.log('Served from cache.')
        const val = JSON.parse(cacheValue)
        return Array.isArray(val) ? val.map(v => new this.model(v)) : new this.model(val)
    }
    const queryResult = await originalExec.apply(this, arguments)
    await client.hset(this.hashKey, key, JSON.stringify(queryResult))
    return queryResult
}

exports.clearHash = function (hashKey) {
    client.del(JSON.stringify(hashKey))
}