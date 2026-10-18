import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MembershipStatus } from '@prisma/client';

export class UpdateMembershipDto {
  @IsString({ message: 'role must be a string' })
  @IsOptional()
  role?: string;

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
