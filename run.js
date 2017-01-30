const main = require('./main')
const path = require('path');

(async () => {

    const winName = process.argv[2]
    const title = process.argv[3]
    const dir = path.join(__dirname, 'screenshots')
    try {
        const res = await main(dir, winName, title, 'jpg')
        console.log(res)
    } catch (err) {
        console.error(err)
    }
})()

