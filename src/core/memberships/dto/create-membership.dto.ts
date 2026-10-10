import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { MembershipStatus } from '@prisma/client';

export class CreateMembershipDto {
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  @IsNotEmpty({ message: 'userId is required' })
  userId: string;

  @IsUUID('4', { message: 'tenantId must be a valid UUID' })
  @IsNotEmpty({ message: 'tenantId is required' })
  tenantId: string;

  @IsUUID('4', { message: 'roleId must be a valid UUID' })
  @IsNotEmpty({ message: 'roleId is required' })
  roleId: string;

  @IsUUID('4', { message: 'campusId must be a valid UUID' })
  @IsOptional()
  campusId?: string;

  @IsEnum(MembershipStatus, { message: 'Status must be one of: INVITED, ACTIVE, SUSPENDED, REVOKED' })
  @IsOptional()
  status?: MembershipStatus;
}
