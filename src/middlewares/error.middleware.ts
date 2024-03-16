import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '../utils/utilityclasses.js';
import { userController } from '../types/types.js';
export const errorMiddleware = (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    err.message ||= "Internal Server Error";
  err.statusCode ||= 500;

  if (err.name === "CastError") err.message = "Invalid  ID Provided";
  
    return res.status(400).json(
        {
            success: false,
            message: err.message ,
            statusCode:err.statusCode
      },
      
    )
}
export const TryCatch = (func: userController) => 
    (
      req: Request,
      res: Response,
      next:NextFunction
    ) => { 
      Promise.resolve(func(req, res, next)).catch(next);  
    };
