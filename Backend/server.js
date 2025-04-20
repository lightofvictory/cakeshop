import express from 'express';
import cors from "cors";
import { connectDB } from './config/db.js';
import cakeRouter from './routes/cakesroute.js';
import userRouter from './routes/UserRouter.js'; // ✅ Make sure this is the correct file path

import dotenv from "dotenv";
dotenv.config(); // ✅ Make sure this comes before using any environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// DB Connection
connectDB();

// Static & API routes
app.use('/api/cakes', cakeRouter);
app.use('/api/users', userRouter); // ✅ Your route is registered here correctly
app.use('/images', express.static('uploads'));

// Test Route
app.get('/', (req, res) => {
    res.send("hello world API");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
