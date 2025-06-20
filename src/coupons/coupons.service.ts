import { BadGatewayException, Injectable } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';
import { endOfDay, isAfter } from 'date-fns';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  create(createCouponDto: CreateCouponDto) {
    return this.couponRepository.save(createCouponDto);
  }

  findAll() {
    return this.couponRepository.find();
  }

  async findOne(id: number) {
    const coupon = await this.couponRepository.findOneBy({ id: id });
    // eslint-disable-next-line prettier/prettier
    if(!coupon) throw new BadGatewayException(`El cupon con el id ${id} no fue encontrado`);
    return coupon;
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findOne(id);
    Object.assign(coupon, updateCouponDto);
    return await this.couponRepository.save(coupon);
  }

  async remove(id: number) {
    const coupon = await this.findOne(id);
    await this.couponRepository.remove(coupon);
    return { message: 'Cupon eliminado' };
  }

  async appliCoupon(couponName: string) {
    const coupon = await this.couponRepository.findOneBy({ name: couponName });
    if (!coupon) throw new BadGatewayException('Cupon no existe');
    const currentDate = new Date();
    const expiration = endOfDay(coupon.expirationDate);
    // eslint-disable-next-line prettier/prettier
    if (isAfter(currentDate, expiration)) { // fecha actual es despues de la fecha del cupon ??
      throw new BadGatewayException('Cupon expirado');
    }
    return {
      message: 'Cupon valido',
      ...coupon, //agrega cupon al mismo objeto de message
    };
  }
}
