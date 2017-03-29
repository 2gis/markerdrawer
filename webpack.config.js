const webpack = require('webpack');
const path = require('path');

const env = process.env.NODE_ENV
const config = {
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
    }
};

switch (env) {
    case 'production':
        Object.assign(config, {
            devtool: 'source-map',
            entry: './src/index.ts',
            output: {
                filename: 'markerdrawer.js',
                path: path.resolve(__dirname, 'dist'),
                publicPath: '/dist/',
                libraryTarget: 'commonjs'
            },
            plugins:[
                new webpack.optimize.UglifyJsPlugin({
                    sourceMap: true
                })
            ]
        });
        break;
    case 'demo':
        Object.assign(config, {
            devtool: 'source-map',
            entry: './demo/index.ts',
            output: {
                filename: 'demo.js',
                path: path.resolve(__dirname, 'dist'),
                publicPath: '/dist/'
            }
        });
        break;
    default:
        Object.assign(config, {
            devtool: 'eval-source-map',
            entry: './demo/index.ts',
            output: {
                filename: 'demo.js',
                path: path.resolve(__dirname, 'dist'),
                publicPath: '/dist/'
            },
            devServer: {
                host: '0.0.0.0',
                port: 3000
            }
        });
}

module.exports = config;
