const chalk = require('chalk');
const dateFormat = require('dateformat');
const util = require('util');
const path = require('path');
const fs = require('fs');
const rfs = require('rotating-file-stream');

let eventLogStream = rfs.createStream('event.log', {
    interval: '1d', // rotate daily
    size: '20M', // rotate when file size exceeds 20 MegaBytes
    compress: "gzip", // compress rotated files
    path: path.join(__dirname, '../..', 'logs/event')
})

class Logger {
    static get prefix() {
        return chalk.gray(dateFormat(Date.now(), 'ddd HH:MM:ss:l'))
    }

    static get logPrefix() {
        return `[${dateFormat(Date.now(), 'isoUtcDateTime')}]`
    }

    static formatInput(args) {
        return args.map((arg) => arg instanceof Object ? util.inspect(arg) : arg)
    }

    static info(...args) {
        args = this.formatInput(args)
        console.log(this.prefix + ' ' + chalk.green('[INFO]') + ' ' + args.join(' '))
        eventLogStream.write(this.logPrefix + ' [INFO] ' + args.join(' ') + '\n')
    }

    static route(...args) {
        args = this.formatInput(args)
        console.log(this.prefix + ' ' + chalk.blue('[ROUTE]') + ' ' + args.join(' '))
        eventLogStream.write(this.logPrefix + ' [ROUTE] ' + args.join(' ') + '\n')
    }

    static API(...args) {
        args = this.formatInput(args)
        console.log(this.prefix + ' ' + chalk.cyan('[API]') + ' ' + args.join(' '))
        eventLogStream.write(this.logPrefix + ' [API] ' + args.join(' ') + '\n')
    } 

    static ws(...args) {
        args = this.formatInput(args)
        console.log(this.prefix + ' ' + chalk.yellow('[WS]') + ' ' + args.join(' '))
        eventLogStream.write(this.logPrefix + ' [WS] ' + args.join(' ') + '\n')
    }

}

module.exports = Logger;