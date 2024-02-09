import express from 'express';
const app = express();
import NodeCache from 'node-cache'
import { errorMiddleware } from './middlewares/error.middleware.js';
import {config} from 'dotenv'
import { connectDb } from './utils/features.js';
import morgan from 'morgan';
import Stripe from 'stripe';
import cors from 'cors'
app.use(express.json());
// improting Routes
import userRouter from './routes/user.route.js'
import productRouter from './routes/product.route .js'
import orderRouter from './routes/order.route.js'
import paymentRouter from './routes/payment.route.js'
import dashboardRouter from './routes/stats.route.js'



config({
    path: "./.env"
})
const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";

connectDb(mongoURI);
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

export const stripe = new Stripe(stripeKey)
export const myCache = new NodeCache();
//it is used to cache data or store  any information that needs to be stored for a short period of time in RAM or for any time
//standard time to live
app.use('/api/v1/user', userRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/order',orderRouter);
app.use('/api/v1/payment',paymentRouter);
app.use('/api/v1/dashboard',dashboardRouter);


app.get('/', (req, res) => {
    return res.send("Api working with /api/v1")
})
app.use('/uploads', express.static("uploads"));
app.use(errorMiddleware)
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})

    
