import { PrismaClient, UserRole, AppointmentStatus, RecordType, PaymentStatus, PaymentMethod } from '@prisma/client';
import { hashPassword } from './src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding super complete sample data...');

  // Clean up database before seeding
  console.log('Cleaning up existing data...');
  await prisma.chatMessage.deleteMany({});
  await prisma.conversationSession.deleteMany({});
  await prisma.cancellationRequest.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.creditCard.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.labResult.deleteMany({});
  await prisma.medicalRecord.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.disease.deleteMany({});
  await prisma.drug.deleteMany({});
  await prisma.procedure.deleteMany({});
  await prisma.labTest.deleteMany({});
  await prisma.hospitalService.deleteMany({});
  
  await prisma.staff.deleteMany({});
  await prisma.technician.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users
  console.log('Creating users...');
  const defaultPassword = await hashPassword('Password@123');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@patienthub.local',
      phoneNumber: '0900000001',
      passwordHash: defaultPassword,
      firstName: 'Nguyễn',
      lastName: 'Quản Lý',
      role: UserRole.ADMIN,
    }
  });

  const doctor1 = await prisma.user.create({
    data: {
      email: 'doctor1@patienthub.local',
      phoneNumber: '0900000002',
      passwordHash: defaultPassword,
      firstName: 'Lê',
      lastName: 'Thành Nam',
      role: UserRole.DOCTOR,
      doctor: {
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
        }
      }
    },
    include: { doctor: true }
  });

  const doctor2 = await prisma.user.create({
    data: {
      email: 'doctor2@patienthub.local',
      phoneNumber: '0900000006',
      passwordHash: defaultPassword,
      firstName: 'Nguyễn',
      lastName: 'Văn An',
      role: UserRole.DOCTOR,
      doctor: {
        create: {
          specialization: 'Tiêu hóa',
          degree: 'Tiến sĩ Y khoa',
          licenseNumber: 'DR-1002',
          department: 'Tiêu hóa',
          office: 'Phòng 201',
          experience: 15,
          rating: 4.8,
        }
      }
    },
    include: { doctor: true }
  });

  const tech = await prisma.user.create({
    data: {
      email: 'technician@patienthub.local',
      phoneNumber: '0900000003',
      passwordHash: defaultPassword,
      firstName: 'Nguyễn',
      lastName: 'Văn Khoa',
      role: UserRole.TECHNICIAN,
      technician: {
        create: {
          department: 'Xét nghiệm',
          specialization: 'Sinh hóa',
        }
      }
    },
    include: { technician: true }
  });

  const patientA = await prisma.user.create({
    data: {
      email: 'patient@patienthub.local',
      phoneNumber: '0900000004',
      passwordHash: defaultPassword,
      firstName: 'Trần',
      lastName: 'Thị B',
      role: UserRole.PATIENT,
      patient: {
        create: {
          bloodType: 'O+',
          allergies: 'Không',
          chronicDiseases: 'Không',
          emergencyContact: '0900000200',
          insuranceId: 'INS-0001',
          insuranceProvider: 'Bảo hiểm Y tế',
        }
      }
    },
    include: { patient: true }
  });

  const patientB = await prisma.user.create({
    data: {
      email: 'patient2@patienthub.local',
      phoneNumber: '0900000007',
      passwordHash: defaultPassword,
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      role: UserRole.PATIENT,
      patient: {
        create: {
          bloodType: 'A+',
          allergies: 'Hải sản',
          chronicDiseases: 'Viêm dạ dày',
        }
      }
    },
    include: { patient: true }
  });

  // 2. Hospital Services
  console.log('Creating hospital services...');
  await prisma.hospitalService.createMany({
    data: [
      { name: 'Khám Nội tổng quát', category: 'Khám bệnh', price: 150000, duration: 15 },
      { name: 'Xét nghiệm Máu', category: 'Xét nghiệm', price: 350000, duration: 10 },
      { name: 'Siêu âm Bụng', category: 'Chẩn đoán hình ảnh', price: 450000, duration: 20 },
      { name: 'X-quang Phổi', category: 'Chẩn đoán hình ảnh', price: 200000, duration: 10 },
      { name: 'Đo Điện tim', category: 'Thăm dò chức năng', price: 180000, duration: 15 },
    ]
  });

  // 3. Medical Library
  console.log('Creating medical library...');
  await prisma.disease.createMany({
    data: [
      { name: 'Viêm dạ dày cấp', type: 'Tiêu hóa', summary: 'Tình trạng sưng viêm đột ngột ở niêm mạc dạ dày.', detail: 'Điều trị bằng cách sử dụng thuốc kháng axit, chế độ ăn nhẹ, nghỉ ngơi.', author: 'BS. Nguyễn Văn An' },
      { name: 'Tăng huyết áp', type: 'Tim mạch', summary: 'Trạng thái áp lực máu lên thành động mạch cao hơn mức bình thường.', detail: 'Thay đổi lối sống, dùng thuốc điều trị huyết áp, theo dõi định kỳ.', author: 'BS. Trần Hữu Đức' }
    ]
  });

  // 4. Appointments
  console.log('Creating appointments...');
  const appt1 = await prisma.appointment.create({
    data: {
      patientId: patientB.patient!.id,
      doctorId: doctor2.doctor!.id,
      userId: patientB.id,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      status: AppointmentStatus.COMPLETED,
      reason: 'Đau bụng thượng vị',
      symptoms: 'Đau bụng thượng vị, Buồn nôn, Đầy hơi sau khi ăn',
      department: 'Tiêu hóa',
    }
  });

  const appt2 = await prisma.appointment.create({
    data: {
      patientId: patientA.patient!.id,
      doctorId: doctor1.doctor!.id,
      userId: patientA.id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      status: AppointmentStatus.CONFIRMED,
      reason: 'Khám sức khỏe định kỳ',
      department: 'Nội khoa',
    }
  });

  // 5. Medical Records
  console.log('Creating medical records...');
  const record1 = await prisma.medicalRecord.create({
    data: {
      patientId: patientB.patient!.id,
      doctorId: doctor2.doctor!.id,
      appointmentId: appt1.id,
      recordType: RecordType.DIAGNOSIS,
      diagnosis: 'Viêm dạ dày nhẹ, Rối loạn tiêu hóa',
      symptoms: 'Đau bụng thượng vị, Buồn nôn, Đầy hơi sau khi ăn',
      treatment: 'Omeprazole 20mg, Gaviscon 10ml',
      notes: 'Bệnh nhân tỉnh táo, số nhẹ, đau thượng vị. Đã thực hiện nội soi và xét nghiệm máu. Kết quả cho thấy viêm niêm mạc nhẹ, không có ổ loét.',
      recordDate: appt1.date,
    }
  });

  const record2 = await prisma.medicalRecord.create({
    data: {
      patientId: patientA.patient!.id,
      doctorId: doctor1.doctor!.id,
      recordType: RecordType.TREATMENT,
      diagnosis: 'Cảm cúm thông thường',
      symptoms: 'Sốt cao, Ho khan, Đau họng',
      treatment: 'Paracetamol 500mg',
      notes: 'Bệnh nhân sốt cao 39 độ, ho có đờm, đau họng. Các chỉ số sinh tồn ổn định.',
      recordDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    }
  });

  // 6. Lab Results
  console.log('Creating lab results...');
  await prisma.labResult.createMany({
    data: [
      {
        patientId: patientB.patient!.id,
        doctorId: doctor2.doctor!.id,
        technicianId: tech.technician!.id,
        medicalRecordId: record1.id,
        testName: 'Glucose Máu',
        status: 'COMPLETED',
        resultValue: '5.2',
        resultUnit: 'mmol/L',
        normalRange: '3.9-6.4',
        testDate: appt1.date,
      },
      {
        patientId: patientB.patient!.id,
        doctorId: doctor2.doctor!.id,
        technicianId: tech.technician!.id,
        medicalRecordId: record1.id,
        testName: 'WBC (Bạch cầu)',
        status: 'COMPLETED',
        resultValue: '11.2',
        resultUnit: 'G/L',
        normalRange: '4.0-10.0',
        description: 'Dấu hiệu nhiễm trùng nhẹ',
        testDate: appt1.date,
      },
      {
        patientId: patientB.patient!.id,
        doctorId: doctor2.doctor!.id,
        technicianId: tech.technician!.id,
        medicalRecordId: record1.id,
        testName: 'Protein Nước tiểu',
        status: 'COMPLETED',
        resultValue: 'Negative',
        normalRange: 'Negative',
        testDate: appt1.date,
      }
    ]
  });

  // 7. Prescriptions
  console.log('Creating prescriptions...');
  await prisma.prescription.createMany({
    data: [
      {
        patientId: patientB.patient!.id,
        doctorId: doctor2.doctor!.id,
        medicalRecordId: record1.id,
        medicationName: 'Omeprazole 20mg',
        treatmentType: 'Viêm dạ dày',
        dosage: '1 viên',
        frequency: 'Sáng 1 viên, Tối 1 viên',
        duration: 7,
        quantity: 14,
        instructions: 'Uống trước khi ăn 30 phút. Tránh đồ cay nóng.',
        prescriptionDate: appt1.date,
      },
      {
        patientId: patientB.patient!.id,
        doctorId: doctor2.doctor!.id,
        medicalRecordId: record1.id,
        medicationName: 'Gaviscon 10ml',
        treatmentType: 'Trào ngược',
        dosage: '1 gói',
        frequency: 'Sáng, Trưa, Tối mỗi buổi 1 gói',
        duration: 7,
        quantity: 21,
        instructions: 'Uống sau khi ăn và trước khi đi ngủ.',
        prescriptionDate: appt1.date,
      },
      {
        patientId: patientA.patient!.id,
        doctorId: doctor1.doctor!.id,
        medicalRecordId: record2.id,
        medicationName: 'Paracetamol 500mg',
        treatmentType: 'Hạ sốt',
        dosage: '1 viên',
        frequency: 'Cách 4-6 tiếng 1 viên nếu sốt',
        duration: 5,
        quantity: 10,
        instructions: 'Chỉ uống khi sốt trên 38.5 độ.',
        prescriptionDate: record2.recordDate,
      }
    ]
  });

  // 8. Payments
  console.log('Creating payments...');
  await prisma.payment.createMany({
    data: [
      {
        userId: patientB.id,
        appointmentId: appt1.id,
        amount: 2450000,
        status: PaymentStatus.COMPLETED,
        method: PaymentMethod.QR_CODE,
        transactionId: 'TXN-' + Math.floor(Math.random() * 1000000),
        paymentDate: appt1.date,
        description: 'Chi phí khám bệnh, nội soi và xét nghiệm ngày ' + appt1.date.toLocaleDateString(),
      },
      {
        userId: patientA.id,
        appointmentId: appt2.id,
        amount: 150000,
        status: PaymentStatus.PENDING,
        description: 'Khám Nội tổng quát (Chờ thanh toán)',
      }
    ]
  });

  console.log('✅ Super complete sample data seeding completed successfully!');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
