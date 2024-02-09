import { NextFunction, Request, Response } from "express";

export interface NewUserRequestBody{
    name: string,
    _id:string,
    email:string,
    photo:string,
    role:string,
    gender: string,
    dob:Date,

}
export interface NewProductRequestBody{
    name: string,
    category:string,
    price: number,
    stock: number,
    
}
export type userController = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void | Response<any, Record<string, any>>>;

export type SearchRequestQuery = {
    search?: string,
    sort?: string,
    price?: string,
    category?: string,
    page?:string,
}
export interface BaseQuery{
    name?: {
        $regex: string | undefined;
        $options: string;
    },
        
    price?: {
        $lte: number;
    },
    category?: string;
}
export type InvalidateCache = {
    products?: boolean;
    order?: boolean;
    admin?: boolean; 
    userId?: string;
    orderId?: string;
    productId?: string | string[];
}
export type orderItemsType= {
    name: string,
    photo: string,
    quantity: number,
    price: number,
    productId: string ,
    
}
export type ShippingInfoType = {
    address: string,
    city: string,
    country: string,
    state: string,
    pincode: number,   
}
export  interface NewOrderRequestBody{
    shippingInfo: ShippingInfoType;
    user: string,
    subtotal: number,
    tax: number,
    discount: number,
    shippingCharges: number,//shippingCharges
    total: number,
    orderItems:orderItemsType[],
}