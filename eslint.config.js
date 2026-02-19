const { FlatCompat } = require('@eslint/eslintrc')

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

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
  ...compat.config({
    extends: [
      'next/core-web-vitals',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
      'object-shorthand': 'off',
      'react/jsx-curly-brace-presence': ['warn', 'always'],
      'react/jsx-boolean-value': ['warn', 'always'],
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  }),
]
