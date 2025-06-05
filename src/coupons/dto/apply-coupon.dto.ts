import { IsNotEmpty } from 'class-validator';

export class ApplyCoupon {
  @IsNotEmpty({ message: 'El nombre del cupon de obligatorio' })
  coupon_name: string;
}
