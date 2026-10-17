import express from 'express';
import cors from "cors";
import { connectDB } from './config/db.js';
import cakeRouter from './routes/cakesroute.js';
import userRouter from './routes/UserRouter.js';
import employeeRouter from './routes/EmployeeRouter.js';

import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// DB Connection
connectDB();

// Static & API routes
app.use('/api/cakes', cakeRouter);
app.use('/api/users', userRouter);
app.use('/api/employees', employeeRouter);
app.use('/images', express.static('uploads'));

// Test Route
app.get('/', (req, res) => {
    res.send("hello world API");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
