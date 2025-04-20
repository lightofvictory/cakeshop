import express from 'express';
// import { loginUser, registerUser } from '../controllers/UserController.js';

const userRouter = express.Router();

import UserController from '../controllers/UserController.js';

userRouter.post("/register", UserController.registerUser);
userRouter.post("/login", UserController.loginUser);

export default userRouter;
