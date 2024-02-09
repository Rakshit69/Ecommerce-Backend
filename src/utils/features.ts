import mongoose, { Document } from "mongoose";
import { myCache } from "../app.js";
import { Product } from "../models/product.model.js";
import { InvalidateCache, orderItemsType } from "../types/types.js";

export const connectDb = (uri:string) => {
    mongoose.connect(uri, {
        dbName: "Cluster0",
        
    }).then(c => console.log("DB connected to ", c.connection.host))
        .catch(e => console.log(e.message + "error during connection with database"));
    
}

export const invalidateCache = ({products,order,admin,userId,orderId,productId}:InvalidateCache) => {
    if (products) {
        const productKey: string[] = ["latest-products",
            "product-categories",
            "all-products",

        ];
        if (typeof productId === "string") {
          productKey.push( `product-${productId}` )
        }
        if (Array.isArray(productId)) {
            
            // productKey.push(...productId.map(id=>`product-${id}`));
            productId.forEach((i) => productKey.push(`product-${i}`));
        }
        myCache.del(productKey);
    }   
    if (order) {
        const orderKeys: string[] = [
            "all-orders",
            `my-orders-${userId}`,
            `order-${orderId}`
        ];
    
        myCache.del(orderKeys);
        
    }
    if (admin) {
        myCache.del([
            "admin-stats",
            "admin-pie-charts",
            "admin-bar-charts",
            "admin-bar-charts"
        ]);
    }


}

export const reduceStock = async (orderItems:orderItemsType[]) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product) throw new Error("Product not Found");
        product.stock -= order.quantity;
        await product.save();
        
    }

}


export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
    if (lastMonth === 0) return thisMonth * 100;
    const percent = ((thisMonth-lastMonth) / lastMonth) * 100;
    return Number(percent.toFixed(0));
};
  
export const getInventories=async ({ categories,
    productsCount
}: {
    categories: string[],
    productsCount: number
}) => {
    const   categoriesCountPromise= categories.map(category =>
        Product.countDocuments({ category })
    );

    const categoriesCount = await Promise.all(categoriesCountPromise);
    
    const categoryCount:Record<string,number>[] = [];

    categories.forEach((category, i) => {
        categoryCount.push( {
            [category]:Math.round((categoriesCount[i]/productsCount) *100),
        })
    })
    return categoryCount;
}

interface DocProps extends Document{
    createdAt: Date,
    total?: number,
    discount?:number,
}

type funcProps = {
    length: number,
    docArr: DocProps[],
    today: Date,
    property?:"discount" | "total"
};


export const getChartData = ({ length,
docArr,today,property}:funcProps
) => {
    const data:number[] = new Array(length).fill(0);

    docArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth()+12)%12;
        if (monthDiff < 6) {
           
            if (property) {

                data[length - monthDiff - 1] += i[property]!;

            } else {

                data[length - monthDiff - 1] += 1;
                
              }
                 
        };

    });

    return data;


}