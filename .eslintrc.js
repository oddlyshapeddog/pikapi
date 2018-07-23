module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:react/recommended'
    ],
    env: {
        es6: true,
        node: true,
        mocha: true
    },
    parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
            blockBindings: true,
            modules: true,
            jsx: true
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
    },
    settings: {
        react: {
            createClass: 'createReactClass', // Regex for Component Factory to use,
            // default to 'createReactClass'
            pragma: 'React', // Pragma to use, default to 'React'
            version: '15.0', // React version, default to the latest React stable release
            flowVersion: '0.53' // Flow version
        },
        propWrapperFunctions: ['forbidExtraProps'] // The names of any functions used to wrap the
        // propTypes object, e.g. `forbidExtraProps`.
        // If this isn't set, any propTypes wrapped in
        // a function will be skipped.
    }
}