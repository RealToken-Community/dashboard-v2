const nextCoreWebVitals = require('eslint-config-next/core-web-vitals')
const tsEslintPlugin = require('@typescript-eslint/eslint-plugin')
const eslintConfigPrettier = require('eslint-config-prettier')

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.pnp/**',
      '.pnp.js',
      'coverage/**',
      '.next/**',
      'out/**',
      'build/**',
      '.DS_Store',
      '*.pem',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      '.pnpm-debug.log*',
      '.env*.local',
      '.vercel/**',
      '*.tsbuildinfo',
      'src/abis/**',
      'src/types/**',
    ],
  },
  ...nextCoreWebVitals,
  ...tsEslintPlugin.configs['flat/recommended'],
  eslintConfigPrettier,
  {
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
      'object-shorthand': 'off',
      'react/jsx-curly-brace-presence': ['warn', 'always'],
      'react/jsx-boolean-value': ['warn', 'always'],
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/use-memo': 'off',
    },
  },
]