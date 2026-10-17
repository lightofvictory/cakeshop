import express from 'express';
import UserController from '../controllers/UserController.js';

const userRouter = express.Router();

userRouter.post("/register", UserController.registerUser);
userRouter.post("/login", UserController.loginUser);
userRouter.post("/admin/login", UserController.adminLoginUser);
userRouter.post("/admin/register", UserController.adminRegisterUser);
userRouter.get("/profile", UserController.getProfile);
userRouter.put("/profile", UserController.updateProfile);
userRouter.post("/verify-firebase-phone", UserController.verifyFirebasePhoneToken);

export default userRouter;
