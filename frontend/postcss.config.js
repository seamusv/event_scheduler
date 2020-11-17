const tailwindcss = require('tailwindcss');

module.exports = (env) => {
    const devMode = env.mode !== 'production';

    return {
        plugins: [
            tailwindcss(devMode ? './tailwind.config.js' : './tailwind.config.prod.js'),
            require('autoprefixer'),
        ],
    }
};