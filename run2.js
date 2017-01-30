const main = require('./main')
const assert = require('assert')
const uuid = require('uuid')
const path = require('path')
const fs = require('fs')
const app = process.argv[2]
const title = process.argv[3]

function filterEmptyTitle(obj) {
    if (obj.title === '') return false
    return true
}

const sessionId = uuid.v4()
const dir = path.join(__dirname, 'screenshots', sessionId)

try {
    fs.mkdirSync(dir)
} catch (err) {
    console.error(err)
    process.exit(1)
}

//const screenshotById = (winId, dir, format) => screencapture(winId, dir, format)

return main.getWindows(app, title)
    .then(res => res.filter(filterEmptyTitle))
    // [ { winid: 2438,
    //     app: 'Google Chrome',
    //     title: 'Logfile by z-vr · Pull Request #1 · Sobesednik/browsershot',
    //     pid: 372 } ]
	.then(res => {
		assert(Array.isArray(res))
		assert(res.length)
		return res
	})
    .then(res => res[0])
    .then(res => main.screenshotById(res.winid, dir))
    
    .then(console.log)
    
