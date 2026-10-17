import EmployeeModel from "../models/EmployeeModel.js";
import bcrypt from "bcrypt";

// Get All Employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await EmployeeModel.find({}).select("-password").sort({ createdAt: -1 });
    return res.json({ success: true, data: employees });
  } catch (error) {
    console.error("Get employees error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch employees" });
  }
};

// Get Single Employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const employee = await EmployeeModel.findById(req.params.id).select("-password");
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    return res.json({ success: true, data: employee });
  } catch (error) {
    console.error("Get employee error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch employee" });
  }
};

// Create New Employee
const createEmployee = async (req, res) => {
  try {
    const { name, email, password, phone, designation, department, salary, status, joiningDate, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const existing = await EmployeeModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "An employee with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newEmployee = new EmployeeModel({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      designation: designation || "Staff Member",
      department: department || "Kitchen & Bakery",
      salary: Number(salary) || 0,
      status: status || "ACTIVE",
      joiningDate: joiningDate || new Date().toISOString().split("T")[0],
      avatar: avatar || "",
      role: "employee",
    });

    await newEmployee.save();
    const saved = newEmployee.toObject();
    delete saved.password;

    return res.status(201).json({ success: true, message: "Employee created successfully", data: saved });
  } catch (error) {
    console.error("Create employee error:", error);
    return res.status(500).json({ success: false, message: "Failed to create employee" });
  }
};

// Update Employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone, designation, department, salary, status, joiningDate, avatar } = req.body;

    const employee = await EmployeeModel.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    if (email && email !== employee.email) {
      const existing = await EmployeeModel.findOne({ email });
      if (existing && existing._id.toString() !== id) {
        return res.status(400).json({ success: false, message: "Email is already taken by another employee" });
      }
      employee.email = email;
    }

    if (name) employee.name = name;
    if (phone !== undefined) employee.phone = phone;
    if (designation) employee.designation = designation;
    if (department) employee.department = department;
    if (salary !== undefined) employee.salary = Number(salary);
    if (status) employee.status = status;
    if (joiningDate) employee.joiningDate = joiningDate;
    if (avatar !== undefined) employee.avatar = avatar;

    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      employee.password = await bcrypt.hash(password, salt);
    }

    await employee.save();
    const updated = employee.toObject();
    delete updated.password;

    return res.json({ success: true, message: "Employee updated successfully", data: updated });
  } catch (error) {
    console.error("Update employee error:", error);
    return res.status(500).json({ success: false, message: "Failed to update employee" });
  }
};

// Delete Employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await EmployeeModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }
    return res.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete employee error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete employee" });
  }
};

export default {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
