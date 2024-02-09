import express from 'express';
import { getBarChartStats, getDashboardStats, getLineChartStats, getPieChartStats } from '../controllers/stats.controller.js';
import { adminOnly } from '../middlewares/auth.middleware.js';
const app = express.Router();



// /api/v1/dashboard/stats
app.get("/stats",adminOnly,getDashboardStats );

// /api/v1/dashboard/pie
app.get("/pie",adminOnly,getPieChartStats);

// /api/v1/dashboard/bar
app.get("/bar",adminOnly, getBarChartStats);

// /api/v1/dashboard/line
app.get("/line",adminOnly,getLineChartStats);

export default app;