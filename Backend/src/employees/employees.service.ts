import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Employee, EmployeeDocument } from './schemas/employee.schema';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>
  ) {}

  private sanitize(employee: EmployeeDocument) {
    const obj = employee.toObject();
    delete obj.password;
    return obj;
  }

  async findAll() {
    const list = await this.employeeModel.find({}).sort({ createdAt: -1 });
    return { success: true, data: list.map((item) => this.sanitize(item)) };
  }

  async findOne(id: string) {
    const employee = await this.employeeModel.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return { success: true, data: this.sanitize(employee) };
  }

  async create(createDto: any) {
    const { name, email, password, phone, designation, department, salary, status, joiningDate, avatar } = createDto;

    if (!name || !email || !password) {
      throw new BadRequestException('Name, email, and password are required');
    }

    const existing = await this.employeeModel.findOne({ email });
    if (existing) {
      throw new BadRequestException('Employee already exists with this email');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newEmployee = new this.employeeModel({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      designation: designation || 'Staff Member',
      department: department || 'Kitchen & Bakery',
      salary: Number(salary) || 0,
      status: status || 'ACTIVE',
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      avatar: avatar || '',
      role: 'employee',
    });

    const saved = await newEmployee.save();
    return { success: true, message: 'Employee created successfully', data: this.sanitize(saved) };
  }

  async update(id: string, updateDto: any) {
    const employee = await this.employeeModel.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const { name, email, password, phone, designation, department, salary, status, joiningDate, avatar } = updateDto;

    if (email && email !== employee.email) {
      const existing = await this.employeeModel.findOne({ email });
      if (existing && existing._id.toString() !== id) {
        throw new BadRequestException('Email is already taken by another employee');
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

    const updated = await employee.save();
    return { success: true, message: 'Employee updated successfully', data: this.sanitize(updated) };
  }

  async remove(id: string) {
    const deleted = await this.employeeModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Employee not found');
    }
    return { success: true, message: 'Employee deleted successfully' };
  }
}
