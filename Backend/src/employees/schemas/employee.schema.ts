import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: 'Staff Member' })
  designation: string;

  @Prop({ default: 'Kitchen & Bakery' })
  department: string;

  @Prop({ default: 0 })
  salary: number;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'ON_LEAVE', 'INACTIVE'] })
  status: string;

  @Prop({ default: () => new Date().toISOString().split('T')[0] })
  joiningDate: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: 'employee' })
  role: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
