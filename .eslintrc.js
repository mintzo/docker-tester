module.exports = {
  env: {
    es6: true
  },
  extends: ['node', 'airbnb-base'],
  rules: {
    'import/no-commonjs': false,
    'no-console': 0,
    'eqeqeq': 0,
    'no-use-before-define': 0,
    'object-curly-newline': ['error', { 'minProperties': 6 }],
    'max-len': ['warn', 140, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }]
  }
}
