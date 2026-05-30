/**
 * Patient Hub – Comprehensive sample data seeder
 *
 * Creates 2 accounts per role (10 total) with rich, varied data:
 *   - Many appointments (mix of statuses, past + upcoming)
 *   - Medical records, lab results, prescriptions
 *   - Payments (paid + pending)
 *   - Notifications, credit cards, library content
 *
 * Run inside the backend container:
 *   docker compose exec backend npm run seed
 *
 * Default password for every demo account: Password@123
 */
import dotenv from 'dotenv';
dotenv.config();

import {
  PrismaClient,
  UserRole,
  Gender,
  AppointmentStatus,
  RecordType,
  PaymentStatus,
  PaymentMethod,
  NotificationType,
} from '@prisma/client';
import { hashPassword } from './src/utils/password';
import { encryptAES256 } from './src/utils/crypto';

const prisma = new PrismaClient();

// ─── helpers ────────────────────────────────────────────
const DAY = 24 * 60 * 60 * 1000;
const daysAgo  = (n: number) => new Date(Date.now() - n * DAY);
const daysAhead = (n: number) => new Date(Date.now() + n * DAY);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log('🌱  Seeding super-comprehensive demo data...');

  // ─── 1. Clean slate ─────────────────────────────────
  console.log('   ↳ Cleaning existing data...');
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

  // ─── 2. Users — 2 per role ──────────────────────────
  console.log('   ↳ Creating 10 demo accounts (2 per role)...');
  const pwd = await hashPassword('Password@123');

  // ADMIN ×2
  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@patienthub.local',
      phoneNumber: '0900000001',
      passwordHash: pwd,
      firstName: 'Nguyễn',
      lastName: 'Quản Lý',
      role: UserRole.ADMIN,
      gender: Gender.MALE,
      address: 'Số 1 Lê Duẩn, Quận 1, TP.HCM',
      dateOfBirth: new Date('1980-03-12'),
    },
  });
  const admin2 = await prisma.user.create({
    data: {
      email: 'admin2@patienthub.local',
      phoneNumber: '0900000011',
      passwordHash: pwd,
      firstName: 'Trần',
      lastName: 'Giám Đốc',
      role: UserRole.ADMIN,
      gender: Gender.FEMALE,
      address: '22 Nguyễn Huệ, Quận 1, TP.HCM',
      dateOfBirth: new Date('1978-07-25'),
    },
  });

  // DOCTOR ×2
  const doctor1 = await prisma.user.create({
    data: {
      email: 'doctor1@patienthub.local',
      phoneNumber: '0900000002',
      passwordHash: pwd,
      firstName: 'Lê',
      lastName: 'Thành Nam',
      role: UserRole.DOCTOR,
      gender: Gender.MALE,
      dateOfBirth: new Date('1975-05-18'),
      doctor: {
        create: {
          specialization: 'Nội tổng quát',
          degree: 'Bác sĩ chuyên khoa II',
          licenseNumber: 'DR-1001',
          department: 'Nội khoa',
          office: 'Phòng 102',
          experience: 18,
          achievements: 'Hơn 5000 ca khám thành công',
          rating: 4.9,
          availableSlots: JSON.stringify({
            monday: ['08:00-12:00', '13:00-17:00'],
            tuesday: ['08:00-12:00', '13:00-17:00'],
            wednesday: ['08:00-12:00'],
            thursday: ['13:00-17:00'],
            friday: ['08:00-12:00', '13:00-17:00'],
          }),
        },
      },
    },
    include: { doctor: true },
  });
  const doctor2 = await prisma.user.create({
    data: {
      email: 'doctor2@patienthub.local',
      phoneNumber: '0900000022',
      passwordHash: pwd,
      firstName: 'Nguyễn',
      lastName: 'Văn An',
      role: UserRole.DOCTOR,
      gender: Gender.MALE,
      dateOfBirth: new Date('1982-11-03'),
      doctor: {
        create: {
          specialization: 'Tiêu hóa - Gan mật',
          degree: 'Tiến sĩ Y khoa',
          licenseNumber: 'DR-1002',
          department: 'Tiêu hóa',
          office: 'Phòng 201',
          experience: 15,
          achievements: 'Tốt nghiệp Đại học Y Hà Nội, tu nghiệp Nhật Bản',
          rating: 4.8,
          availableSlots: JSON.stringify({
            monday: ['09:00-12:00'],
            wednesday: ['08:00-12:00', '14:00-17:00'],
            friday: ['08:00-12:00'],
          }),
        },
      },
    },
    include: { doctor: true },
  });

  // TECHNICIAN ×2
  const tech1 = await prisma.user.create({
    data: {
      email: 'tech1@patienthub.local',
      phoneNumber: '0900000003',
      passwordHash: pwd,
      firstName: 'Nguyễn',
      lastName: 'Văn Khoa',
      role: UserRole.TECHNICIAN,
      gender: Gender.MALE,
      dateOfBirth: new Date('1985-04-20'),
      technician: { create: { department: 'Xét nghiệm', specialization: 'Sinh hóa' } },
    },
    include: { technician: true },
  });
  const tech2 = await prisma.user.create({
    data: {
      email: 'tech2@patienthub.local',
      phoneNumber: '0900000033',
      passwordHash: pwd,
      firstName: 'Phạm',
      lastName: 'Thị Lan',
      role: UserRole.TECHNICIAN,
      gender: Gender.FEMALE,
      dateOfBirth: new Date('1990-09-14'),
      technician: { create: { department: 'Xét nghiệm', specialization: 'Huyết học' } },
    },
    include: { technician: true },
  });

  // STAFF ×2
  await prisma.user.create({
    data: {
      email: 'staff1@patienthub.local',
      phoneNumber: '0900000005',
      passwordHash: pwd,
      firstName: 'Vũ',
      lastName: 'Thị Mai',
      role: UserRole.STAFF,
      gender: Gender.FEMALE,
      dateOfBirth: new Date('1992-06-08'),
      staff: { create: { position: 'Lễ tân', department: 'Tiếp nhận bệnh nhân' } },
    },
  });
  await prisma.user.create({
    data: {
      email: 'staff2@patienthub.local',
      phoneNumber: '0900000055',
      passwordHash: pwd,
      firstName: 'Đỗ',
      lastName: 'Văn Hùng',
      role: UserRole.STAFF,
      gender: Gender.MALE,
      dateOfBirth: new Date('1988-12-15'),
      staff: { create: { position: 'Hành chính', department: 'Văn phòng' } },
    },
  });

  // PATIENT ×2
  const patient1 = await prisma.user.create({
    data: {
      email: 'patient@patienthub.local',
      phoneNumber: '0900000004',
      passwordHash: pwd,
      firstName: 'Trần',
      lastName: 'Thị B',
      role: UserRole.PATIENT,
      gender: Gender.FEMALE,
      address: '125 Nguyễn Trãi, Quận 5, TP.HCM',
      dateOfBirth: new Date('1995-08-22'),
      patient: {
        create: {
          bloodType: 'O+',
          allergies: 'Penicillin, Hải sản',
          chronicDiseases: 'Viêm xoang mãn tính',
          emergencyContact: '0901234567 (Mẹ - Trần Thị Hoa)',
          insuranceId: 'INS-2024-0001',
          insuranceProvider: 'Bảo hiểm Y tế Quốc gia',
        },
      },
    },
    include: { patient: true },
  });
  const patient2 = await prisma.user.create({
    data: {
      email: 'patient2@patienthub.local',
      phoneNumber: '0900000044',
      passwordHash: pwd,
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      role: UserRole.PATIENT,
      gender: Gender.MALE,
      address: '78 Trần Hưng Đạo, Quận 1, TP.HCM',
      dateOfBirth: new Date('1988-02-10'),
      patient: {
        create: {
          bloodType: 'A+',
          allergies: 'Không',
          chronicDiseases: 'Viêm dạ dày, Cao huyết áp nhẹ',
          emergencyContact: '0907654321 (Vợ - Lê Thị Hương)',
          insuranceId: 'INS-2024-0002',
          insuranceProvider: 'Bảo Việt Health',
        },
      },
    },
    include: { patient: true },
  });

  // ─── 3. Hospital services ──────────────────────────
  console.log('   ↳ Creating hospital services...');
  await prisma.hospitalService.createMany({
    data: [
      { name: 'Khám Nội tổng quát',        category: 'Khám bệnh',             price: 150000, duration: 15, description: 'Khám sức khỏe tổng quát, kiểm tra các chỉ số cơ bản.' },
      { name: 'Khám Chuyên khoa Tiêu hóa', category: 'Khám bệnh',             price: 250000, duration: 20, description: 'Chuyên gia tiêu hóa thăm khám, tư vấn điều trị.' },
      { name: 'Xét nghiệm Máu Tổng quát',  category: 'Xét nghiệm',            price: 350000, duration: 10, description: 'Công thức máu, sinh hóa, đường huyết, mỡ máu.' },
      { name: 'Xét nghiệm Nước tiểu',      category: 'Xét nghiệm',            price: 120000, duration: 5,  description: 'Kiểm tra protein, glucose, vi khuẩn trong nước tiểu.' },
      { name: 'Siêu âm Bụng',              category: 'Chẩn đoán hình ảnh',    price: 450000, duration: 20, description: 'Siêu âm gan, mật, tụy, thận, lách.' },
      { name: 'Siêu âm Tim',               category: 'Chẩn đoán hình ảnh',    price: 550000, duration: 25, description: 'Siêu âm tim đánh giá chức năng tim mạch.' },
      { name: 'X-quang Phổi',              category: 'Chẩn đoán hình ảnh',    price: 200000, duration: 10, description: 'Chụp X-quang phổi tầm soát bệnh hô hấp.' },
      { name: 'Đo Điện tim (ECG)',         category: 'Thăm dò chức năng',     price: 180000, duration: 15, description: 'Đo điện tim đánh giá nhịp tim, rối loạn.' },
      { name: 'Nội soi Dạ dày',            category: 'Thủ thuật',             price: 1200000, duration: 30, description: 'Nội soi đường tiêu hóa trên, sinh thiết nếu cần.' },
      { name: 'Tiêm Vắc xin Cúm',          category: 'Dự phòng',              price: 250000, duration: 5,  description: 'Tiêm phòng cúm mùa, bảo vệ 6-12 tháng.' },
      { name: 'Khám Sản phụ khoa',         category: 'Khám bệnh',             price: 300000, duration: 20, description: 'Khám phụ khoa định kỳ, tư vấn sức khỏe sinh sản.' },
      { name: 'Vật lý trị liệu',           category: 'Phục hồi chức năng',    price: 400000, duration: 45, description: 'Vật lý trị liệu cơ xương khớp.' },
    ],
  });

  // ─── 4. Medical library ────────────────────────────
  console.log('   ↳ Creating medical library content...');
  await prisma.disease.createMany({
    data: [
      { name: 'Viêm dạ dày cấp',  type: 'Tiêu hóa',  summary: 'Sưng viêm đột ngột ở niêm mạc dạ dày, gây đau bụng vùng thượng vị.', detail: 'Điều trị bằng thuốc kháng axit, chế độ ăn nhẹ, nghỉ ngơi. Tránh đồ cay nóng, rượu bia.', author: 'BS. Nguyễn Văn An' },
      { name: 'Tăng huyết áp',    type: 'Tim mạch',  summary: 'Áp lực máu lên thành động mạch cao hơn bình thường (>140/90 mmHg).', detail: 'Thay đổi lối sống: giảm muối, tập thể dục, kiểm soát cân nặng. Dùng thuốc theo chỉ định.', author: 'BS. Trần Hữu Đức' },
      { name: 'Đái tháo đường type 2', type: 'Nội tiết', summary: 'Rối loạn chuyển hóa glucose mạn tính do kháng insulin.', detail: 'Quản lý bằng chế độ ăn ít đường, tập thể dục đều đặn, thuốc uống hoặc tiêm insulin.', author: 'BS. Lê Thành Nam' },
      { name: 'Hen phế quản',     type: 'Hô hấp',    summary: 'Bệnh viêm mạn tính đường hô hấp gây co thắt phế quản.', detail: 'Dùng thuốc giãn phế quản, corticoid hít. Tránh dị nguyên kích thích.', author: 'BS. Phạm Quốc Hùng' },
      { name: 'Trào ngược dạ dày thực quản', type: 'Tiêu hóa', summary: 'Acid dạ dày trào ngược lên thực quản gây ợ chua, đau ngực.', detail: 'Dùng PPI, kê cao đầu khi ngủ, tránh ăn no trước khi ngủ.', author: 'BS. Nguyễn Văn An' },
      { name: 'Viêm phổi cộng đồng', type: 'Hô hấp', summary: 'Nhiễm khuẩn ở nhu mô phổi, gây sốt, ho có đờm, khó thở.', detail: 'Điều trị kháng sinh phù hợp tác nhân, hỗ trợ hô hấp khi cần.', author: 'BS. Lê Thành Nam' },
      { name: 'Suy tim mạn',      type: 'Tim mạch',  summary: 'Tim không bơm đủ máu cho nhu cầu cơ thể.', detail: 'Dùng thuốc ức chế men chuyển, lợi tiểu, beta-blocker. Hạn chế muối.', author: 'BS. Trần Hữu Đức' },
    ],
  });

  await prisma.drug.createMany({
    data: [
      { name: 'Omeprazole 20mg',    type: 'Ức chế bơm proton', summary: 'Thuốc giảm tiết acid dạ dày.', detail: 'Liều: 20mg/ngày uống trước ăn sáng. Chỉ định: viêm loét dạ dày, trào ngược.', author: 'Dược sĩ Phương' },
      { name: 'Amoxicillin 500mg',  type: 'Kháng sinh',         summary: 'Kháng sinh nhóm beta-lactam.', detail: 'Liều: 500mg × 3 lần/ngày sau ăn. Cẩn trọng dị ứng penicillin.', author: 'Dược sĩ Phương' },
      { name: 'Paracetamol 500mg',  type: 'Giảm đau hạ sốt',    summary: 'Thuốc giảm đau, hạ sốt an toàn.', detail: 'Liều: 500-1000mg/lần, tối đa 4g/ngày. Người lớn và trẻ em đều dùng được.', author: 'Dược sĩ Phương' },
      { name: 'Metformin 850mg',    type: 'Hạ đường huyết',     summary: 'Điều trị đái tháo đường type 2.', detail: 'Liều khởi đầu 500mg × 2/ngày, tăng dần. Uống cùng bữa ăn.', author: 'Dược sĩ Phương' },
      { name: 'Losartan 50mg',      type: 'Ức chế thụ thể AT1', summary: 'Điều trị tăng huyết áp.', detail: 'Liều: 50mg × 1 lần/ngày. Hiệu quả sau 3-6 tuần.', author: 'Dược sĩ Phương' },
      { name: 'Salbutamol xịt',     type: 'Giãn phế quản',      summary: 'Cấp cứu cơn hen.', detail: 'Xịt 1-2 nhát khi khó thở, không quá 8 lần/ngày.', author: 'Dược sĩ Phương' },
    ],
  });

  await prisma.procedure.createMany({
    data: [
      { name: 'Nội soi dạ dày',      type: 'Chẩn đoán', summary: 'Quan sát trực tiếp niêm mạc dạ dày bằng ống soi.', detail: 'Bệnh nhân nhịn ăn 8h, có thể gây mê. Sinh thiết nếu nghi ngờ.', author: 'BS. Nguyễn Văn An' },
      { name: 'Siêu âm Doppler tim', type: 'Chẩn đoán', summary: 'Đánh giá dòng máu qua các van tim.', detail: 'Không xâm lấn, không cần chuẩn bị đặc biệt.', author: 'BS. Trần Hữu Đức' },
      { name: 'Cấy máu',             type: 'Xét nghiệm', summary: 'Phát hiện vi khuẩn trong máu.', detail: 'Lấy máu vào chai cấy, ủ 5-7 ngày. Kháng sinh đồ nếu dương tính.', author: 'KTV. Nguyễn Văn Khoa' },
      { name: 'Đặt nội khí quản',    type: 'Cấp cứu',   summary: 'Đặt ống qua khí quản hỗ trợ hô hấp.', detail: 'Cấp cứu khi suy hô hấp nặng, cần gây mê khi tỉnh.', author: 'BS. Lê Thành Nam' },
      { name: 'Truyền dịch',         type: 'Điều trị',  summary: 'Bù nước, điện giải qua tĩnh mạch.', detail: 'Tốc độ truyền tùy chỉ định, theo dõi sát.', author: 'BS. Lê Thành Nam' },
    ],
  });

  await prisma.labTest.createMany({
    data: [
      { name: 'Công thức máu (CBC)',     type: 'Huyết học',  summary: 'Đếm tế bào máu: hồng cầu, bạch cầu, tiểu cầu.', detail: 'Phát hiện thiếu máu, nhiễm trùng, rối loạn đông máu.', author: 'KTV. Phạm Thị Lan' },
      { name: 'Đường huyết lúc đói',     type: 'Sinh hóa',   summary: 'Glucose máu sau nhịn ăn 8h.', detail: 'Bình thường < 5.6 mmol/L. > 7.0 chẩn đoán đái tháo đường.', author: 'KTV. Nguyễn Văn Khoa' },
      { name: 'Lipid máu',               type: 'Sinh hóa',   summary: 'Cholesterol toàn phần, LDL, HDL, triglyceride.', detail: 'Đánh giá nguy cơ tim mạch. Nhịn ăn 12h trước xét nghiệm.', author: 'KTV. Nguyễn Văn Khoa' },
      { name: 'Chức năng gan (AST/ALT)', type: 'Sinh hóa',   summary: 'Men gan, đánh giá tổn thương tế bào gan.', detail: 'Tăng khi viêm gan, ngộ độc thuốc, uống rượu.', author: 'KTV. Nguyễn Văn Khoa' },
      { name: 'Chức năng thận (Creatinine, Urea)', type: 'Sinh hóa', summary: 'Đánh giá chức năng lọc của thận.', detail: 'Creatinine bình thường: nam 0.7-1.3 mg/dL, nữ 0.6-1.1.', author: 'KTV. Nguyễn Văn Khoa' },
      { name: 'Tổng phân tích nước tiểu', type: 'Sinh hóa', summary: 'Kiểm tra protein, glucose, ceton, vi khuẩn.', detail: 'Hỗ trợ chẩn đoán bệnh thận, đái tháo đường, nhiễm trùng tiết niệu.', author: 'KTV. Nguyễn Văn Khoa' },
    ],
  });

  // ─── 5. Appointments (rich, varied) ────────────────
  console.log('   ↳ Creating appointments across statuses & time...');
  const apptData = [
    // patient1 - past completed
    { patient: patient1, doctor: doctor1, dateFn: () => daysAgo(45), status: AppointmentStatus.COMPLETED, reason: 'Khám sức khỏe định kỳ',     dept: 'Nội khoa',  symptoms: 'Khỏe mạnh, kiểm tra định kỳ' },
    { patient: patient1, doctor: doctor2, dateFn: () => daysAgo(30), status: AppointmentStatus.COMPLETED, reason: 'Đau bụng vùng thượng vị',   dept: 'Tiêu hóa',  symptoms: 'Đau bụng âm ỉ, ợ chua, đầy hơi sau ăn' },
    { patient: patient1, doctor: doctor1, dateFn: () => daysAgo(14), status: AppointmentStatus.COMPLETED, reason: 'Tái khám viêm xoang',       dept: 'Nội khoa',  symptoms: 'Nghẹt mũi, đau đầu vùng trán' },
    // patient1 - upcoming
    { patient: patient1, doctor: doctor1, dateFn: () => daysAhead(2),  status: AppointmentStatus.CONFIRMED, reason: 'Khám sức khỏe định kỳ',   dept: 'Nội khoa',  symptoms: 'Khám tổng quát quý' },
    { patient: patient1, doctor: doctor2, dateFn: () => daysAhead(10), status: AppointmentStatus.PENDING,   reason: 'Tư vấn kết quả nội soi',  dept: 'Tiêu hóa',  symptoms: 'Đọc và tư vấn kết quả xét nghiệm' },

    // patient2 - rich history
    { patient: patient2, doctor: doctor2, dateFn: () => daysAgo(60), status: AppointmentStatus.COMPLETED, reason: 'Đau bụng thượng vị',         dept: 'Tiêu hóa',  symptoms: 'Đau bụng dữ dội, buồn nôn' },
    { patient: patient2, doctor: doctor2, dateFn: () => daysAgo(40), status: AppointmentStatus.COMPLETED, reason: 'Nội soi dạ dày',            dept: 'Tiêu hóa',  symptoms: 'Đau bụng kéo dài, sút cân' },
    { patient: patient2, doctor: doctor1, dateFn: () => daysAgo(20), status: AppointmentStatus.COMPLETED, reason: 'Khám huyết áp định kỳ',     dept: 'Nội khoa',  symptoms: 'Đau đầu nhẹ, chóng mặt' },
    { patient: patient2, doctor: doctor2, dateFn: () => daysAgo(7),  status: AppointmentStatus.COMPLETED, reason: 'Tái khám viêm dạ dày',      dept: 'Tiêu hóa',  symptoms: 'Đỡ đau, vẫn còn ợ chua' },
    { patient: patient2, doctor: doctor1, dateFn: () => daysAhead(1),  status: AppointmentStatus.CONFIRMED, reason: 'Khám tổng quát',          dept: 'Nội khoa',  symptoms: 'Kiểm tra huyết áp, đường huyết' },
    { patient: patient2, doctor: doctor2, dateFn: () => daysAhead(5),  status: AppointmentStatus.CONFIRMED, reason: 'Nội soi kiểm tra',        dept: 'Tiêu hóa',  symptoms: 'Theo dõi định kỳ' },
    { patient: patient2, doctor: doctor1, dateFn: () => daysAhead(14), status: AppointmentStatus.PENDING,   reason: 'Tư vấn chế độ ăn',        dept: 'Nội khoa',  symptoms: 'Giảm cân, kiểm soát huyết áp' },

    // a cancelled one for variety
    { patient: patient1, doctor: doctor2, dateFn: () => daysAgo(3),  status: AppointmentStatus.CANCELLED, reason: 'Khám tiêu hóa',             dept: 'Tiêu hóa',  symptoms: 'Bệnh nhân hủy do bận' },
  ];

  const appointments: Array<{ id: string; patientId: string; doctorId: string; date: Date }> = [];
  for (const a of apptData) {
    const created = await prisma.appointment.create({
      data: {
        patientId: a.patient.patient!.id,
        doctorId:  a.doctor.doctor!.id,
        userId:    a.patient.id,
        date: a.dateFn(),
        status: a.status,
        reason: a.reason,
        symptoms: a.symptoms,
        department: a.dept,
      },
    });
    appointments.push({
      id: created.id,
      patientId: a.patient.patient!.id,
      doctorId:  a.doctor.doctor!.id,
      date: created.date,
    });
  }

  // ─── 6. Medical records for COMPLETED appointments ─
  console.log('   ↳ Creating medical records...');
  const recordsData = [
    { idx: 0, type: RecordType.GENERAL_CHECKUP, diagnosis: 'Sức khỏe ổn định',                                      symptoms: 'Khỏe mạnh',                                          treatment: 'Theo dõi định kỳ',                  notes: 'Các chỉ số trong giới hạn bình thường. Khuyến cáo duy trì lối sống lành mạnh.' },
    { idx: 1, type: RecordType.DIAGNOSIS,       diagnosis: 'Trào ngược dạ dày thực quản (GERD)',                    symptoms: 'Ợ chua, đầy hơi, đau thượng vị',                     treatment: 'Omeprazole 20mg, thay đổi chế độ ăn',  notes: 'Bệnh nhân được kê toa và hướng dẫn ăn uống. Tái khám sau 4 tuần.' },
    { idx: 2, type: RecordType.FOLLOW_UP,       diagnosis: 'Viêm xoang mạn ổn định',                                symptoms: 'Còn nghẹt mũi nhẹ',                                  treatment: 'Xịt rửa mũi, kháng histamine khi cần',  notes: 'Triệu chứng giảm đáng kể. Tiếp tục theo dõi 2 tháng.' },
    { idx: 5, type: RecordType.DIAGNOSIS,       diagnosis: 'Viêm dạ dày cấp do stress',                             symptoms: 'Đau bụng dữ dội, buồn nôn',                          treatment: 'Omeprazole, Gaviscon, nghỉ ngơi',     notes: 'Khuyến cáo giảm stress, ăn uống điều độ. Tái khám 2 tuần.' },
    { idx: 6, type: RecordType.DIAGNOSIS,       diagnosis: 'Viêm loét dạ dày (sinh thiết âm tính H. pylori)',       symptoms: 'Đau bụng kéo dài, sút cân 2kg',                      treatment: 'PPI liều cao, kiêng kích thích',      notes: 'Nội soi: tổn thương niêm mạc hang vị 3mm. Theo dõi 3 tháng.' },
    { idx: 7, type: RecordType.TREATMENT,       diagnosis: 'Tăng huyết áp độ 1',                                    symptoms: 'Đau đầu, chóng mặt thoáng qua',                      treatment: 'Losartan 50mg/ngày, giảm muối',       notes: 'HA đo: 145/92. Khuyến cáo theo dõi tại nhà mỗi ngày.' },
    { idx: 8, type: RecordType.FOLLOW_UP,       diagnosis: 'Viêm dạ dày đang lành',                                 symptoms: 'Đỡ đau, còn ợ chua',                                 treatment: 'Tiếp tục Omeprazole 4 tuần',           notes: 'Triệu chứng cải thiện 70%. Hẹn nội soi kiểm tra sau 2 tháng.' },
  ];

  const records: Array<{ id: string; idx: number; date: Date; patientId: string; doctorId: string }> = [];
  for (const r of recordsData) {
    const a = appointments[r.idx];
    const created = await prisma.medicalRecord.create({
      data: {
        patientId: a.patientId,
        doctorId:  a.doctorId,
        appointmentId: a.id,
        recordType: r.type,
        diagnosis: r.diagnosis,
        symptoms: r.symptoms,
        treatment: r.treatment,
        notes: r.notes,
        recordDate: a.date,
      },
    });
    records.push({ id: created.id, idx: r.idx, date: a.date, patientId: a.patientId, doctorId: a.doctorId });
  }

  // ─── 7. Lab results (multiple per record) ──────────
  console.log('   ↳ Creating lab results...');
  const labResults: any[] = [];
  for (const rec of records) {
    const techId = pick([tech1.technician!.id, tech2.technician!.id]);
    // 3-5 lab tests per record
    const tests = [
      { name: 'Glucose máu',     unit: 'mmol/L', range: '3.9-6.4',  val: (4 + Math.random() * 4).toFixed(1) },
      { name: 'WBC (Bạch cầu)',  unit: 'G/L',    range: '4.0-10.0', val: (5 + Math.random() * 6).toFixed(1) },
      { name: 'RBC (Hồng cầu)',  unit: 'T/L',    range: '4.0-5.5',  val: (4 + Math.random() * 1.5).toFixed(2) },
      { name: 'Hemoglobin',      unit: 'g/L',    range: '120-160',  val: Math.floor(110 + Math.random() * 60).toString() },
      { name: 'Cholesterol TP',  unit: 'mmol/L', range: '<5.2',     val: (3.5 + Math.random() * 2.5).toFixed(2) },
      { name: 'AST',             unit: 'U/L',    range: '<40',      val: Math.floor(15 + Math.random() * 35).toString() },
      { name: 'ALT',             unit: 'U/L',    range: '<41',      val: Math.floor(15 + Math.random() * 40).toString() },
      { name: 'Creatinine',      unit: 'mg/dL',  range: '0.6-1.3',  val: (0.7 + Math.random() * 0.7).toFixed(2) },
    ];
    const numTests = 3 + Math.floor(Math.random() * 3);
    const chosen = [...tests].sort(() => 0.5 - Math.random()).slice(0, numTests);
    for (const t of chosen) {
      labResults.push({
        patientId: rec.patientId,
        doctorId:  rec.doctorId,
        technicianId: techId,
        medicalRecordId: rec.id,
        testName: t.name,
        status: 'COMPLETED',
        resultValue: t.val,
        resultUnit:  t.unit,
        normalRange: t.range,
        testDate: rec.date,
      });
    }
  }
  await prisma.labResult.createMany({ data: labResults });

  // ─── 8. Prescriptions ──────────────────────────────
  console.log('   ↳ Creating prescriptions...');
  const prescData = [
    { recIdx: 1, med: 'Omeprazole 20mg',  treat: 'Trào ngược', dosage: '1 viên', freq: 'Sáng trước ăn 30 phút', duration: 28, qty: 28, ins: 'Uống trước bữa sáng. Tránh cay nóng, rượu bia.' },
    { recIdx: 1, med: 'Gaviscon 10ml',    treat: 'Trào ngược', dosage: '1 gói',  freq: 'Sau ăn và trước khi ngủ', duration: 14, qty: 56, ins: 'Lắc đều trước khi uống. Có thể dùng cùng nước.' },
    { recIdx: 2, med: 'Cetirizine 10mg',  treat: 'Dị ứng',     dosage: '1 viên', freq: '1 lần/ngày tối', duration: 14, qty: 14, ins: 'Uống sau bữa tối. Có thể gây buồn ngủ.' },
    { recIdx: 3, med: 'Omeprazole 20mg',  treat: 'Viêm dạ dày', dosage: '1 viên', freq: '2 lần/ngày sáng-tối', duration: 14, qty: 28, ins: 'Trước ăn 30 phút. Liều cao hơn để chữa cấp.' },
    { recIdx: 3, med: 'Maalox',           treat: 'Trung hòa acid', dosage: '1 viên nhai', freq: 'Khi đau, tối đa 4 lần/ngày', duration: 14, qty: 30, ins: 'Nhai kỹ, không nuốt nguyên viên.' },
    { recIdx: 4, med: 'Pantoprazole 40mg', treat: 'Viêm loét', dosage: '1 viên', freq: 'Sáng trước ăn', duration: 56, qty: 56, ins: 'Điều trị 8 tuần, không tự ý ngừng.' },
    { recIdx: 4, med: 'Sucralfate 1g',    treat: 'Bảo vệ niêm mạc', dosage: '1 gói pha nước', freq: '4 lần/ngày trước ăn và trước ngủ', duration: 28, qty: 120, ins: 'Cách xa các thuốc khác 2 giờ.' },
    { recIdx: 5, med: 'Losartan 50mg',    treat: 'Tăng huyết áp', dosage: '1 viên', freq: '1 lần/ngày sáng', duration: 90, qty: 90, ins: 'Uống đều đặn cùng giờ. Theo dõi HA tại nhà.' },
    { recIdx: 5, med: 'Aspirin 81mg',     treat: 'Dự phòng tim mạch', dosage: '1 viên', freq: '1 lần/ngày sau ăn tối', duration: 90, qty: 90, ins: 'Liều thấp dự phòng. Báo bác sĩ nếu xuất huyết.' },
    { recIdx: 6, med: 'Omeprazole 20mg',  treat: 'Viêm dạ dày', dosage: '1 viên', freq: '1 lần/ngày sáng', duration: 28, qty: 28, ins: 'Duy trì sau giai đoạn cấp.' },
  ];

  for (const p of prescData) {
    const rec = records.find((r) => r.idx === p.recIdx);
    if (!rec) continue;
    await prisma.prescription.create({
      data: {
        patientId: rec.patientId,
        doctorId:  rec.doctorId,
        medicalRecordId: rec.id,
        medicationName: p.med,
        treatmentType: p.treat,
        dosage: p.dosage,
        frequency: p.freq,
        duration: p.duration,
        quantity: p.qty,
        instructions: p.ins,
        prescriptionDate: rec.date,
      },
    });
  }

  // ─── 9. Credit cards (encrypted) ────────────────────
  console.log('   ↳ Creating encrypted credit cards...');
  for (const p of [patient1, patient2]) {
    await prisma.creditCard.create({
      data: {
        userId: p.id,
        cardholderName: encryptAES256(`${p.firstName} ${p.lastName}`),
        cardNumber: encryptAES256('4111111111111111'),
        expiryDate: encryptAES256('12/27'),
        cvv: encryptAES256('123'),
        address: encryptAES256(p.address || ''),
        city: encryptAES256('TP. Hồ Chí Minh'),
        postalCode: encryptAES256('700000'),
        isEncrypted: true,
        isDefault: true,
      },
    });
  }

  // ─── 10. Payments ──────────────────────────────────
  console.log('   ↳ Creating payments...');
  const paymentsData = [
    // patient1
    { user: patient1, apptIdx: 0,  amount: 150000,  status: PaymentStatus.COMPLETED, method: PaymentMethod.CASH,         desc: 'Khám tổng quát định kỳ' },
    { user: patient1, apptIdx: 1,  amount: 850000,  status: PaymentStatus.COMPLETED, method: PaymentMethod.CREDIT_CARD,  desc: 'Khám tiêu hóa + xét nghiệm + thuốc' },
    { user: patient1, apptIdx: 2,  amount: 250000,  status: PaymentStatus.COMPLETED, method: PaymentMethod.E_WALLET,     desc: 'Tái khám viêm xoang' },
    { user: patient1, apptIdx: 3,  amount: 150000,  status: PaymentStatus.PENDING,   method: PaymentMethod.CREDIT_CARD,  desc: 'Khám sức khỏe định kỳ (chờ thanh toán)' },

    // patient2
    { user: patient2, apptIdx: 5,  amount: 450000,  status: PaymentStatus.COMPLETED, method: PaymentMethod.CREDIT_CARD,  desc: 'Khám tiêu hóa + xét nghiệm' },
    { user: patient2, apptIdx: 6,  amount: 1800000, status: PaymentStatus.COMPLETED, method: PaymentMethod.CREDIT_CARD,  desc: 'Nội soi dạ dày + sinh thiết' },
    { user: patient2, apptIdx: 7,  amount: 350000,  status: PaymentStatus.COMPLETED, method: PaymentMethod.BANK_TRANSFER,desc: 'Khám huyết áp + xét nghiệm máu' },
    { user: patient2, apptIdx: 8,  amount: 280000,  status: PaymentStatus.COMPLETED, method: PaymentMethod.E_WALLET,     desc: 'Tái khám viêm dạ dày' },
    { user: patient2, apptIdx: 9,  amount: 200000,  status: PaymentStatus.PENDING,   method: PaymentMethod.CREDIT_CARD,  desc: 'Khám tổng quát (chờ thanh toán)' },
    { user: patient2, apptIdx: 10, amount: 1200000, status: PaymentStatus.PENDING,   method: PaymentMethod.CREDIT_CARD,  desc: 'Nội soi kiểm tra định kỳ (chờ thanh toán)' },
  ];

  for (const p of paymentsData) {
    const a = appointments[p.apptIdx];
    await prisma.payment.create({
      data: {
        userId: p.user.id,
        appointmentId: a.id,
        amount: p.amount,
        status: p.status,
        method: p.method,
        transactionId: 'TXN-' + Math.floor(Math.random() * 9_000_000 + 1_000_000),
        paymentDate: p.status === PaymentStatus.COMPLETED ? a.date : undefined,
        description: p.desc,
      },
    });
  }

  // ─── 11. Notifications ─────────────────────────────
  console.log('   ↳ Creating notifications...');
  const notifications: any[] = [];
  for (const p of [patient1, patient2]) {
    notifications.push(
      { userId: p.id, type: NotificationType.APPOINTMENT_REMINDER, title: 'Nhắc lịch khám',           message: 'Bạn có lịch khám sắp tới. Vui lòng đến đúng giờ.',                  isRead: false, createdAt: daysAgo(1) },
      { userId: p.id, type: NotificationType.LAB_RESULT_READY,     title: 'Kết quả xét nghiệm đã có',  message: 'Kết quả xét nghiệm máu của bạn đã sẵn sàng. Xem trong hồ sơ.',     isRead: false, createdAt: daysAgo(2) },
      { userId: p.id, type: NotificationType.PAYMENT_REMINDER,     title: 'Nhắc thanh toán',           message: 'Bạn có hóa đơn chưa thanh toán. Vui lòng kiểm tra.',                isRead: true,  createdAt: daysAgo(5),  readAt: daysAgo(4) },
      { userId: p.id, type: NotificationType.PRESCRIPTION_REFILL,  title: 'Đơn thuốc gần hết',         message: 'Đơn thuốc Omeprazole của bạn sắp hết, hãy đặt mua thêm.',          isRead: true,  createdAt: daysAgo(7),  readAt: daysAgo(6) },
      { userId: p.id, type: NotificationType.SYSTEM_ALERT,         title: 'Cập nhật hệ thống',         message: 'Hệ thống đã cập nhật giao diện mới. Khám phá nhé!',                 isRead: true,  createdAt: daysAgo(10), readAt: daysAgo(9) },
      { userId: p.id, type: NotificationType.MESSAGE,              title: 'Tin nhắn từ bác sĩ',        message: 'Bác sĩ đã ghi chú thêm trong hồ sơ của bạn.',                      isRead: false, createdAt: daysAgo(3) },
    );
  }
  // Notifications for admins too
  for (const a of [admin1, admin2]) {
    notifications.push(
      { userId: a.id, type: NotificationType.SYSTEM_ALERT, title: 'Báo cáo tuần',         message: '12 lịch khám mới, 8 thanh toán hoàn tất tuần qua.',  isRead: false, createdAt: daysAgo(1) },
      { userId: a.id, type: NotificationType.GENERAL,      title: 'Yêu cầu nghỉ phép',    message: 'BS. Nguyễn Văn An xin nghỉ phép 23/5-25/5.',         isRead: false, createdAt: daysAgo(2) },
    );
  }
  await prisma.notification.createMany({ data: notifications });

  // ─── 12. Done! ─────────────────────────────────────
  console.log('');
  console.log('✅  Seed completed successfully!');
  console.log('');
  console.log('   📊  Summary:');
  console.log(`       • 10 users   (2 per role)`);
  console.log(`       • 12 hospital services`);
  console.log(`       • 7 diseases · 6 drugs · 5 procedures · 6 lab tests`);
  console.log(`       • ${appointments.length} appointments (mix of statuses)`);
  console.log(`       • ${records.length} medical records`);
  console.log(`       • ${labResults.length} lab results`);
  console.log(`       • ${prescData.length} prescriptions`);
  console.log(`       • 2 encrypted credit cards`);
  console.log(`       • ${paymentsData.length} payments`);
  console.log(`       • ${notifications.length} notifications`);
  console.log('');
  console.log('   🔐  Demo accounts (password: Password@123):');
  console.log('       ADMIN       0900000001  ·  0900000011');
  console.log('       DOCTOR      0900000002  ·  0900000022');
  console.log('       TECHNICIAN  0900000003  ·  0900000033');
  console.log('       STAFF       0900000005  ·  0900000055');
  console.log('       PATIENT     0900000004  ·  0900000044');
}

main()
  .catch((error) => {
    console.error('❌  Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
