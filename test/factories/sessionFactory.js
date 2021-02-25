const {Buffer} = require('safe-buffer')
const Keygrip = require('keygrip')
const {cookieKey} = require('../../config/keys')
const keygrip = new Keygrip([cookieKey])

module.exports = (user) => {
    const sessionObject = {passport: {user: user._id}}
    const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64')
    const sessionSignature = keygrip.sign(`session=${sessionString}`)
    return {sessionString, sessionSignature}
}