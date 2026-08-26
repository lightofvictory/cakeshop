import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('User Auth')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'User Login' })
  @Post('login')
  async login(@Body() loginDto: any) {
    return this.usersService.login(loginDto);
  }

  @ApiOperation({ summary: 'User Registration' })
  @Post('register')
  async register(@Body() registerDto: any) {
    return this.usersService.register(registerDto);
  }
}
