import { IsEnum, IsNotEmpty } from 'class-validator';
import { TenantStatus } from '@prisma/client';

export class UpdateTenantStatusDto {
  @IsEnum(TenantStatus, { message: 'Status must be one of: ACTIVE, INACTIVE, SUSPENDED' })
  @IsNotEmpty({ message: 'Status is required' })
  status: TenantStatus;
}
