const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const rfs = require('rotating-file-stream');
const logger = require('morgan');
const Router = require('./Router');
const Logger = require('../utilities/consoleLog.js');
require('dotenv').config();

let accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    size: '20M', // rotate when file size exceeds 20 MegaBytes
    compress: "gzip", // compress rotated files
    path: path.join(__dirname, '../..', 'logs/access')
})

class App {
    io;
    server;
    constructor() {
        this.app = express();
        this.server = require('http').createServer(this.app);
        this.app.engine('e', require('ejs').renderFile);
        this.app.set('view engine', 'ejs');
        this.app.set('views', path.join(__dirname, '..', 'views'));
        this.app.use(cors());
        this.app.use(cookieParser());
        this.app.use(logger('[:date[iso]] :remote-addr ":referrer" ":user-agent" :method :url :status :res[content-length] - :response-time ms', {stream: accessLogStream}));
        this.app.use(logger(' >> :method :url :status :res[content-length] - :response-time ms'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({
            extended: true
        }));
        this.app.use('/public', express.static(path.join(__dirname, '..', 'public')));

    }

    /**
     * 
     * @param {express.Request} req 
     * @param {express.Response} res 
     * @param {function()} next 
     */

    /**
     * 
     * @param {string} template 
     * @param {express.Request} req 
     * @param {express.Response} res 
     * @param {{...}} data 
     */

    async registerRoutes() {
        const filePath = path.join(__dirname, '..', 'routes');
        const files = await fsp.readdir(filePath);
        for await (const file of files) {
            if (file.endsWith('.js')) {
                const router = require(path.join(filePath, file));
                if (router.prototype instanceof Router) {
                    const instance = new router(this);
                    Logger.route(`Route ${instance.path} serving.`);
                    if (instance.auth) {
                        this.app.use(instance.path, this.Authentication, instance.createRoute());
                    } else {
                        this.app.use(instance.path, instance.createRoute());
                    }
                }
            }
        }

        this.app.get('/', function(req, res) {
            res.render('home.ejs', {
                path: req.path,
                user: req.user
            })
        })

        this.app.use((req, res) => {
            res.render('404.ejs', {
                path: req.path,
                user: req.user
            });
        });
    }

    async listen(fn) {
        this.server.listen(process.env.EXPRESS_PORT, fn)
    }
}

module.exports = App;