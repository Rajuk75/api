import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { TenantType } from '@prisma/client';

export class CreateTenantDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEnum(TenantType, { message: 'Type must be one of: SCHOOL, COACHING, COLLEGE, OTHER' })
  @IsOptional()
  type?: TenantType;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Timezone must be a string' })
  @IsOptional()
  timezone?: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Default locale must be a string' })
  @IsOptional()
  defaultLocale?: string;
}
