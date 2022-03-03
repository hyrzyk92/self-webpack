(function(graph){
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
            require('./src/index.js')
        })({"./src/index.js":{"dependencies":{"./a.js":"./src\\a.js"},"code":"\"use strict\";\n\nrequire(\"./a.js\");\n\nconsole.log('这是入口文件');"},"./src\\a.js":{"dependencies":{"./b.js":"./src\\b.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.a = void 0;\n\nrequire(\"./b.js\");\n\nconsole.log('这是a');\nvar a = 1;\nexports.a = a;"},"./src\\b.js":{"dependencies":{},"code":"\"use strict\";\n\nconsole.log('这是b');"}})