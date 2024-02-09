import { json } from "stream/consumers";
import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.middleware.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { calculatePercentage, getChartData, getInventories } from "../utils/features.js";



export const getDashboardStats = TryCatch(async (req, res, next) => {
    let stats;
    const key = "admin-stats";
    if (myCache.has(key)) 
        stats = JSON.parse(myCache.get(key) as string);
    else {
        const today = new Date();
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

        const thisMOnth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end:today
        }
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end:new Date(today.getFullYear(), today.getMonth(), 0)
        }
    
        const thisMonthProductsPromise =  User.find({
            createdAt: {
                $gte: thisMOnth.start,
                $lte: thisMOnth.end
            }
        });
        const lastMonthProductsPromise =  User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });

        const thisMonthUsersPromise =  User.find({
            createdAt: {
                $gte: thisMOnth.start,
                $lte: thisMOnth.end
            }
        });
        const lastMonthUsersPromise =  User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });

        const thisMonthOrdersPromise =  Order.find({
            createdAt: {
                $gte: thisMOnth.start,
                $lte: thisMOnth.end
            }
        });
        const lastMonthOrdresPromise =  Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });

        const lastSixMonthOrdersPromise=Order.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        });

        const latestTransactionPromise = Order
            .find({})
            .select(["orderItems", "discount", "total","status"])//id will come also  by default so we need to remove it from select option
            .limit(4);
        
        
        const [
            thisMonthProducts,
            thisMonthUsers,
            thisMonthOrders,
            lastMonthProducts,
            lastMonthUsers,
            lastMonthOrders,
            productsCount,
            usersCount,
            allOrders,
            lastSixMonthOrders,
            categories,
            femaleUsersCount,
            latestTransaction,


        ] = await Promise.all([
            thisMonthProductsPromise,
            thisMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthProductsPromise,
            lastMonthUsersPromise,
            lastMonthOrdresPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
            lastSixMonthOrdersPromise,
            Product.distinct("category"),
            User.countDocuments({gender:"female"}),
            latestTransactionPromise,
        ]);

        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.total || 0),
            0);
        
            const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + order.total, 0);

            const revenue = allOrders.reduce((total, order) => total + order.total, 0);
        const count = {
            revenue,
            product: productsCount,
            user: usersCount,
            order: allOrders.length
        };


        const changePercentage = {
            revenue:calculatePercentage(thisMonthRevenue,lastMonthRevenue),
            product: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),
            user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
            order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length)
        }

        const orderMonthCount = new Array(6).fill(0);
        
        const orderMonthRevenue = new Array(6).fill(0);
        
        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff = (today.getMonth() - creationDate.getMonth()+12)%12;
            if (monthDiff < 6) {
                orderMonthCount[6 - monthDiff - 1] += 1;
                orderMonthRevenue[6 - monthDiff - 1] += order.total;
            };

        });

   
        const categoryCount= await getInventories({ categories, productsCount });

      

        const Usersratio = {
            male: usersCount - femaleUsersCount,
            female:femaleUsersCount,
        }

        const modifiedLatestCount = latestTransaction.map(i => ({
            id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status:i.status
        }))

        stats = {
            categoryCount,
            changePercentage,
            count,
            chart: {
                order: orderMonthCount,
                revenue: orderMonthRevenue
            },
            Usersratio,
            latestTransaction:modifiedLatestCount,

        };
        myCache.set(key, JSON.stringify(stats));

    }
    return res
        .status(200)
        .json({
            success: true,
            stats
        });

    

 });    

