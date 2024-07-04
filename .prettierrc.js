module.exports = {
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  jsxSingleQuote: true,
  semi: false,
  endOfLine: 'auto',

  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
  importOrder: [
    '^react',
    '^next',
    '^@(.*)$',
    '^i18next(.*)',
    '^(?!(src|../|./))(.*)',
    '^src(.*)$',
    '^(.*)$'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
