import { PrismaClient, TenantType, TenantStatus, MembershipStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

interface CampusData {
  name: string;
  codeSuffix: string;
  address: string;
  isMainBranch: boolean;
}

interface SchoolSeedConfig {
  name: string;
  slug: string;
  city: string;
  state: string;
  pincode: string;
  principalName: string;
  campuses: CampusData[];
}

export const SCHOOLS_DATA: SchoolSeedConfig[] = [
  {
    name: 'Delhi Public School, R.K. Puram',
    slug: 'dpsrkp',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110022',
    principalName: 'Dr. Shailendra Sharma',
    campuses: [
      { name: 'Delhi Public School (R.K. Puram Main Campus)', codeSuffix: 'MAIN', address: 'Sector XII, R.K. Puram, New Delhi', isMainBranch: true },
      { name: 'Delhi Public School (East of Kailash Branch)', codeSuffix: 'EAST', address: 'F-Block, East of Kailash, New Delhi', isMainBranch: false },
      { name: 'Delhi Public School (Vasant Vihar Junior Wing)', codeSuffix: 'VASANT', address: 'Vasant Vihar, New Delhi', isMainBranch: false },
    ],
  },
  {
    name: "The Mother's International School",
    slug: 'misdelhi',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110016',
    principalName: 'Milan Mala Sharma',
    campuses: [
      { name: "The Mother's International (Sri Aurobindo Marg Campus)", codeSuffix: 'MAIN', address: 'Sri Aurobindo Marg, New Delhi', isMainBranch: true },
      { name: "The Mother's International (Hauz Khas Pre-Primary)", codeSuffix: 'JUNIOR', address: 'Hauz Khas Enclave, New Delhi', isMainBranch: false },
    ],
  },
  {
    name: 'Modern School, Barakhamba Road',
    slug: 'modernbarakhamba',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    principalName: 'Dr. Vijay Datta',
    campuses: [
      { name: 'Modern School (Barakhamba Road Main Campus)', codeSuffix: 'MAIN', address: 'Barakhamba Road, Connaught Place, New Delhi', isMainBranch: true },
      { name: 'Modern School (Humayun Road City Branch)', codeSuffix: 'CITY', address: 'Humayun Road, New Delhi', isMainBranch: false },
      { name: 'Modern School (Kundli North Campus)', codeSuffix: 'KUNDLI', address: 'Rajiv Gandhi Education City, Sonipat', isMainBranch: false },
    ],
  },
  {
    name: 'Bombay Scottish School',
    slug: 'bombayscottish',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400016',
    principalName: 'Sunita George',
    campuses: [
      { name: 'Bombay Scottish (Mahim Main Campus)', codeSuffix: 'MAHIM', address: 'Veer Savarkar Marg, Mahim, Mumbai', isMainBranch: true },
      { name: 'Bombay Scottish (Powai Branch)', codeSuffix: 'POWAI', address: 'Raheja Vihar, Powai, Mumbai', isMainBranch: false },
    ],
  },
  {
    name: 'Dhirubhai Ambani International School',
    slug: 'dais',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400098',
    principalName: 'Isha Ambani',
    campuses: [
      { name: 'Dhirubhai Ambani Intl (BKC Main Campus)', codeSuffix: 'MAIN', address: 'Bandra-Kurla Complex, Bandra East, Mumbai', isMainBranch: true },
      { name: 'Dhirubhai Ambani Intl (Lower Parel Junior Wing)', codeSuffix: 'LOWERPAREL', address: 'Senapati Bapat Marg, Lower Parel, Mumbai', isMainBranch: false },
    ],
  },
  {
    name: 'The Cathedral and John Connon School',
    slug: 'cathedral',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    principalName: 'Meera Isaacs',
    campuses: [
      { name: 'Cathedral & John Connon (Fort Senior Campus)', codeSuffix: 'SENIOR', address: 'Purshottamdas Thakurdas Marg, Fort, Mumbai', isMainBranch: true },
      { name: 'Cathedral & John Connon (Malabar Hill Junior Branch)', codeSuffix: 'JUNIOR', address: 'Malabar Hill, Mumbai', isMainBranch: false },
    ],
  },
  {
    name: 'National Public School, Indiranagar',
    slug: 'npsindiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    principalName: 'Shantha Chandran',
    campuses: [
      { name: 'National Public School (Indiranagar Main Campus)', codeSuffix: 'MAIN', address: '12th A Main, HAL 2nd Stage, Indiranagar, Bengaluru', isMainBranch: true },
      { name: 'National Public School (Koramangala Branch)', codeSuffix: 'KORA', address: 'National Games Village, Koramangala, Bengaluru', isMainBranch: false },
      { name: 'National Public School (Rajajinagar Campus)', codeSuffix: 'RAJAJI', address: 'Chord Road, 5th Block, Rajajinagar, Bengaluru', isMainBranch: false },
    ],
  },
  {
    name: "Bishop Cotton Boys' School",
    slug: 'bishopcotton',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    principalName: 'Prof. John Zachariah',
    campuses: [
      { name: "Bishop Cotton Boys' (St. Mark's Road Main Campus)", codeSuffix: 'MAIN', address: "St. Mark's Road, Bengaluru", isMainBranch: true },
      { name: "Bishop Cotton Boys' (Whitefield Campus)", codeSuffix: 'WHITEFIELD', address: 'ITPL Main Road, Whitefield, Bengaluru', isMainBranch: false },
    ],
  },
  {
    name: 'The Valley School, KFI',
    slug: 'valleyschool',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560062',
    principalName: 'S. Kumar',
    campuses: [
      { name: 'The Valley School (Haridhyanapalya Main Campus)', codeSuffix: 'MAIN', address: 'Thatguni Post, Kanakapura Road, Bengaluru', isMainBranch: true },
      { name: 'The Valley School (Eco Learning Wing)', codeSuffix: 'WING', address: 'Off Kanakapura Road, Bengaluru', isMainBranch: false },
    ],
  },
  {
    name: 'La Martiniere for Boys',
    slug: 'lamartiniere',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700017',
    principalName: 'John Rafi',
    campuses: [
      { name: 'La Martiniere (Rawdon Street Main Campus)', codeSuffix: 'MAIN', address: '11 Dr. U. N. Brahmachari Street, Kolkata', isMainBranch: true },
      { name: 'La Martiniere (Alipore Junior Wing)', codeSuffix: 'ALIPORE', address: 'Belvedere Road, Alipore, Kolkata', isMainBranch: false },
    ],
  },
  {
    name: "St. Xavier's Collegiate School",
    slug: 'stxavierskol',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700016',
    principalName: 'Fr. Thamacin Arulappan',
    campuses: [
      { name: "St. Xavier's (Park Street Main Campus)", codeSuffix: 'MAIN', address: '30 Mother Teresa Sarani, Kolkata', isMainBranch: true },
      { name: "St. Xavier's (Wood Street Secondary Wing)", codeSuffix: 'WOODST', address: '12 Wood Street, Kolkata', isMainBranch: false },
    ],
  },
  {
    name: 'South Point High School',
    slug: 'southpoint',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700019',
    principalName: 'Rupa Sanyal',
    campuses: [
      { name: 'South Point (Ballygunge Senior Campus)', codeSuffix: 'SENIOR', address: '82/7A Ballygunge Place, Kolkata', isMainBranch: true },
      { name: 'South Point (Mandeville Gardens Junior Campus)', codeSuffix: 'JUNIOR', address: '16 Mandeville Gardens, Kolkata', isMainBranch: false },
    ],
  },
  {
    name: 'The Hyderabad Public School, Begumpet',
    slug: 'hpsbegumpet',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500016',
    principalName: 'Skand Bali',
    campuses: [
      { name: 'Hyderabad Public School (Begumpet Main Campus)', codeSuffix: 'MAIN', address: 'Sardar Patel Road, Begumpet, Hyderabad', isMainBranch: true },
      { name: 'Hyderabad Public School (Ramanthapur Branch)', codeSuffix: 'RAMANTHAPUR', address: 'Ramanthapur Road, Hyderabad', isMainBranch: false },
    ],
  },
  {
    name: 'Oakridge International School, Gachibowli',
    slug: 'oakridge',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500008',
    principalName: 'Hema Chennupaty',
    campuses: [
      { name: 'Oakridge Intl (Gachibowli Main Campus)', codeSuffix: 'MAIN', address: 'Nanakramguda Road, Gachibowli, Hyderabad', isMainBranch: true },
      { name: 'Oakridge Intl (Bachupally Campus)', codeSuffix: 'BACHUPALLY', address: 'Bowrampet, Bachupally, Hyderabad', isMainBranch: false },
    ],
  },
  {
    name: 'Chirec International School',
    slug: 'chirec',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500084',
    principalName: 'Ratna Reddy',
    campuses: [
      { name: 'Chirec Intl (Kondapur Main Campus)', codeSuffix: 'MAIN', address: 'Botanical Garden Road, Kondapur, Hyderabad', isMainBranch: true },
      { name: 'Chirec Intl (Gachibowli Pre-Primary)', codeSuffix: 'PREP', address: 'Telecom Nagar, Gachibowli, Hyderabad', isMainBranch: false },
      { name: 'Chirec Intl (Jubilee Hills Branch)', codeSuffix: 'JUBILEE', address: 'Road No. 45, Jubilee Hills, Hyderabad', isMainBranch: false },
    ],
  },
  {
    name: 'DAV Boys Senior Secondary School',
    slug: 'davchennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600086',
    principalName: 'C. Satish',
    campuses: [
      { name: 'DAV Boys (Gopalapuram Main Campus)', codeSuffix: 'MAIN', address: 'Lloyds Road, Gopalapuram, Chennai', isMainBranch: true },
      { name: 'DAV Boys (Mogappair Branch)', codeSuffix: 'MOGAPPAIR', address: 'Mogappair East, Chennai', isMainBranch: false },
    ],
  },
  {
    name: 'Padma Seshadri Bala Bhavan',
    slug: 'psbbchennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600034',
    principalName: 'Mrs. K. Alamelu',
    campuses: [
      { name: 'PSBB (Nungambakkam Main Campus)', codeSuffix: 'MAIN', address: 'Thirumalai Pillai Road, T. Nagar, Chennai', isMainBranch: true },
      { name: 'PSBB (K.K. Nagar Campus)', codeSuffix: 'KKNAGAR', address: 'Alagirisamy Salai, K.K. Nagar, Chennai', isMainBranch: false },
      { name: 'PSBB (Siruseri OMR Campus)', codeSuffix: 'SIRUSERI', address: 'OMR IT Highway, Chennai', isMainBranch: false },
    ],
  },
  {
    name: 'The Doon School',
    slug: 'doonschool',
    city: 'Dehradun',
    state: 'Uttarakhand',
    pincode: '248001',
    principalName: 'Dr. Jagpreet Singh',
    campuses: [
      { name: 'The Doon School (Mall Road Main Campus)', codeSuffix: 'MAIN', address: 'Mall Road, Dehradun, Uttarakhand', isMainBranch: true },
      { name: 'The Doon School (Chandbagh Wing)', codeSuffix: 'CHANDBAGH', address: 'Chandbagh Estate, Dehradun', isMainBranch: false },
    ],
  },
  {
    name: 'Mayo College',
    slug: 'mayocollege',
    city: 'Ajmer',
    state: 'Rajasthan',
    pincode: '305001',
    principalName: 'Lt. Gen. Surendra Kulkarni',
    campuses: [
      { name: 'Mayo College (Srinagar Road Main Campus)', codeSuffix: 'MAIN', address: 'Mayo Link Road, Ajmer, Rajasthan', isMainBranch: true },
      { name: 'Mayo College (Girls School Branch)', codeSuffix: 'GIRLS', address: 'Mayo Girls School Road, Ajmer', isMainBranch: false },
    ],
  },
  {
    name: 'The Scindia School',
    slug: 'scindiaschool',
    city: 'Gwalior',
    state: 'Madhya Pradesh',
    pincode: '474008',
    principalName: 'Ajay Singh',
    campuses: [
      { name: 'The Scindia School (Gwalior Fort Main Campus)', codeSuffix: 'MAIN', address: 'The Fort, Gwalior, Madhya Pradesh', isMainBranch: true },
      { name: 'The Scindia School (Junior Kanya Wing)', codeSuffix: 'JUNIOR', address: 'Moti Mahal Road, Gwalior', isMainBranch: false },
    ],
  },
];

export async function seedSchools(prisma: PrismaClient) {
  console.log('🏫 Seeding 20 Schools with Multiple Campuses (ADMIN & SUPERADMIN only)...');

  // Pre-hash default password for all seed accounts
  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  // 1. Seed Global Superadmin User
  const superadminEmail = 'superadmin@schoolsaas.com';
  const superadminUser = await prisma.user.upsert({
    where: { email: superadminEmail },
    update: {},
    create: {
      name: 'System Superadmin',
      email: superadminEmail,
      passwordHash: defaultPasswordHash,
      phoneNumber: '+919999999999',
      isActive: true,
    },
  });
  console.log(`👑 Superadmin ready: ${superadminUser.email}`);

  let schoolIndex = 0;
  for (const school of SCHOOLS_DATA) {
    schoolIndex++;
    console.log(`[${schoolIndex}/20] Processing School: ${school.name}...`);

    // A. Create or Fetch School Tenant
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

    // Assign Superadmin membership to the school tenant as well
    const superadminMembership = await prisma.tenantMembership.findFirst({
      where: { tenantId: tenant.id, userId: superadminUser.id, isDeleted: false },
    });
    if (!superadminMembership) {
      await prisma.tenantMembership.create({
        data: {
          tenantId: tenant.id,
          userId: superadminUser.id,
          role: 'SUPERADMIN',
          status: MembershipStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });
    }

    // B. Create School Principal (ADMIN) User
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

    // C. Create Multiple Campuses and Link ADMIN Memberships
    let campusIndex = 0;
    for (const campusData of school.campuses) {
      campusIndex++;
      const campusCode = `${school.slug.toUpperCase()}-${campusData.codeSuffix}`;

      let campus = await prisma.campus.findFirst({
        where: {
          tenantId: tenant.id,
          code: campusCode,
          isDeleted: false,
        },
      });

      if (!campus) {
        campus = await prisma.campus.create({
          data: {
            tenantId: tenant.id,
            name: campusData.name,
            code: campusCode,
            address: campusData.address,
            city: school.city,
            state: school.state,
            pincode: school.pincode,
            phoneNumber: `+91112${schoolIndex}${campusIndex.toString().padStart(4, '0')}`,
            email: `${campusData.codeSuffix.toLowerCase()}@${school.slug}.edu.in`,
            isMainBranch: campusData.isMainBranch,
            isActive: true,
          },
        });
      }

      // Link Principal to each Campus with ADMIN role
      const existingPrincipalMembership = await prisma.tenantMembership.findFirst({
        where: {
          tenantId: tenant.id,
          userId: principalUser.id,
          campusId: campus.id,
          isDeleted: false,
        },
      });

      if (!existingPrincipalMembership) {
        await prisma.tenantMembership.create({
          data: {
            tenantId: tenant.id,
            userId: principalUser.id,
            campusId: campus.id,
            role: 'ADMIN',
            status: MembershipStatus.ACTIVE,
            joinedAt: new Date(),
          },
        });
      }
    }
    console.log(`   └─ Seeded ${school.campuses.length} campuses with Principal ADMIN memberships`);
  }

  console.log('🎉 Successfully seeded 20 Schools with multiple campuses, Principals (ADMIN), and Superadmin!');
}