export const getPieChartStats = TryCatch(async (req, res, next) => {
    let charts;
    const key = "admin-pie-charts";
    if (myCache.has(key)) 
        charts = JSON.parse(myCache.get(key) as string);
    else {

        const allOrdersPromise = Order.find({}).select([
            "total",
            "subTotal",
            "tax",
            "discount",
            "shippingCharges",
        ]);


        const [
            proccessingOrder,
            shippedOrder,
            deliveredOrder,
            categories,
            productsCount,
            outOfStock,
            allOrders,
            allUsers,
            adminUsers,
            customerUsers,

        ] = await Promise.all([
            Order.countDocuments({ status: "Processing" }),
            Order.countDocuments({ status: "Shipped" }),
            Order.countDocuments({ status: "Delivered" }),
            Product.distinct("category"),
            Product.countDocuments({}),
            Product.countDocuments({ stock: 0 }),
            allOrdersPromise,
            User.find({}).select(["dob"]),
            User.countDocuments({role:"admin"}),
            User.countDocuments({role:"user"}),
        ]);

        const orderFullfillment = {
            proccessing: proccessingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder,
        };
        const productCategories = await getInventories({
            categories,
            productsCount
        });
        const stocksAvalibility = {
            inStock: productsCount - outOfStock,
            outOfStock
        }
        
        const  grossIncome = allOrders.reduce((total, order) => total += (order.total || 0), 0);

        const  discount = allOrders.reduce((total, order) => total += (order.discount || 0), 0);

        const  productionCost = allOrders.reduce((total, order) => total += (order.shippingCharges || 0), 0);

        const  burnt = allOrders.reduce((total, order) => total += (order.tax || 0), 0);

        const marketingCost = Math.round(grossIncome * (30 / 100));

        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;
        

        const revenueDistribution = {

            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost,
            
        };

        
        const usersAgeGroup = {
            teen:allUsers.filter(i=>i.age<20).length,
            adult:allUsers.filter(i=>i.age>=20 && i.age<=40).length,
            old:allUsers.filter(i=>i.age>40).length,
        }

        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers
        }


        charts = {
            orderFullfillment,
            productCategories,
            stocksAvalibility,
            revenueDistribution,
            usersAgeGroup,
            adminCustomer,

        };

        myCache.set(key, JSON.stringify(charts));
    }    


    return res
        .status(200)
        .json({
            success: true,
            charts
        });
 });


export const getBarChartStats = TryCatch(async (req, res, next) => { 
    const key = "admin-bar-charts";
    let charts;
    if (myCache.has(key)) charts = JSON.parse(myCache.get(key) as string);
        
    else {

        const today = new Date();

        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
   
        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);

        const lastSixMonthProductsPromise=Product.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        }).select(["createdAt"]);

        const lastSixMonthUsersPromise=User.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        }).select(["createdAt"]);

        const lastTwelveMonthOrdersPromise=Order.find({
            createdAt: {
                $gte: twelveMonthAgo,
                $lte: today
            }
        }).select(["createdAt"]);

        const [
            lastSixMonthProducts,
            lastSixMonthUsers,
            lastTwelveMonthOrders,

        ] = await Promise.all([
            lastSixMonthProductsPromise,
            lastSixMonthUsersPromise,
            lastTwelveMonthOrdersPromise,

        ]);

        const productsCount = getChartData({
            length: 6,
            today,
            docArr:lastSixMonthProducts
        });

        const usersCount = getChartData({
            length: 6,
            today,
            docArr: lastSixMonthUsers
        });

        const ordersCount = getChartData({
            length: 12,
            today,
            docArr: lastTwelveMonthOrders
        });



        charts = {
            products: productsCount,
            users: usersCount,
            orders:ordersCount
        }


        myCache.set(key, JSON.stringify(charts));

    }

    return res
    .status(200)
    .json({
        success: true,
        charts
    });
    
});

export const getLineChartStats = TryCatch(async (req, res, next) => {
        const key = "admin-line-charts";
        let charts;
        if (myCache.has(key)) charts = JSON.parse(myCache.get(key) as string);
            
        else {
    
            const today = new Date();
    
            const twelveMonthAgo = new Date();
            twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);
       
            const baseQuery = {
                createdAt: {
                    $gte: twelveMonthAgo,
                    $lte: today
                }
          }
           
            const [
                lastTwelveMonthProducts,
                lastTwelveMonthUsers,
                lastTwelveMonthOrders,
    
            ] = await Promise.all([
                Product.find(baseQuery).select(["createdAt"]),
                User.find(baseQuery).select(["createdAt"]),
                Order.find(baseQuery).select(["createdAt","total","discount"]), 
            ]);
    
            const productsCount = getChartData({
                length: 12,
                today,
                docArr:lastTwelveMonthProducts
            });
    

            const usersCount = getChartData({
                length: 12,
                today,
                docArr: lastTwelveMonthUsers
            });
    
            const discount = getChartData({
                length: 12,
                today,
                docArr: lastTwelveMonthOrders,
                property:"discount",
            });
    
            const revenue = getChartData({
                length: 12,
                today,
                docArr: lastTwelveMonthOrders,
                property:"total",
            });
    
            charts = {
                products: productsCount,
                users: usersCount,
                discount,
                revenue
            };

    
    
            myCache.set(key, JSON.stringify(charts));
    
        }
    
        return res
        .status(200)
        .json({
            success: true,
            charts
        });
        
    });