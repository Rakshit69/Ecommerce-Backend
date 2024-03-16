import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import { NewUserRequestBody } from "../types/types.js";
import { TryCatch } from "../middlewares/error.middleware.js";
import ErrorHandler from "../utils/utilityclasses.js";

export const newUser = TryCatch(
    async (req: Request<{}, {}, NewUserRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
      
        const { name, email, gender, dob, _id, photo } = req.body;
        let user = await User.findById(_id);
        if ( user) {
            return res.status(200).json(
                {
                    success: true,
                    message: "welcome " + name
                    
                }
            )
        }


             
        
        if (!_id || !name || !email || !photo || !dob || !gender)
            return next(new ErrorHandler("Please add all fields", 400));

        user = await User.create(
            {
                name,
                email,
                gender,
                dob: new Date(dob),
                _id,
                photo
            }
        )

            return res.status(200).json({
                success: true,
                message: `welcome, ${user.name}`
            })
       
        } 
)

export const getAllUsers = TryCatch(async (req, res, next) => {
    const users =await User.find({});
    return res.status(200).json({
        success: true,
        users,
    })
})

export const getUser = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
  
    if (!user) return next(new ErrorHandler("Invalid User", 400));
  
    return res.status(200).json({
      success: true,
      user,
    });
});
  
  export const deleteUser = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
      
      if (!user) return next(new ErrorHandler("Invalid User", 400));
      await user.deleteOne();

 
    return res.status(200).json({
      success: true,
    message:  "user deleted successfully"
    });
  });
  
  