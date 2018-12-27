module.exports = {
  env: {
    mocha: true
  },
  rules:{
    'no-unused-vars':0,
    'no-unused-expressions':0,
    'max-len': ['warn', 250, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }]
  }
}