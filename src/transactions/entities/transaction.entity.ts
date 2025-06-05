import { Product } from '../../products/entities/product.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal')
  total: number;

  @Column({ type: 'varchar', nullable: true })
  coupon: string;

  @Column({ type: 'decimal', nullable: true })
  discount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  transactionDate: Date;

  // eslint-disable-next-line prettier/prettier
  @OneToMany(() => TransactionContents, (transaction) => transaction.transaction)
  contents: TransactionContents[];
}

@Entity()
export class TransactionContents {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  quantity: number;

  @Column('decimal')
  price: number;

  // eslint-disable-next-line prettier/prettier
  @ManyToOne(() => Product, (product) => product.id, { eager: true, cascade: true }) // eager trae la columna completa
  product: Product;

  // eslint-disable-next-line prettier/prettier
  @ManyToOne(() => Transaction, (transaction) => transaction.contents, { cascade: true })
  transaction: Transaction;
}
