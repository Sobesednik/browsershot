const path = require('path')
const cp = require('child_process')
const uuid = require('uuid')
const assert = require('assert')
const debug = require('debug')('main')

const pyPath = path.join(__dirname, 'etc', 'run.py')

function getWindowsWithPython() {
    return new Promise((resolve, reject) => {
        const python = cp.spawn('python', [pyPath])
        const data = []
        python.stdout.on('data', (chunk) => {
            data.push(String(chunk))
        })
        // python.stderr.pipe(process.stderr)
        python.on('exit', () => resolve(data.join()))
    })
        .then(JSON.parse)
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





