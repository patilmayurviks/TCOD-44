const loggingMiddleware = (req, res, next) => {

    const log = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
    };

    console.log(log);

    next();
};

module.exports = loggingMiddleware;