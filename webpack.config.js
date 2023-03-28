const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
    entry: {
        // server: './bin/www',
        "sdk/sdk": './bin/www.sdk',
        "sdk/sdk_proc": './bin/www.sdk_proc',
        "panel/panel": './bin/www.panel',
        "cron/cron": "./bin/www.cron"
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js'
    },
    target: 'node',
    optimization: {
        minimize: false
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    externals: {
    },
    module: {
        rules: [
            {
                test: /.jsx?$/,
                include: [
                    path.resolve(__dirname, "./")
                ],
                exclude: [
                    path.resolve(__dirname, "./")
                ],
            },
            {
                include: [
                ],
                loader: 'string-replace-loader',
                options: {
                    search: 'require(\\([^\'"])',
                    replace: '__non_webpack_require__$1',
                    flags: 'g'
                }
            }
        ]
    },
    plugins: [
        new webpack.IgnorePlugin(/mongodb-client-encryption/, /\/mongodb\//),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "initApp/initial_data/*.json",
                    to: "./panel",
                },
                // use this to rearrange data as necessary during build
            ]
        }),
    ]
}