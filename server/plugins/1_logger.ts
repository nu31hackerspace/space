import winston from "winston";

import { defineNitroPlugin } from "#imports";

export default defineNitroPlugin(async (nitroApp) => {
    nitroApp.logger = winston.createLogger({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
        transports: [
            new winston.transports.Console()
        ]
    })
    nitroApp.logger.info('Logger initialized')
})

declare module 'nitropack' {
    interface NitroApp {
        logger: winston.Logger
    }
}