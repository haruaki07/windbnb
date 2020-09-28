const production = !process.env.ROLLUP_WATCH;

module.exports = {
	plugins: [
		require("tailwindcss"),
		production ? require('autoprefixer') : null,
	],
};
