// const colors = require('tailwindcss/colors')

module.exports = {
  content: ['index.html', './src/**/*.{js,jsx,ts,tsx,vue,html}'],
  theme: {
    extend: {
      fontFamily: {
        led7: 'DSEG7-Classic',
        led14: 'DSEG14-Classic'
      },
      dropShadow: {
        glow: '0px 0px 4px rgb(135 255 195 / 40%)'
      }
    },
  },
  plugins: [],
}
