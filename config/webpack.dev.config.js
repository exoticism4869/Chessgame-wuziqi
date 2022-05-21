import { merge } from 'webpack-merge'
import common from './webpack.base.config.js'

export default merge(common, {
	mode: 'development',
	devtool: 'inline-source-map',
	devServer: {
		static: '../dist'
	}
})
