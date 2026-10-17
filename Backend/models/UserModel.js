import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    role: { type: String, default: 'user' },
    phone: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    phoneVerified: { type: Boolean, default: false },
    phoneVerifiedAt: { type: Date, default: null },
    firebaseUid: { type: String, default: '' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  { minimize: false, timestamps: true }
);

const UserModel = mongoose.models.user || mongoose.model("user", userSchema);

export default UserModel;
