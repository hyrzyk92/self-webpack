const path = require('path')

const dirname = path.dirname('./src/index.js')

const filepath = path.join(dirname, './app.js')

console.log(filepath)