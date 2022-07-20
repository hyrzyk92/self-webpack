const path = require('path')
const APlugin = require('./APlugin.js')

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'main.js'
    },
    plugins: [
        new APlugin()
    ]
}
