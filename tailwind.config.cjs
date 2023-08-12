const { argbFromHex, themeFromSourceColor, applyTheme, hexFromArgb } = require("@material/material-color-utilities")
const tailwindPlugin = require("tailwindcss/plugin")

const materialColorPlugin = (baseColor) => {
  const theme = themeFromSourceColor(argbFromHex(baseColor))
  const props = Object.keys(theme.schemes.light.props)
  const classes = props.map(prop => prop.replace(/[A-Z]/g, l => '-' + l.toLowerCase()))
  const lightComponents = Object.assign(
    Object.fromEntries(classes.map((query, index) => ['.bg-' + query, { 'background-color': hexFromArgb(theme.schemes.light[props[index]]) }])),
    Object.fromEntries(classes.map((query, index) => ['.text-' + query, { 'color': hexFromArgb(theme.schemes.light[props[index]]) }]))
  )
  const darkComponents = Object.assign(
    Object.fromEntries(classes.map((query, index) => ['.bg-' + query, { 'background-color': hexFromArgb(theme.schemes.dark[props[index]]) }])),
    Object.fromEntries(classes.map((query, index) => ['.text-' + query, { 'color': hexFromArgb(theme.schemes.dark[props[index]]) }]))
  )
  const components = {
    '@media (prefers-color-scheme: dark)': darkComponents,
    '@media (prefers-color-scheme: light)': lightComponents,
  }
  return tailwindPlugin(({ addComponents }) => {
    addComponents(components)
  })
}

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [
    materialColorPlugin('#f0e22f'),
  ],
}
