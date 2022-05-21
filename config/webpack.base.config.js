import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default {
	mode: 'development',
	entry: {
		app: './src/index.js'
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, '../dist'),
		clean: true
	},
	module: {
		rules: [
			{
				test: /\.vue/,
				loader: 'vue-loader'
			},
			{
				test: /\.s?css$/,
				use: ['style-loader', 'css-loader', 'sass-loader']
			}
		]
	},
	resolve: {
		alias: {
			src: path.resolve(__dirname, '../src'),
			static: path.resolve(__dirname, '../static')
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'public/index.html'
		}),
		new VueLoaderPlugin()
	]
}
