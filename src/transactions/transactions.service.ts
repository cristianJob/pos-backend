import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';

import {
  Transaction,
  TransactionContents,
} from './entities/transaction.entity';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents)
    private readonly contentRepository: Repository<TransactionContents>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly couponService: CouponsService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    // manager.transaction es para validar que todas las consultas sean exitosas, de lo contrario da error
    // todo repo debe ser instanciado o agregar la entidad como el caso de product en findoneby
    // se utilizara el repo de product porque depende del stock de producto la tran de la venta
    await this.productRepository.manager.transaction(
      async (transactionEntityManager) => {
        const transaction = new Transaction();
        const total = createTransactionDto.contents.reduce(
          (total, item) => total + item.quantity * item.price,
          0,
        );
        transaction.total = total;

        if (createTransactionDto.coupon) {
          const coupon = await this.couponService.appliCoupon(
            createTransactionDto.coupon,
          );
          const discount = (coupon.percentage / 100) * total;
          transaction.discount = discount;
          transaction.coupon = coupon.name;
          transaction.total -= discount;
        }

        for (const content of createTransactionDto.contents) {
          const product = await transactionEntityManager.findOneBy(Product, {
            id: content.productId,
          });
          if (!product) throw new NotFoundException('Producto no existe');

          if (content.quantity > product.inventory) {
            throw new BadRequestException(
              `El articulo ${product.name} excede la cantidad disponible`,
            );
          }
          product.inventory -= content.quantity;

          const transactionContent = new TransactionContents();
          transactionContent.price = content.price;
          transactionContent.product = product;
          transactionContent.quantity = content.quantity;
          transactionContent.transaction = transaction;

          await transactionEntityManager.save(transaction);
          await transactionEntityManager.save(transactionContent);
        }
      },
    );

    return { message: 'Venta almacenada correctamente' };
  }

  findAll(transactionDate?: string) {
    const options: FindManyOptions<Transaction> = {
      relations: {
        contents: true,
      },
    };
    if (transactionDate) {
      const date = parseISO(transactionDate);
      if (!isValid(date)) {
        throw new BadRequestException('Fecha no valida');
      }
      const start = startOfDay(date);
      const end = endOfDay(date);
      options.where = {
        transactionDate: Between(start, end),
      };
    }

    return this.transactionRepository.find(options);
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: {
        id,
      },
      relations: {
        contents: true,
      },
    });
    if (!transaction) {
      throw new BadRequestException('Transaccion no encontrada');
    }
    return transaction;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  async remove(id: number) {
    const transaction = await this.findOne(id);
    for (const content of transaction.contents) {
      const product = await this.productRepository.findOneBy({
        id: content.product.id,
      });
      if (!product) throw new BadRequestException('Producto no encontrado');
      product.inventory += content.quantity;
      await this.productRepository.save(product);

      const transactionContent = await this.contentRepository.findOneBy({
        id: content.id,
      });
      if (!transactionContent)
        throw new BadRequestException('Detalle no encontrado');
      await this.contentRepository.remove(transactionContent);
    }
    await this.transactionRepository.remove(transaction);
    return `Se ha eliminado #${id} con exito`;
  }
}
