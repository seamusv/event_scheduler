const devConfig = require("./tailwind.config");

module.exports = {
    ...devConfig,
    purge: {
        enabled: true,
        content: ['./src/**/*.tsx'],
    },
}