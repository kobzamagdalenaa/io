module.exports = {
    entry: './src/app',
    output: {
        publicPath: "/",
        filename: "bundle.js"
    },
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            }
        ]
    },
    devServer: {
        hot: true,
        open: true,
        port: 9000,
        historyApiFallback: true
    }
}