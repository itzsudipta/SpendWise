//simple centralized error handling middleware

const errorHandling = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.stack);
    res.status(statusCode).json({ 
        status: statusCode,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
}

export default errorHandling;
