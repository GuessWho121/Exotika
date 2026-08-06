import winston from "winston"

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
}

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white"
}

winston.addColors(colors)

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`
  )
)

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`
  )
)

const transports: winston.transport[] = [
  new winston.transports.Console({ format: consoleFormat })
]

if (process.env.NODE_ENV !== "development") {
  transports.push(
    new winston.transports.File({ 
      filename: "logs/error.log", 
      level: "error",
      format: fileFormat
    }),
    new winston.transports.File({ 
      filename: "logs/combined.log",
      format: fileFormat
    })
  )
}

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  levels,
  transports
})
