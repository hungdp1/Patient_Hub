import { ExamStatus, type MedicalExam, type DiseaseInfo, type MedicalRecord } from './types';

export const MOCK_EXAMS: MedicalExam[] = [
  { id: '1', name: 'Khám Nội tổng quát', room: 'Phòng 102', status: ExamStatus.COMPLETED, estimatedDuration: 15, currentWaitTime: 0, order: 1, price: 150000 },
  { id: '2', name: 'Xét nghiệm Máu', room: 'Phòng 201', status: ExamStatus.WAITING, estimatedDuration: 5, currentWaitTime: 45, order: 2, price: 350000 },
  { id: '3', name: 'Siêu âm Bụng', room: 'Phòng 305', status: ExamStatus.PENDING, estimatedDuration: 20, currentWaitTime: 10, order: 3, price: 450000 },
  { id: '4', name: 'X-quang Phổi', room: 'Phòng 108', status: ExamStatus.PENDING, estimatedDuration: 10, currentWaitTime: 60, order: 4, price: 200000 },
  { id: '5', name: 'Đo Điện tim', room: 'Phòng 210', status: ExamStatus.PENDING, estimatedDuration: 15, currentWaitTime: 5, order: 5, price: 180000 },
];

export const MOCK_DISEASES: DiseaseInfo[] = [
  {
    id: 'd1',
    name: 'Viêm dạ dày cấp',
    description: 'Tình trạng sưng viêm đột ngột ở niêm mạc dạ dày.',
    causes: ['Vi khuẩn H.pylori', 'Lạm dụng thuốc giảm đau', 'Căng thẳng kéo dài'],
    treatments: ['Sử dụng thuốc kháng axit', 'Chế độ ăn nhẹ', 'Nghỉ ngơi'],
    estimatedCost: { min: 500000, max: 2000000 },
    specialists: ['BS. Nguyễn Văn An', 'BS. Lê Thị Bình']
  },
  {
    id: 'd2',
    name: 'Tăng huyết áp',
    description: 'Trạng thái áp lực máu lên thành động mạch cao hơn mức bình thường.',
    causes: ['Di truyền', 'Chế độ ăn nhiều muối', 'Ít vận động'],
    treatments: ['Thay đổi lối sống', 'Dùng thuốc điều trị huyết áp', 'Theo dõi định kỳ'],
    estimatedCost: { min: 200000, max: 1500000 },
    specialists: ['BS. Trần Hữu Đức', 'BS. Phạm Minh Hoàng']
  }
];

