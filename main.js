const path = require('path')
const cp = require('child_process')
const uuid = require('uuid')
const assert = require('assert')
const debug = require('debug')('main')
const fs = require('fs')
const Writable = require('stream').Writable;

const pyPath = path.join(__dirname, 'etc', 'run.py')

const logfile = path.join(__dirname, 'logs', `stdout-${Date.now()}).log`)
const logfile2 = path.join(__dirname, 'logs', `stderr-${Date.now()}.log`)
const logWriteStream = fs.createWriteStream(logfile)
const logWriteStream2 = fs.createWriteStream(logfile2)

function spawnPython(resolve) {
    const python = cp.spawn('python', [pyPath])
    const data = []
    
    // python.stdout.pipe(logWriteStream)
    // python.stderr.pipe(logWriteStream2)
    
    const writable = new Writable()
    writable._write = (chunk, encoding, callback) => {
        // process.stderr.write(chunk)
        debug('>>> ========')
        debug(String(chunk).trim())
        debug('pushing chunk >>>')
        data.push(String(chunk).trim())
        callback(null)
    }
    // python.stderr.pipe(process.stderr)

    python.stdout
        .pipe(writable)
    
    // python.stdout.pipe(process.stderr)
        //.pipe(es.mapSync(function(data) {
  //      }))
    //apython.stdout.on('data', (chunk) => {
    //    data.push('python stdout', String(chunk))
    //    debug(String(chunk))
    //})
    //python.stderr.on('data', (chunk) => {
    //    debug('python stderr', String(chunk))
    //})
    // python.stderr.pipe(process.stderr)
    python.on('exit', () => resolve(data.join()))
}

function getWindowsWithPython() {
    return new Promise((resolve, reject) => {
        return spawnPython(resolve);
    })
        .then(JSON.parse)
        .catch((err) => { 
            console.error(err);
            throw err;
        })
}

function screencapture(windowId, dir, format) {
    assert(windowId)
    assert(dir)
    const extension = typeof format === 'string' ? format : 'png'
    const allowedFormats = ['jpg', 'png']
    assert(allowedFormats.indexOf(extension) !== -1, 'Format not allowed.')
    
    const filename = path.join(dir, uuid.v4())
    const fullFilename = `${filename}.${extension}`
    debug(fullFilename)

    const customArgs = []
    if (format) {
        customArgs.push('-t')
        customArgs.push(extension)
    }
    const args = [`-l${windowId}`, fullFilename]
    const allArgs = [].concat(customArgs, args)
    debug(allArgs)
    
    return new Promise((resolve, reject) => {
        const screencapture = cp.spawn('screencapture', allArgs)
        const data = []
        screencapture.stdout.on('data', (chunk) => {
            data.push(String(chunk))
        })
        screencapture.stdout.pipe(process.stdout)
        screencapture.stderr.pipe(process.stderr)
        screencapture.on('exit', () => resolve(fullFilename))
    })
}
function parseArray(arr) {
    return {
        winid: arr[0],
        app: arr[1],
        title: arr[2],
        pid: arr[3],
    }
}


function getWindows(app, title) {
    return getWindowsWithPython()
        .then(windows => windows.map(parseArray))
        .then(windowsAsObjects => windowsAsObjects
            .filter((win) => {
                if (typeof app !== 'string') return true
                return win.app.toLowerCase().indexOf(app.toLowerCase()) !== -1
            })
            .filter((win) => {
                if (typeof title !== 'string') return true
                return win.title.toLowerCase().indexOf(title.toLowerCase()) !== -1
            })
        )
}


function main(dir, winName, title, format) {
    assert(dir)
    const screenshots = []
    return getWindows(winName, title)
        .then((res) => {
            assert(res.length, 'No windows found')
            debug('Found windows:', res)
            return Promise.all(res.map(win => 
                screencapture(win.winid, dir, format)
            ))
        })
}

module.exports = main

main.getWindows = (app, title) => getWindows(app, title)
main.screenshotById = (winId, dir, format) => screencapture(winId, dir, format)





