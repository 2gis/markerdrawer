var path = require('path');
var webpack = require('webpack');

module.exports = {
    devtool: 'source-map',
    entry: './src/index.ts',
    output: {
        filename: 'markerdrawer.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/',
        libraryTarget: 'commonjs'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins:[
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true
        })
    ]
};