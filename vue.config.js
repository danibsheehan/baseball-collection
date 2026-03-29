/** @type {import('@vue/cli-service').ProjectOptions} */
module.exports = {
	devServer: {
		proxy: {
			'/teams': {
				target: 'http://127.0.0.1:3000',
				changeOrigin: true
			},
			'/players': {
				target: 'http://127.0.0.1:3000',
				changeOrigin: true
			},
			'/people': {
				target: 'http://127.0.0.1:3000',
				changeOrigin: true
			}
		}
	}
};
