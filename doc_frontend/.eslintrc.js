module.exports = {
    // 为我们提供运行环境，一个环境定义了一组预定义的全局变量
    "env": {
        "browser": true,
        "node": true,
        "es6": true
    },
    // 一个配置文件可以被基础配置中的已启用的规则继承。
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        // "plugin:prettier/recommended"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true,
            "experimentalObjectRestSpread": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "settings":  {
        "version": "detect"
    },
    "rules": {
        "react/prop-types": 0,
        "react/no-children-prop": 0
    }
};