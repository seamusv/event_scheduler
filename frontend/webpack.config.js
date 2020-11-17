const path = require("path");
const webpack = require('webpack');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackPartialsPlugin = require("html-webpack-partials-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

function srcPath(subdir) {
    return path.join(__dirname, "src", subdir);
}

module.exports = (env, argv) => {
    const devMode = argv.mode !== 'production';

    return {
        context: path.resolve(__dirname, 'src'),

        entry: {
            index: './index.tsx',
        },

        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'app.js',
        },

        devtool: devMode ? 'source-map' : false,

        devServer: {
            compress: true,
            contentBase: path.join(__dirname, 'dist'),
            historyApiFallback: true,
            hot: true,
            open: true,
            port: 3000,
            writeToDisk: true
        },

        watch: devMode,
        watchOptions: {
            poll: devMode,
        },

        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.css', '.scss', '.json'],
            alias: {
                "@app": srcPath("./js"),
            },
        },

        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    loader: "awesome-typescript-loader",
                },
                {
                    enforce: "pre",
                    test: /\.js$/,
                    loader: "source-map-loader",
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        "postcss-loader",
                    ],
                },
                {
                    test: /\.(png|svg|jpg|gif)$/,
                    use: [
                        "file-loader",
                    ],
                },
            ]
        },

        plugins: [
            // new CopyWebpackPlugin({
            //     patterns: [
            //         {from: "images", to: "images"},
            //     ]
            // }),
            new MiniCssExtractPlugin({
                filename: "app.css",
            }),
            new HtmlWebpackPlugin({
                title: 'AutoScaler',
            }),
            new HtmlWebpackPartialsPlugin({
                path: srcPath('body-partial.html')
            }),
            devMode ? new webpack.HotModuleReplacementPlugin() : () => {}
        ],
    };
}
