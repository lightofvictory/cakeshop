import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as dns from 'dns';
import * as fs from 'fs';
import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { CategoriesModule } from './categories/categories.module';
import { CustomersModule } from './customers/customers.module';
import { SettingsModule } from './settings/settings.module';
import { EmployeesModule } from './employees/employees.module';
import { AuthModule } from './auth/auth.module';
import { OffersModule } from './offers/offers.module';
import { CommonModule } from './common/common.module';

let mongodInstance: MongoMemoryServer | null = null;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cakeshop';
        console.log(`🌐 Connecting to MongoDB Atlas Project: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
        return { 
          uri,
          serverSelectionTimeoutMS: 5000,
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/images',
    }),
    CommonModule,
    ItemsModule,
    UsersModule,
    OrdersModule,
    CategoriesModule,
    CustomersModule,
    SettingsModule,
    EmployeesModule,
    AuthModule,
    OffersModule,
  ],
})
export class AppModule {}
