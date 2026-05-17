import { Request, Response, NextFunction } from 'express';
export declare class ApiError extends Error {
    readonly statusCode: number;
    readonly details?: unknown;
    constructor(statusCode: number, message: string, details?: unknown);
}
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map