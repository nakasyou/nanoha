const { mikanUI } = require("mikanui")

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [
    mikanUI({
      seedColor: '#f0e22f',
    }),
		require('@tailwindcss/typography')
  ],
}
