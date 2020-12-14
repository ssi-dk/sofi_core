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
    'spaced-comment': 'warn',
    'global-require': 'warn',
    'no-cond-assign': 'off',
    'linebreak-style': 'off',
    'no-nested-ternary': 'off',
    "jsx-a11y/no-noninteractive-element-interactions": "warn",
    'react/jsx-fragments': 'off',
    "react/jsx-props-no-spreading": "off",
    "react/require-default-props": "off",
    "react/prop-types": "off",
    "@typescript-eslint/ban-types": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-var-requires": "warn",
    "import/prefer-default-export": "warn",
    "react/destructuring-assignment": "warn",
    "no-param-reassign": "off",
    "import/prefer-default-export": "off",
    'prettier/prettier': [
      'off',
      {
        endOfLine: 'auto',
      },
    ],
  },
};