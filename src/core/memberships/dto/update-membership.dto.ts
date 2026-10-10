import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MembershipStatus } from '@prisma/client';

export class UpdateMembershipDto {
  @IsUUID('4', { message: 'roleId must be a valid UUID' })
  @IsOptional()
  roleId?: string;

  @IsUUID('4', { message: 'campusId must be a valid UUID' })
  @IsOptional()
  campusId?: string;

  @IsEnum(MembershipStatus, { message: 'Status must be one of: INVITED, ACTIVE, SUSPENDED, REVOKED' })
  @IsOptional()
  status?: MembershipStatus;

  @IsBoolean({ message: 'isActive must be a boolean' })
  @IsOptional()
  isActive?: boolean;
}
