const {createLogger,format,transports}=require('winston'); //imports
/*format: format.combine(
    format.simple(),
    format.timestamp(),
),
    transports:[
    new transports.File({
        maxsize:5120000,
        maxFiles:5,
        level:debug,
        filename:'../../logs/log-MyWallapop'
    })
]*/
module.exports = createLogger({
    transports:[
    new transports.File({level: 'info',
        filename: `${__dirname}/../../logs/app.log`,
         handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    }),
    new transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true,
        }
    )]
});
