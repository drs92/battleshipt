var path = require('path');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var MiniCSSExtractPlugin = require('mini-css-extract-plugin');
var OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './client/src/main.ts',
    optimization: {
        minimizer: [
            new UglifyJSPlugin({
                cache: true,
                parallel: true,
                sourceMap: true
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    output: {
        path: path.resolve(__dirname, 'client'),
        filename: 'dist/app.js'
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
    },
    plugins: [
        new MiniCSSExtractPlugin({
            filename: 'dist/app.css'
        })
    ],
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: path.resolve(__dirname, 'client'),
                use: [
                    'awesome-typescript-loader'
                ]
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                use: [
                    'source-map-loader'
                ]
            },
            {
                test: /\.s?[ac]ss$/,
                use: [
                    MiniCSSExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ]
            }
        ]
    }
}