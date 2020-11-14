module.exports = {
  extends: [
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],
  plugins: ['react', '@typescript-eslint', 'jest'],
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    'linebreak-style': 'off',
    'no-nested-ternary': 'off',
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/no-noninteractive-element-interactions": "warn",
    "react/jsx-props-no-spreading": "warn",
    "react/require-default-props": "off",
    "react/prop-types": "off",
    "@typescript-eslint/ban-types": "warn",
    "import/prefer-default-export": "warn",
    "react/destructuring-assignment": "warn",
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
};