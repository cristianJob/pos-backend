import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { CategoriesModule } from '../categories/categories.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../config/typeorm.config';
import { ProductsModule } from '../products/products.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { CouponsModule } from '../coupons/coupons.module';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [
    CategoriesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Category, Product]),
    ProductsModule,
    TransactionsModule,
    CouponsModule,
  ],
  providers: [SeederService],
})
export class SeederModule {}
