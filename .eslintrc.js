module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'node': true
  },
  'extends': 'eslint:recommended',
  'parser': '@babel/eslint-parser',
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module'
  },
  'overrides': [
    {
      'files': ['packages/**/test/**/*.js', 'packages/**/test/*.js'],
      'globals': {
        'test': 'readonly',
        'expect': 'readonly',
        'describe': 'readonly',
        'jest': 'readonly',
        'it': 'readonly',
        'beforeEach': 'readonly',
        'beforeAll': 'readonly'
      }
    }
  ],
  'rules': {
    'no-console': ['error', { allow: ['warn', 'error']}],
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ]
  }
};
