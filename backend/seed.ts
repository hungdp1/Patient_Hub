import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from './src/utils/password';

const prisma = new PrismaClient();

const seedUsers = [
  {
    email: 'admin@patienthub.local',
    phoneNumber: '0900000001',
    password: 'Admin@123',
    firstName: 'Nguyễn',
    lastName: 'Quản Lý',
    role: UserRole.ADMIN,
  },
  {
    email: 'doctor@patienthub.local',
    phoneNumber: '0900000002',
    password: 'Doctor@123',
    firstName: 'Lê',
    lastName: 'Thành Nam',
    role: UserRole.DOCTOR,
  },
  {
    email: 'technician@patienthub.local',
    phoneNumber: '0900000003',
    password: 'Tech@123',
    firstName: 'Nguyễn',
    lastName: 'Văn Khoa',
    role: UserRole.TECHNICIAN,
  },
  {
    email: 'patient@patienthub.local',
    phoneNumber: '0900000004',
    password: 'Patient@123',
    firstName: 'Trần',
    lastName: 'Thị B',
    role: UserRole.PATIENT,
  },
  {
    email: 'staff@patienthub.local',
    phoneNumber: '0900000005',
    password: 'Staff@123',
    firstName: 'Phạm',
    lastName: 'Nhân Viên',
    role: UserRole.STAFF,
  },
];

async function main() {
  console.log('Seeding sample users...');

  const emails = seedUsers.map((user) => user.email);
  await prisma.user.deleteMany({
    where: {
      email: { in: emails },
    },
  });

  for (const user of seedUsers) {
    const passwordHash = await hashPassword(user.password);

    await prisma.user.create({
      data: {
        email: user.email,
        phoneNumber: user.phoneNumber,
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        patient:
          user.role === UserRole.PATIENT
            ? {
                create: {
                  bloodType: 'O+',
                  allergies: 'Không',
                  chronicDiseases: 'Không',
                  emergencyContact: '0900000200',
                  insuranceId: 'INS-0001',
                  insuranceProvider: 'Bảo hiểm Y tế',
                },
              }
            : undefined,
        doctor:
          user.role === UserRole.DOCTOR
            ? {
                create: {
                  specialization: 'Nội tổng quát',
                  degree: 'Bác sĩ chuyên khoa I',
                  licenseNumber: 'DR-1001',
                  department: 'Nội khoa',
                  office: 'Phòng 102',
                  experience: 12,
                  achievements: 'Chuyên gia điều trị bệnh tiêu hóa',
                  rating: 4.9,
                  availableSlots: JSON.stringify({ monday: ['08:00-12:00', '13:00-17:00'] }),
                },
              }
            : undefined,
        technician:
          user.role === UserRole.TECHNICIAN
            ? {
                create: {
                  department: 'Xét nghiệm',
                  specialization: 'Sinh hóa',
                },
              }
            : undefined,
        staff:
          user.role === UserRole.STAFF
            ? {
                create: {
                  position: 'Nhân viên hành chính',
                  department: 'Văn phòng',
                },
              }
            : undefined,
      },
    });

    console.log(`Inserted user ${user.email} (${user.role})`);
  }

  console.log('Sample user seeding completed.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
