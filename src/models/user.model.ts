import mongoose from "mongoose";
import validator from "validator";

interface IUser extends Document{
    name: string,
    _id: string,
    email: string,
    photo: string,
    role: "user" | "admin",
    gender: "male"  | "female",
    dob: Date,
    createdAt: Date,
    updatedAt: Date,
    //virtual attriute
    age: number,
    
}


const schema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true,"Please enter ID"],
    },
    name: {
        type: String,
        required: [true, "Please enter Name"],
    },
    email: {
        type: String,
        unique: [true, "Email already Exists"],
        required: [true, "Please enter Email"],
        validate:validator.default.isEmail,
    },
    photo: {
        type: String,
        required: [true, "Please add Photo"],
    },
    role: {
        type: String,
        enum: [ "user" , "admin"],
        default : "user",
        
    },
    gender: {
        type: String,
        enum: [ "male" , "female"],
        required: [true,"Please enter Gender"],
        
        
    },
    dob: {
        type: Date,
        required:[true,"Please enter DOB"],
    },
    
}, { timestamps: true })

schema.virtual("age").get(function(this: IUser) {
    const today = new Date();
    const dob = this.dob;

    let age = today.getFullYear() - dob.getFullYear();

    if (today.getMonth() < dob.getMonth() || today.getMonth() === dob.getMonth() &&
        today.getDay() < dob.getDay()) age--;

    return age;
})

export const User = mongoose.model<IUser>("User", schema);


