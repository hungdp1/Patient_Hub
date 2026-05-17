import { ApiError } from '../utils/errorHandler';
export const globalErrorHandler = (err, req, res, next) => {
    console.error(err);
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({ error: err.message, details: err.details });
        return;
    }
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
};
//# sourceMappingURL=error.js.map