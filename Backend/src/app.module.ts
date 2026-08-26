import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as dns from 'dns';
import { ItemsModule } from './items/items.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { CategoriesModule } from './categories/categories.module';
import { CustomersModule } from './customers/customers.module';
import { SettingsModule } from './settings/settings.module';
import { DemosModule } from './demos/demos.module';

let mongodInstance: MongoMemoryServer | null = null;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const uri = process.env.MONGO_URI;
        let finalUri = uri;

        if (uri && uri.startsWith('mongodb+srv://')) {
          try {
            const hostMatch = uri.match(/@([^/\?]+)/);
            if (hostMatch && hostMatch[1]) {
              const hostname = hostMatch[1];
              await dns.promises.resolveSrv(`_mongodb._tcp.${hostname}`);
              console.log('✅ Remote MongoDB Atlas DNS resolved successfully.');
            }
          } catch (dnsError) {
            console.log('⚠️ Remote MongoDB Atlas DNS SRV lookup failed. Switching to local MongoMemoryServer...');
            finalUri = null;
          }
        }

        if (!finalUri) {
          try {
            if (!mongodInstance) {
              mongodInstance = await MongoMemoryServer.create();
            }
            finalUri = mongodInstance.getUri();
            console.log(`🟢 Running with high-availability local database at ${finalUri}`);
          } catch (memErr) {
            console.error('MongoMemoryServer error:', memErr);
            finalUri = 'mongodb://127.0.0.1:27017/cakeshop';
          }
        }

        return { uri: finalUri };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/images',
    }),
    ItemsModule,
    UsersModule,
    OrdersModule,
    CategoriesModule,
    CustomersModule,
    SettingsModule,
    DemosModule,
  ],
})
export class AppModule {}
