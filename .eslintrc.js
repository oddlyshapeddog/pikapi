module.exports = {
    extends: 'eslint:recommended',
    env: {
        es6: true,
        node: true,
        mocha: true
    },
    parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
            blockBindings: true,
            modules: true
        }
    },
    rules: {
        indent: [
            'error',
            2
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        quotes: [
            'error',
            'single',
            { allowTemplateLiterals: true }
        ],
        eqeqeq: [
            'error',
            'smart'
        ],
        semi: [
            'error',
            'never'
        ],
        'vars-on-top': 'error'
    }
}