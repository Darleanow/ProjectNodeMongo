module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
    jest: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'prefer-arrow'],
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'off',
    'quotes': ['warn', 'single'],
    'semi': ['warn', 'never'],
    'linebreak-style': 'off',
    'no-underscore-dangle': ['error', { allow: ['__dirname', '__filename'] }],
    'prefer-arrow/prefer-arrow-functions': [
      'error',
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false
      }
    ],
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': [
      'off',
      {
        devDependencies: false,
        optionalDependencies: false,
        peerDependencies: false
      }
    ]
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  }
}
