import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';

@ApiTags('Employees')
@Controller('api/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @ApiOperation({ summary: 'Get all employees' })
  @Get()
  async findAll() {
    return this.employeesService.findAll();
  }

  @ApiOperation({ summary: 'Get employee by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new employee' })
  @Post()
  async create(@Body() createDto: any) {
    return this.employeesService.create(createDto);
  }

  @ApiOperation({ summary: 'Update employee details' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.employeesService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete employee record' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