export const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: 'r1',
    patientName: 'Nguyễn Văn A',
    symptoms: ['Đau bụng thượng vị', 'Buồn nôn', 'Đầy hơi sau khi ăn'],
    date: '2026-04-15',
    createdAt: '2026-04-15T08:00:00Z',
    doctor: 'BS. Nguyễn Văn An',
    diagnosis: 'Viêm dạ dày nhẹ, Rối loạn tiêu hóa',
    summary: 'Bệnh nhân tỉnh táo, số nhẹ, đau thượng vị. Đã thực hiện nội soi và xét nghiệm máu. Kết quả cho thấy viêm niêm mạc nhẹ, không có ổ loét.',
    billingStatus: 'PAID',
    totalCost: 2450000,
    results: {
      blood: [
        { name: 'Glucose', value: '5.2', unit: 'mmol/L', range: '3.9-6.4', date: '2026-04-15', status: 'NORMAL' },
        { name: 'WBC (Bạch cầu)', value: '11.2', unit: 'G/L', range: '4.0-10.0', date: '2026-04-15', status: 'HIGH', details: 'Dấu hiệu nhiễm trùng nhẹ' },
        { name: 'RBC (Hồng cầu)', value: '4.5', unit: 'T/L', range: '3.8-5.8', date: '2026-04-15', status: 'NORMAL' }
      ],
      urine: [
        { name: 'Protein', value: 'Negative', unit: '', range: 'Negative', date: '2026-04-15', status: 'NORMAL' },
        { name: 'PH', value: '6.0', unit: '', range: '5.0-7.0', date: '2026-04-15', status: 'NORMAL' }
      ],
      imaging: [
        { 
          type: 'Siêu âm', 
          region: 'Ổ bụng', 
          conclusion: 'Viêm dạ dày nhẹ, Gan nhiễm mỡ độ 1', 
          date: '2026-04-15', 
          image: 'https://images.unsplash.com/photo-1579154235602-443b749d992d?q=80&w=600&auto=format&fit=crop',
          description: 'Niêm mạc dạ dày phù nề nhẹ, kích thước gan hơi lớn, cấu trúc âm đều.'
        },
        { 
          type: 'X-Quang', 
          region: 'Ngực thẳng', 
          conclusion: 'Chưa thấy tổn thương bất thường', 
          date: '2026-04-15', 
          image: 'https://images.unsplash.com/photo-1530210124508-cc1847cb8237?q=80&w=600&auto=format&fit=crop',
          description: 'Hai trường phổi sáng, bóng tim không lớn.'
        }
      ],
      cardiovascular: [
        { name: 'Nhịp tim', value: '82', unit: 'bpm', range: '60-100', date: '2026-04-15', status: 'NORMAL' }
      ],
      medications: [
        { 
          name: 'Omeprazole 20mg', 
          dosage: '1 viên', 
          quantity: 14, 
          price: 5000,
          unit: 'viên',
          morning: 1,
          noon: 0,
          afternoon: 0,
          evening: 1,
          duration: '7 ngày',
          instructions: 'Uống trước khi ăn 30 phút. Tránh đồ cay nóng.',
          purpose: 'Điều trị viêm loét dạ dày'
        },
        { 
          name: 'Gaviscon 10ml', 
          dosage: '1 gói', 
          quantity: 21, 
          price: 15000,
          unit: 'gói',
          morning: 1,
          noon: 1,
          afternoon: 0,
          evening: 1,
          duration: '7 ngày',
          instructions: 'Uống sau khi ăn và trước khi đi ngủ.',
          purpose: 'Giảm ợ chua, trào ngược'
        }
      ],
      prescriptionNotes: 'Tránh các chất kích thích như cà phê, trà đặc. Kiêng ăn đồ cay nóng và chua.',
      generalUsageInstructions: 'Sử dụng thuốc đúng liều lượng và thời gian quy định. Nếu có triệu chứng bất thường, hãy tạm dừng và liên hệ với bác sĩ.'
    }
  },
  {
    id: 'r2',
    patientName: 'Trần Thị B',
    symptoms: ['Sốt cao', 'Ho khan', 'Đau họng'],
    date: '2025-10-12',
    createdAt: '2025-10-12T10:00:00Z',
    doctor: 'BS. Lê Thị Bình',
    diagnosis: 'Cảm cúm thông thường',
    summary: 'Bệnh nhân sốt cao 39 độ, ho có đờm, đau họng. Các chỉ số sinh tồn ổn định.',
    billingStatus: 'PAID',
    totalCost: 450000,
    results: {
      medications: [
        { 
          name: 'Paracetamol 500mg', 
          dosage: '1 viên', 
          quantity: 10, 
          price: 2000,
          unit: 'viên',
          morning: 1,
          noon: 1,
          afternoon: 1,
          evening: 1,
          duration: '5 ngày',
          instructions: 'Chỉ uống khi sốt trên 38.5 độ. Cách nhau ít nhất 4-6 tiếng.',
          purpose: 'Hạ sốt, giảm đau họng'
        }
      ],
      prescriptionNotes: 'Nghỉ ngơi nhiều, uống đủ nước.',
      generalUsageInstructions: 'Uống thuốc với nước lọc.'
    }
  }
];
