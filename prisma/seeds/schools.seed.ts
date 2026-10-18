import { PrismaClient, TenantType, TenantStatus, RoleScope, MembershipStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

interface SchoolSeedConfig {
  name: string;
  slug: string;
  city: string;
  state: string;
  pincode: string;
  principalName: string;
  hasSecondBranch: boolean;
}

export const SCHOOLS_DATA: SchoolSeedConfig[] = [
  { name: 'Delhi Public School, R.K. Puram', slug: 'dpsrkp', city: 'New Delhi', state: 'Delhi', pincode: '110022', principalName: 'Dr. Shailendra Sharma', hasSecondBranch: true },
  { name: "The Mother's International School", slug: 'misdelhi', city: 'New Delhi', state: 'Delhi', pincode: '110016', principalName: 'Milan Mala Sharma', hasSecondBranch: false },
  { name: 'Modern School, Barakhamba Road', slug: 'modernbarakhamba', city: 'New Delhi', state: 'Delhi', pincode: '110001', principalName: 'Dr. Vijay Datta', hasSecondBranch: true },
  { name: 'Bombay Scottish School', slug: 'bombayscottish', city: 'Mumbai', state: 'Maharashtra', pincode: '400016', principalName: 'Sunita George', hasSecondBranch: true },
  { name: 'Dhirubhai Ambani International School', slug: 'dais', city: 'Mumbai', state: 'Maharashtra', pincode: '400098', principalName: 'Isha Ambani', hasSecondBranch: false },
  { name: 'The Cathedral and John Connon School', slug: 'cathedral', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', principalName: 'Meera Isaacs', hasSecondBranch: false },
  { name: 'National Public School, Indiranagar', slug: 'npsindiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', principalName: 'Shantha Chandran', hasSecondBranch: true },
  { name: "Bishop Cotton Boys' School", slug: 'bishopcotton', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', principalName: 'Prof. John Zachariah', hasSecondBranch: false },
  { name: 'The Valley School, KFI', slug: 'valleyschool', city: 'Bengaluru', state: 'Karnataka', pincode: '560062', principalName: 'S. Kumar', hasSecondBranch: false },
  { name: 'La Martiniere for Boys', slug: 'lamartiniere', city: 'Kolkata', state: 'West Bengal', pincode: '700017', principalName: 'John Rafi', hasSecondBranch: true },
  { name: "St. Xavier's Collegiate School", slug: 'stxavierskol', city: 'Kolkata', state: 'West Bengal', pincode: '700016', principalName: 'Fr. Thamacin Arulappan', hasSecondBranch: false },
  { name: 'South Point High School', slug: 'southpoint', city: 'Kolkata', state: 'West Bengal', pincode: '700019', principalName: 'Rupa Sanyal', hasSecondBranch: true },
  { name: 'The Hyderabad Public School, Begumpet', slug: 'hpsbegumpet', city: 'Hyderabad', state: 'Telangana', pincode: '500016', principalName: 'Skand Bali', hasSecondBranch: true },
  { name: 'Oakridge International School, Gachibowli', slug: 'oakridge', city: 'Hyderabad', state: 'Telangana', pincode: '500008', principalName: 'Hema Chennupaty', hasSecondBranch: false },
  { name: 'Chirec International School', slug: 'chirec', city: 'Hyderabad', state: 'Telangana', pincode: '500084', principalName: 'Ratna Reddy', hasSecondBranch: true },
  { name: 'DAV Boys Senior Secondary School', slug: 'davchennai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600086', principalName: 'C. Satish', hasSecondBranch: false },
  { name: 'Padma Seshadri Bala Bhavan', slug: 'psbbchennai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600034', principalName: 'Mrs. K. Alamelu', hasSecondBranch: true },
  { name: 'The Doon School', slug: 'doonschool', city: 'Dehradun', state: 'Uttarakhand', pincode: '248001', principalName: 'Dr. Jagpreet Singh', hasSecondBranch: false },
  { name: 'Mayo College', slug: 'mayocollege', city: 'Ajmer', state: 'Rajasthan', pincode: '305001', principalName: 'Lt. Gen. Surendra Kulkarni', hasSecondBranch: false },
  { name: 'The Scindia School', slug: 'scindiaschool', city: 'Gwalior', state: 'Madhya Pradesh', pincode: '474008', principalName: 'Ajay Singh', hasSecondBranch: false },
];

export async function seedSchools(prisma: PrismaClient) {
  console.log('🏫 Seeding 20 Schools with Campuses, Roles, Users & Memberships...');

  // 1. Fetch available permissions for assigning to roles
  const allPermissions = await prisma.permission.findMany({
    where: { isDeleted: false },
  });

  const teacherPermCodes = ['user:read', 'campus:read'];
  const accountantPermCodes = ['tenant:read', 'campus:read', 'user:read'];

  const adminPermissions = allPermissions;
  const teacherPermissions = allPermissions.filter((p) => teacherPermCodes.includes(p.code));
  const accountantPermissions = allPermissions.filter((p) => accountantPermCodes.includes(p.code));

  // 2. Pre-hash default password for high performance
  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  let schoolIndex = 0;
  for (const school of SCHOOLS_DATA) {
    schoolIndex++;
    console.log(`[${schoolIndex}/20] Processing: ${school.name}...`);

    // A. Create or Fetch Tenant
    let tenant = await prisma.tenant.findFirst({
      where: { name: school.name, isDeleted: false },
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: school.name,
          type: TenantType.SCHOOL,
          status: TenantStatus.ACTIVE,
          timezone: 'Asia/Kolkata',
          defaultLocale: 'en',
          isActive: true,
        },
      });
    }

    // B. Create Main Campus
    let mainCampus = await prisma.campus.findFirst({
      where: { tenantId: tenant.id, isMainBranch: true, isDeleted: false },
    });

    if (!mainCampus) {
      mainCampus = await prisma.campus.create({
        data: {
          tenantId: tenant.id,
          name: `${school.name} (Main Campus)`,
          code: `${school.slug.toUpperCase()}-MAIN`,
          address: `Campus Road, ${school.city}`,
          city: school.city,
          state: school.state,
          pincode: school.pincode,
          phoneNumber: `+911122${schoolIndex.toString().padStart(6, '0')}`,
          email: `main@${school.slug}.edu.in`,
          isMainBranch: true,
          isActive: true,
        },
      });
    }

    // C. Optional Second Branch Campus
    let branchCampus = null;
    if (school.hasSecondBranch) {
      branchCampus = await prisma.campus.findFirst({
        where: { tenantId: tenant.id, isMainBranch: false, isDeleted: false },
      });

      if (!branchCampus) {
        branchCampus = await prisma.campus.create({
          data: {
            tenantId: tenant.id,
            name: `${school.name} (City Branch)`,
            code: `${school.slug.toUpperCase()}-CITY`,
            address: `Sector 12, City Center, ${school.city}`,
            city: school.city,
            state: school.state,
            pincode: school.pincode,
            phoneNumber: `+911123${schoolIndex.toString().padStart(6, '0')}`,
            email: `city@${school.slug}.edu.in`,
            isMainBranch: false,
            isActive: true,
          },
        });
      }
    }

    // D. Create Roles for the Tenant (School Admin, Teacher, Accountant)
    // 1. School Admin Role
    let adminRole = await prisma.role.findFirst({
      where: { tenantId: tenant.id, name: 'School Admin', isDeleted: false },
    });
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          tenantId: tenant.id,
          name: 'School Admin',
          description: 'Full administrative access for school management',
          scope: RoleScope.TENANT,
          isSystem: false,
          rolePermissions: {
            create: adminPermissions.map((p) => ({ permissionId: p.id })),
          },
        },
      });
    }

    // 2. Teacher Role
    let teacherRole = await prisma.role.findFirst({
      where: { tenantId: tenant.id, name: 'Teacher', isDeleted: false },
    });
    if (!teacherRole) {
      teacherRole = await prisma.role.create({
        data: {
          tenantId: tenant.id,
          name: 'Teacher',
          description: 'Faculty access for classes, attendance and evaluations',
          scope: RoleScope.TENANT,
          isSystem: false,
          rolePermissions: {
            create: teacherPermissions.map((p) => ({ permissionId: p.id })),
          },
        },
      });
    }

    // 3. Accountant Role
    let accountantRole = await prisma.role.findFirst({
      where: { tenantId: tenant.id, name: 'Accountant', isDeleted: false },
    });
    if (!accountantRole) {
      accountantRole = await prisma.role.create({
        data: {
          tenantId: tenant.id,
          name: 'Accountant',
          description: 'Financial and fee management access',
          scope: RoleScope.TENANT,
          isSystem: false,
          rolePermissions: {
            create: accountantPermissions.map((p) => ({ permissionId: p.id })),
          },
        },
      });
    }

    // E. Create Users & Memberships
    // User 1: Principal / School Owner
    const principalEmail = `principal.${school.slug}@schoolsaas.com`;
    const principalUser = await prisma.user.upsert({
      where: { email: principalEmail },
      update: {},
      create: {
        name: school.principalName,
        email: principalEmail,
        passwordHash: defaultPasswordHash,
        phoneNumber: `+9198${schoolIndex.toString().padStart(8, '0')}`,
        isActive: true,
      },
    });

    const principalMembership = await prisma.tenantMembership.findFirst({
      where: { tenantId: tenant.id, userId: principalUser.id, isDeleted: false },
    });
    if (!principalMembership) {
      await prisma.tenantMembership.create({
        data: {
          tenantId: tenant.id,
          userId: principalUser.id,
          campusId: mainCampus.id,
          roleId: adminRole.id,
          status: MembershipStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });
    }

    // User 2: Senior Teacher (Main Campus)
    const teacher1Email = `teacher1.${school.slug}@schoolsaas.com`;
    const teacher1User = await prisma.user.upsert({
      where: { email: teacher1Email },
      update: {},
      create: {
        name: `Prof. Rajesh Verma (${school.slug.toUpperCase()})`,
        email: teacher1Email,
        passwordHash: defaultPasswordHash,
        phoneNumber: `+9197${schoolIndex.toString().padStart(8, '0')}`,
        isActive: true,
      },
    });

    const teacher1Membership = await prisma.tenantMembership.findFirst({
      where: { tenantId: tenant.id, userId: teacher1User.id, isDeleted: false },
    });
    if (!teacher1Membership) {
      await prisma.tenantMembership.create({
        data: {
          tenantId: tenant.id,
          userId: teacher1User.id,
          campusId: mainCampus.id,
          roleId: teacherRole.id,
          status: MembershipStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });
    }

    // User 3: Branch Teacher / Staff (Branch Campus or Main Campus)
    const targetCampusId = branchCampus ? branchCampus.id : mainCampus.id;
    const staffEmail = `staff.${school.slug}@schoolsaas.com`;
    const staffUser = await prisma.user.upsert({
      where: { email: staffEmail },
      update: {},
      create: {
        name: `Sunil Kumar (${school.slug.toUpperCase()})`,
        email: staffEmail,
        passwordHash: defaultPasswordHash,
        phoneNumber: `+9196${schoolIndex.toString().padStart(8, '0')}`,
        isActive: true,
      },
    });

    const staffMembership = await prisma.tenantMembership.findFirst({
      where: { tenantId: tenant.id, userId: staffUser.id, isDeleted: false },
    });
    if (!staffMembership) {
      await prisma.tenantMembership.create({
        data: {
          tenantId: tenant.id,
          userId: staffUser.id,
          campusId: targetCampusId,
          roleId: accountantRole.id,
          status: MembershipStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });
    }
  }

  console.log('🎉 Successfully seeded 20 Schools with Campuses, Roles, Users & Memberships!');
}
