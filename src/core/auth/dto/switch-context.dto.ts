import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SwitchContextDto {
  @IsUUID('4', { message: 'tenantId must be a valid UUID' })
  @IsNotEmpty({ message: 'tenantId is required' })
  tenantId: string;

  @IsUUID('4', { message: 'campusId must be a valid UUID' })
  @IsOptional()
  campusId?: string;
}
