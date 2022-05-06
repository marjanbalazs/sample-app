import log4js from "log4js";

const logger = log4js.getLogger("Sample App Backend");

logger.level = process.env.NODE_ENV === "development" ? "debug" : "error";

export { logger };
