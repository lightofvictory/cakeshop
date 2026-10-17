import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    designation: { type: String, default: "Staff Member" },
    department: { type: String, default: "Kitchen & Bakery" },
    salary: { type: Number, default: 0 },
    status: { type: String, enum: ["ACTIVE", "ON_LEAVE", "INACTIVE"], default: "ACTIVE" },
    joiningDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    avatar: { type: String, default: "" },
    role: { type: String, default: "employee" },
  },
  { timestamps: true }
);

const EmployeeModel = mongoose.models.employee || mongoose.model("employee", employeeSchema);

export default EmployeeModel;
