import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errorHandler';
export declare const globalErrorHandler: (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.d.ts.map