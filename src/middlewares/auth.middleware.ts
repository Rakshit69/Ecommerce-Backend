import { User } from "../models/user.model.js";
import ErrorHandler from "../utils/utilityclasses.js";
import { TryCatch } from "./error.middleware.js";

//middleware to make sure that only admin is allowed 
export const adminOnly = TryCatch(async (req, res, next) => {
    const id  = req.query.id 
    // user/:id ?id=iowjesilcieowj
    

    if (!id) next(new ErrorHandler("Invalid User Login Required", 401));
    const user = await User.findById(id);
    if (!user) next(new ErrorHandler("id is not correct ", 402));
    if (user?.role != "admin") next(new ErrorHandler("not admin", 403));
    else next();
})


