import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { RoleScope } from '@prisma/client';

export class CreateRoleDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsUUID('4', { message: 'tenantId must be a valid UUID' })
  @IsOptional()
  tenantId?: string;

  @IsEnum(RoleScope, { message: 'Scope must be either PLATFORM or TENANT' })
  @IsOptional()
  scope?: RoleScope;

  @IsArray({ message: 'permissionIds must be an array of UUIDs' })
  @IsUUID('4', { each: true, message: 'Each permissionId must be a valid UUID' })
  @IsOptional()
  permissionIds?: string[];
}
