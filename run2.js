#!/usr/bin/env node
var argv = require('yargs')
    .count('verbose')
    .alias('v', 'verbose')
    .argv;
 
VERBOSE_LEVEL = argv.verbose;
 
function WARN()  { VERBOSE_LEVEL >= 0 && console.log.apply(console, arguments); }
function INFO()  { VERBOSE_LEVEL >= 1 && console.log.apply(console, arguments); }
function DEBUG() { VERBOSE_LEVEL >= 2 && console.log.apply(console, arguments); }
 
WARN("Showing only important stuff");
INFO("Showing semi-important stuff too");
DEBUG("Extra chatty mode");

const main = require('./main')
const assert = require('assert')
const uuid = require('uuid')
const path = require('path')
const fs = require('fs')
const app = process.argv[2]
const title = process.argv[3]

const screenshotsDir = argv.screenshotsDir || 'screenshots'
const sessionId = uuid.v4()
const dir = path.join(process.cwd(), screenshotsDir, sessionId)

try {
    fs.mkdirSync(dir)
} catch (err) {
    console.error(err)
    process.exit(1)
}

//const screenshotById = (winId, dir, format) => screencapture(winId, dir, format)

function filterEmptyTitle(obj) {
    if (obj.title === '') return false
    return true
}

        // [ { winid: 2438,
        //     app: 'Google Chrome',
        //     title: 'Logfile by z-vr · Pull Request #1 · Sobesednik/browsershot',
        //     pid: 372 } ]

function getWindow(app, title, filterTitle) {
    return main.getWindows(app, title)
        .then(res => {
            if (filterTitle) {
                return res.filter(filterEmptyTitle)
            }
            return res
        })
        .then(res => {
            assert(Array.isArray(res))
            assert(res.length)
            return res
        })
        .then(res => res[0])
        .then(res => { console.log(res); return res; })
        .then(res => main.screenshotById(res.winid, dir))
        
        .then(console.log)
}

function getList(app, title, filterTitle) {
    return main.getWindows(app, title)
        .then(res => {
            if (filterTitle) {
                return res.filter(filterEmptyTitle)
            }
            return res
        })
        .then(console.log)
}

const fn = argv.capture ? getWindow : getList
const exec = fn.bind(null, argv.app, argv.title, !argv.all)

exec()

    
