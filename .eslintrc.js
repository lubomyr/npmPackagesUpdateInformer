module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['react-hooks'],
  rules: {
    'prettier/prettier': 1,
    'react-hooks/exhaustive-deps': 0,
    'react/no-unstable-nested-components': 0,
    radix: 0,
  },
};
