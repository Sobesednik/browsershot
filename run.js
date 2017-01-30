const main = require('./main')
const path = require('path');
const assert = require('assert');
const uuid = require('uuid');
const fs = require('fs')
//async function runManyTimes(times, asyncFn) {
//    let index = 0
//    while (index < 5) 
//        await asyncFn.call()
//        console.log(res)
//        index++
//}
//const gen = runManyTimes();
try {
    assert(process.argv.length >= 4, 'node run Chrome google.com')
} catch (err) {
    console.log(err.message)
    process.exit(1)
}

const sessionId = uuid.v4()
const dir = path.join(__dirname, 'screenshots', sessionId)
try {
    fs.mkdirSync(dir)
} catch (err) {
    console.error(err)
    process.exit(1)
}

const winName = process.argv[2]
const title = process.argv[3]

const createMainPromise = (_dir, _winName, _title) => 
    main(_dir, _winName, _title, 'jpg')

const bindedCreateMainPromise = createMainPromise.bind(null, dir, winName, title)
const bindedGetWindows = main.getWindows.bind(null, winName, title)

const myIterable = {}

const N = 1
myIterable[Symbol.iterator] = function* () {
    yield bindedGetWindows()
    for (let i=0; i<N; i++) {
        yield bindedCreateMainPromise()
    }
}

//[...myIterable]
//runManyTimes.bind(null, 5, runAsync)
// function* () {
//    yield 1
//    yield 2
//    yield 3
//}
 console.time('main-5')

 for (let main of myIterable) {
     main
        .then(console.log)
        .catch(console.error)
 }

 console.timeEnd('main-5')

return

(async () => {
    try {
        const results = []
        for (let i=0; i<5; i++) {
            const res = await main(dir, winName, title, 'jpg')
            results.push(res)
        }
        console.log(results)
    } catch (err) {
        console.error(err)
    }
})()

