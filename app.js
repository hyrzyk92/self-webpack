const fs = require('fs')
const parser = require('@babel/parser')
const options = require('./webpack.config')
const path = require('path')
const traverse = require('@babel/traverse').default
const { transformFromAst }  = require('@babel/core')

const Parser = {
    getAST: path => {
        const content = fs.readFileSync(path, 'utf-8')
        return parser.parse(content, {
            sourceType: 'module'
        })
    },
    getDependencies: (ast, filename) => {
        const dependencies = {}
        traverse(ast, {
            ImportDeclaration({ node }) {
                const dirname = path.dirname(filename)
                const filepath = './' + path.join(dirname, node.source.value)
                dependencies[node.source.value] = filepath
            }
        })
        return dependencies
    },
    getCode: ast => {
        const { code } = transformFromAst(ast, null, {
            presets: ['@babel/preset-env']
        })
        return code
    }
}

class Compiler {
    constructor(options) {
        const { entry, output } = options
        this.entry = entry
        this.output = output
        this.modules = []
    }

    run() {
        const o = this.build(this.entry)
        this.modules.push(o)
        for(let { dependencies } of this.modules) {
            if(dependencies) {
                for(let dependecy in dependencies) {
                    this.modules.push(this.build(dependencies[dependecy]))
                }
            }
        }
        const dependecyGraph = this.modules.reduce((graph, item) => ({
            ...graph,
            [item.filename]: {
                dependencies: item.dependencies,
                code: item.code
            }
        }), {})
        console.log('---------------这是dependecyGraph-----------')
        console.log(dependecyGraph)
        this.generate(dependecyGraph)
    }

    build(filename) {
        const { getAST, getDependencies, getCode } = Parser
        const ast = getAST(filename)
        const dependencies = getDependencies(ast, filename)
        const code = getCode(ast)
        console.log('-------------这是filename-------------')
        console.log(filename)
        console.log('-------------这是ast-------------')
        console.log(ast)
        console.log('---------这是dependencies---------------')
        console.log(dependencies)
        console.log('-------------这是code--------------')
        console.log(code)
        return {
            filename,
            dependencies,
            code,
        }
    }

    generate(graph) {
        const filepath = path.join(this.output.path, this.output.filename)
        const bundle = `(function(graph){
            function require(moduleId) {
                function localRequire(relativePath) {
                    return require(graph[moduleId].dependencies[relativePath])
                }
                var exports = {}
                ;(function(require, exports, code){
                    eval(code)
                })(localRequire, exports, graph[moduleId].code)
                return exports
            }
            require('${this.entry}')
        })(${JSON.stringify(graph)})`
        fs.writeFileSync(filepath, bundle, 'utf-8')
    }
}

new Compiler(options).run()