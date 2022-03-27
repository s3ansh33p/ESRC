const Client = new (require("./src/classes/App.js"))
const Logger = require('./src/utilities/consoleLog.js');

(async function () {
    await Client.registerRoutes();
    await Client.listen(() => {
        Logger.info(`Server listening on port ${process.env.EXPRESS_PORT}`);
    }, true);
})();