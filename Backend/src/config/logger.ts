import { createLogger,format,transports } from "winston";
import { env } from "./env";

const {combine,timestamp,colorize,printf,json} = format;

const devFormat = printf(({level,message,timestamp,...meta})=>{
    return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ''
    }`
})

export const logger = createLogger({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
        env.NODE_ENV === 'production' ? json() : combine(colorize(),devFormat),
    ),
    transports:[
        new transports.Console(),

        new transports.File({filename:'logs/error.log', level:'error'}),
        new transports.File({filename:'logs/combined.log'}),
    ]
    
})