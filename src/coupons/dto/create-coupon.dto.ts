import { IsDateString, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CreateCouponDto {
  @IsNotEmpty({ message: 'El nombre del cupon es obligatorio' })
  name: string;

  @IsNotEmpty({ message: 'El porcentaje del cupon es obligatorio' })
  @IsInt({ message: 'El descuento debe ser entre 1 y 100' })
  @Max(100, { message: 'Supera el maximo permitido' })
  @Min(1, { message: 'EL descuento minimo es de 1' })
  percentage: number;

  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsDateString({}, { message: 'Fecha no valida' })
  expirationDate: Date;
}
