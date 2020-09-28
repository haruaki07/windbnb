const production = !process.env.ROLLUP_WATCH;

module.exports = {
	future: {
		removeDeprecatedGapUtilities: true,
		purgeLayersByDefault: true,
	},
	purge: {
		enabled: production, // npm run dev (false), npm run build (true)
		content: ["./src/**/*.html", "./src/**/*.svelte"],
	},
	theme: {
		fontFamily: {
			sans: ["Montserrat", "sans-serif"],
		},
	},
	variants: { 
		backgroundColor: ["responsive", "hover", "focus", "active"] 
	},
	plugins: [],
};