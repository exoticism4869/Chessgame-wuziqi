import { merge } from 'webpack-merge'
import common from './webpack.base.config.js'

export default merge(common, {
	mode: 'production'
})
