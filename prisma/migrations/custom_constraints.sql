-- ==============================================================================
-- Custom PostgreSQL Partial Unique Indexes & Cross-Scope Security Constraints
-- Phase 2: Core SaaS & Security Foundation
-- ==============================================================================

-- 1. Role Code Scope Constraints
-- In PostgreSQL, standard composite unique (tenantId, code) permits duplicate platform roles
-- because (NULL, 'admin') != (NULL, 'admin') in standard SQL.
-- These partial indexes strictly enforce unique codes within each respective scope:

-- 1A. Platform Roles: 'code' must be globally unique across all active platform roles
CREATE UNIQUE INDEX IF NOT EXISTS uq_roles_platform_code
  ON roles (code)
  WHERE tenant_id IS NULL AND is_deleted = false;

-- 1B. Tenant Roles: 'code' must be unique per tenant across all active roles
CREATE UNIQUE INDEX IF NOT EXISTS uq_roles_tenant_code
  ON roles (tenant_id, code)
  WHERE tenant_id IS NOT NULL AND is_deleted = false;


-- 2. Platform Role Assignments
-- A user can only have one active (non-revoked, non-deleted) platform assignment per role
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_platform_role_assignment
  ON platform_role_assignments (user_id, role_id)
  WHERE revoked_at IS NULL AND is_deleted = false;


-- 3. Tenant Memberships
-- Ensures soft-deleted memberships do not block future re-activation or re-invitation
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_tenant_membership
  ON tenant_memberships (tenant_id, user_id)
  WHERE is_deleted = false;


-- 4. Tenant Modules Entitlement
-- Ensures a tenant cannot have duplicate active module entitlements
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_tenant_module
  ON tenant_modules (tenant_id, module_id)
  WHERE is_deleted = false;


-- 5. Tenant Settings
-- Ensures a tenant cannot have duplicate active settings keys
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_tenant_setting
  ON tenant_settings (tenant_id, key)
  WHERE is_deleted = false;
