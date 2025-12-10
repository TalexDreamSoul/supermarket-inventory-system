import antfu from '@antfu/eslint-config'

export default antfu(
  {
    unocss: true,
    formatters: true,
    pnpm: true,
  },
  {
    rules: {
      'unocss/order': 'off',
      'unocss/order-attributify': 'off',
    },
  },
)
