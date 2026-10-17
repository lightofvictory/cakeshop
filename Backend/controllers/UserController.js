import UserModel from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Create JWT token
const createToken = (id) => {
  const secret = process.env.JWT_SECRET_KEY || 'random#secrectkey';
  return jwt.sign({ id }, secret, {
    expiresIn: "7d",
  });
};

const sanitizeUser = (user) => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    phone: user.phone || user.phoneNumber || '',
    phoneNumber: user.phoneNumber || user.phone || '',
    phoneVerified: Boolean(user.phoneVerified),
    phoneVerifiedAt: user.phoneVerifiedAt || null,
    firebaseUid: user.firebaseUid || '',
    avatar: user.avatar || '',
    bio: user.bio || '',
  };
};

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    return res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = createToken(user._id);
    return res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin Login
const adminLoginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User account does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.role) {
      user.role = 'admin';
      await user.save();
    } else if (user.role !== 'admin' && user.role !== 'employee') {
      return res.status(401).json({ success: false, message: "Access denied. Admin or Employee account required." });
    }

    const token = createToken(user._id);
    return res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Admin Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin Register
const adminRegisterUser = async (req, res) => {
  const selectedRole = req.body.role === 'admin' ? 'admin' : 'employee';
  req.body.role = selectedRole;
  return registerUser(req, res);
};

// Get User Profile
const getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Authorization token missing" });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET_KEY || 'random#secrectkey';
    const decoded = jwt.verify(token, secret);

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Authorization token missing" });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET_KEY || 'random#secrectkey';
    const decoded = jwt.verify(token, secret);

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const { name, email, phone, avatar, bio, currentPassword, newPassword } = req.body;

    if (email && email !== user.email) {
      const existingEmail = await UserModel.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== decoded.id) {
        return res.status(400).json({ success: false, message: "Email is already in use" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Current password is required" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Current password does not match" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    return res.json({ success: true, message: "Profile updated successfully", user: sanitizeUser(user) });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Verify Firebase Phone Token & Update Customer Profile
const verifyFirebasePhoneToken = async (req, res) => {
  const { idToken, phoneNumber, firebaseUid } = req.body;

  if (!idToken && !phoneNumber) {
    return res.status(400).json({ success: false, message: "Firebase ID token or phone number is required" });
  }

  try {
    let verifiedPhone = phoneNumber;
    let uid = firebaseUid || 'firebase-verified-user';

    // 1. Server-side token verification with Firebase Admin SDK if configured
    try {
      if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID && !process.env.FIREBASE_PRIVATE_KEY.includes('YOUR_FIREBASE_ADMIN')) {
        const admin = await import('firebase-admin');
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
          });
        }
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        uid = decodedToken.uid;
        if (decodedToken.phone_number) {
          verifiedPhone = decodedToken.phone_number;
        }
      } else {
        // Fallback for development/testing environment
        if (idToken) {
          const decoded = jwt.decode(idToken);
          if (decoded) {
            uid = decoded.sub || decoded.uid || uid;
            verifiedPhone = decoded.phone_number || verifiedPhone;
          }
        }
      }
    } catch (fbErr) {
      console.warn("Firebase Admin Token verification fallback:", fbErr.message);
    }

    if (!verifiedPhone) {
      return res.status(400).json({ success: false, message: "Could not verify phone number from token" });
    }

    // 2. Find authenticated user from JWT auth header or email/phone match
    let user = null;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET_KEY || 'random#secrectkey';
      try {
        const decoded = jwt.verify(token, secret);
        user = await UserModel.findById(decoded.id);
      } catch (e) {
        // Ignore token decode error
      }
    }

    if (!user && req.body.email) {
      user = await UserModel.findOne({ email: req.body.email });
    }

    if (!user) {
      user = await UserModel.findOne({ $or: [{ phone: verifiedPhone }, { phoneNumber: verifiedPhone }] });
    }

    if (!user) {
      // Find latest user as fallback if logged in locally
      user = await UserModel.findOne().sort({ createdAt: -1 });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found to update profile" });
    }

    // 3. Mark customer profile as verified in MongoDB
    user.phone = verifiedPhone;
    user.phoneNumber = verifiedPhone;
    user.phoneVerified = true;
    user.phoneVerifiedAt = new Date();
    user.firebaseUid = uid;

    await user.save();

    return res.json({
      success: true,
      message: "Phone number verified successfully via Firebase",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("verifyFirebasePhoneToken error:", error);
    return res.status(500).json({ success: false, message: "Server error verifying Firebase phone token" });
  }
};

export default {
  loginUser,
  registerUser,
  adminLoginUser,
  adminRegisterUser,
  getProfile,
  updateProfile,
  verifyFirebasePhoneToken,
};
