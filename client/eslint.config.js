import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  // Override for project config files to allow Node globals
  {
    files: ['tailwind.config.js', 'vite.config.js'],
    languageOptions: {
      globals: { require: 'readonly', __dirname: 'readonly' },
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        process: 'readonly', // allow process.env in code
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-unused-vars': 'off', // disable unused var errors
      'react-hooks/exhaustive-deps': 'off', // disable missing deps warnings
      'react/prop-types': 'off', // disable prop-types validation rules globally
      'react/jsx-key': 'off', // disable missing key errors
      'react/no-unknown-property': 'off', // disable unknown property errors for cmdk attributes
      'react/no-unescaped-entities': 'off', // disable unescaped entities errors
    },
  },
]
