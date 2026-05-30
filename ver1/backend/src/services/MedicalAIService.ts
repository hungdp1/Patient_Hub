/**
 * Medical AI Assistant — Gemini-powered chat with three core capabilities:
 *
 *   1. SYMPTOM TRIAGE.   Given a patient's symptoms, the model suggests a
 *      likely condition and which department to book. The model decides
 *      what to call; the actual department recommendation logic lives in
 *      `recommendDepartment` below (a small symptom→specialty knowledge
 *      base).
 *
 *   2. LIBRARY / SERVICE LOOKUP.   The model can search the in-DB medical
 *      library (Disease / Drug / Procedure / LabTest) and the hospital's
 *      service catalogue. Useful for "thuốc Omeprazole là gì", "có dịch
 *      vụ siêu âm tim không", etc.
 *
 *   3. PERSONAL DATA LOOKUP.   The model can read the *current user's* own
 *      appointments, lab results, prescriptions and pending payments. All
 *      queries are scoped by `userId` — the model can never see another
 *      patient's data even if it tried.
 *
 * Implementation: Gemini "function calling" (`tools`). We give Gemini a
 * catalogue of function declarations; it decides which to call. We execute
 * the function locally, send the result back, and let it produce the final
 * natural-language answer. If `GEMINI_API_KEY` is missing we fall back to
 * a deterministic rule-based response so the chat doesn't break.
 */

import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import prisma from '../lib/prismaClient';

// ─── Symptom → department knowledge base ────────────────
//
// A tiny rule-based table used by `recommendDepartment` when Gemini asks for
// a triage. Each entry: keywords (Vietnamese, lowercased, no diacritics-
// insensitive matching done with .normalize), the recommended department,
// and the most-likely disease name to mention.
type TriageRule = {
  keywords: string[];
  department: string;
  likelyDiseases: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
};

const TRIAGE_RULES: TriageRule[] = [
  {
    keywords: ['dau bung', 'thuong vi', 'o chua', 'day hoi', 'buon non', 'tieu chay', 'tao bon', 'tieu hoa', 'kho tieu'],
    department: 'Tiêu hóa',
    likelyDiseases: ['Viêm dạ dày cấp', 'Trào ngược dạ dày thực quản'],
    urgency: 'MEDIUM',
  },
  {
    keywords: ['dau nguc', 'kho tho', 'tim dap nhanh', 'hoi hop', 'huyet ap', 'cao huyet ap', 'tim mach', 'phu chan'],
    department: 'Tim mạch',
    likelyDiseases: ['Tăng huyết áp', 'Suy tim mạn'],
    urgency: 'HIGH',
  },
  {
    // Use multi-letter substrings — single "ho" matches "khoa", "không"
    // and produces wrong triage. " ho " / "ho khan" are unambiguous.
    keywords: [' ho ', 'ho khan', 'ho co dom', 'kho khe', 'so mui', 'nghet mui', 'viem hong', 'sot cao', 'cum', 'hen suyen', 'kho tho'],
    department: 'Hô hấp',
    likelyDiseases: ['Viêm phổi cộng đồng', 'Hen phế quản'],
    urgency: 'MEDIUM',
  },
  {
    keywords: ['dau dau', 'chong mat', 'mat ngu', 'te tay', 'lien', 'co giat', 'than kinh', 'liet'],
    department: 'Thần kinh',
    likelyDiseases: ['Đau đầu căng cơ', 'Migraine'],
    urgency: 'MEDIUM',
  },
  {
    keywords: ['kinh nguyet', 'rong kinh', 'phu khoa', 'thai', 'mang thai', 'tre kinh'],
    department: 'Sản phụ khoa',
    likelyDiseases: ['Rối loạn kinh nguyệt'],
    urgency: 'MEDIUM',
  },
  {
    // 'da' alone is too short (matches "dang", "dau"); use compound terms.
    keywords: ['viem da', 'mun ', 'ngua da', 'noi me day', 'di ung', 'hong ban', 'eczema', 'noi man'],
    department: 'Da liễu',
    likelyDiseases: ['Viêm da dị ứng', 'Mề đay'],
    urgency: 'LOW',
  },
  {
    keywords: ['duong huyet', 'tieu duong', 'sut can', 'khat nuoc', 'tieu nhieu', 'noi tiet'],
    department: 'Nội tiết',
    likelyDiseases: ['Đái tháo đường type 2'],
    urgency: 'MEDIUM',
  },
  {
    keywords: ['rang', 'loi', 'sau rang', 'mat rang', 'nha khoa'],
    department: 'Răng - Hàm - Mặt',
    likelyDiseases: ['Viêm lợi', 'Sâu răng'],
    urgency: 'LOW',
  },
];

// Vietnamese-aware loose matching: strip diacritics, lowercase, then check
// for any keyword substring. Good enough for symptom-keyword triage.
//
// We use an explicit ̀-ͯ unicode range (the Combining Diacritical
// Marks block) because the original literal `̀-ͯ` could be mangled by file
// encodings; the escape is portable and unambiguous.
function normalize(s: string): string {
  // Strip every Unicode Mark (combining diacritics). \p{M} requires the
  // `u` flag; this is the canonical way to remove Vietnamese tone marks
  // after NFD-decomposing the string. Avoids fragile char-class literals.
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();
}

function ruleBasedTriage(symptoms: string): {
  department: string;
  likelyDiseases: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  matched: string[];
} {
  const norm = normalize(symptoms);
  let bestRule: TriageRule | null = null;
  let bestHits: string[] = [];

  for (const rule of TRIAGE_RULES) {
    const hits = rule.keywords.filter((k) => norm.includes(k));
    if (hits.length > bestHits.length) {
      bestRule = rule;
      bestHits = hits;
    }
  }

  if (!bestRule) {
    return {
      department: 'Nội khoa',
      likelyDiseases: [],
      urgency: 'LOW',
      matched: [],
    };
  }
  return {
    department: bestRule.department,
    likelyDiseases: bestRule.likelyDiseases,
    urgency: bestRule.urgency,
    matched: bestHits,
  };
}

// ─── Tool implementations (called by Gemini via function calling) ────────

type ToolContext = { userId: string };

async function tool_recommendDepartment(args: { symptoms: string }) {
  const result = ruleBasedTriage(args.symptoms || '');
  // Best-effort enrichment from the Disease library (so the bot can quote
  // the same description the library page shows).
  const details = await prisma.disease.findMany({
    where: { name: { in: result.likelyDiseases } },
    select: { name: true, summary: true, type: true },
  });
  return {
    recommendedDepartment: result.department,
    likelyDiseases: result.likelyDiseases.map((name) => ({
      name,
      type: details.find((d) => d.name === name)?.type ?? null,
      summary: details.find((d) => d.name === name)?.summary ?? null,
    })),
    urgency: result.urgency,
    matchedKeywords: result.matched,
    note:
      result.urgency === 'HIGH'
        ? 'Triệu chứng có dấu hiệu cấp — khuyến cáo bệnh nhân đến khám sớm trong 24 giờ.'
        : null,
  };
}

async function tool_searchLibrary(args: {
  query: string;
  category?: 'disease' | 'drug' | 'procedure' | 'labTest';
}) {
  const where = { name: { contains: args.query, mode: 'insensitive' as const } };
  const select = { id: true, name: true, type: true, summary: true } as const;

  switch (args.category) {
    case 'disease':
      return { disease: await prisma.disease.findMany({ where, select, take: 5 }) };
    case 'drug':
      return { drug: await prisma.drug.findMany({ where, select, take: 5 }) };
    case 'procedure':
      return { procedure: await prisma.procedure.findMany({ where, select, take: 5 }) };
    case 'labTest':
      return { labTest: await prisma.labTest.findMany({ where, select, take: 5 }) };
    default: {
      // Cross-table search
      const [disease, drug, procedure, labTest] = await Promise.all([
        prisma.disease.findMany({ where, select, take: 3 }),
        prisma.drug.findMany({ where, select, take: 3 }),
        prisma.procedure.findMany({ where, select, take: 3 }),
        prisma.labTest.findMany({ where, select, take: 3 }),
      ]);
      return { disease, drug, procedure, labTest };
    }
  }
}

async function tool_searchServices(args: { query?: string; category?: string }) {
  const where: any = { isActive: true };
  if (args.query) where.name = { contains: args.query, mode: 'insensitive' };
  if (args.category) where.category = { contains: args.category, mode: 'insensitive' };
  return prisma.hospitalService.findMany({
    where,
    select: { id: true, name: true, category: true, price: true, duration: true, description: true },
    take: 10,
    orderBy: { category: 'asc' },
  });
}

async function tool_getMyAppointments(args: { status?: string }, ctx: ToolContext) {
  const where: any = { userId: ctx.userId };
  if (args.status) where.status = args.status.toUpperCase();
  return prisma.appointment.findMany({
    where,
    select: {
      id: true,
      date: true,
      status: true,
      reason: true,
      department: true,
      doctor: { select: { user: { select: { firstName: true, lastName: true } }, specialization: true } },
    },
    orderBy: { date: 'desc' },
    take: 10,
  });
}

async function tool_getMyLabResults(args: { limit?: number }, ctx: ToolContext) {
  return prisma.labResult.findMany({
    where: { patient: { userId: ctx.userId } },
    select: {
      id: true,
      testName: true,
      resultValue: true,
      resultUnit: true,
      normalRange: true,
      status: true,
      testDate: true,
    },
    orderBy: { testDate: 'desc' },
    take: Math.min(args.limit ?? 10, 20),
  });
}

async function tool_getMyPrescriptions(args: { activeOnly?: boolean }, ctx: ToolContext) {
  return prisma.prescription.findMany({
    where: {
      patient: { userId: ctx.userId },
      ...(args.activeOnly === false ? {} : { isActive: true }),
    },
    select: {
      id: true,
      medicationName: true,
      dosage: true,
      frequency: true,
      duration: true,
      instructions: true,
      prescriptionDate: true,
      doctor: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { prescriptionDate: 'desc' },
    take: 10,
  });
}

async function tool_getMyPendingPayments(_args: Record<string, never>, ctx: ToolContext) {
  return prisma.payment.findMany({
    where: { userId: ctx.userId, status: { in: ['PENDING', 'PROCESSING'] } },
    select: {
      id: true,
      amount: true,
      description: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ─── Gemini tool declarations ────────────────────────────

const TOOLS: FunctionDeclaration[] = [
  {
    name: 'recommendDepartment',
    description:
      'Khi người dùng mô tả triệu chứng và muốn biết nên đi khoa nào / khám gì, hãy gọi hàm này. ' +
      'Trả về khoa khuyến nghị và các bệnh có khả năng kèm mức độ khẩn cấp.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        symptoms: {
          type: Type.STRING,
          description: 'Chuỗi mô tả triệu chứng bệnh nhân, tiếng Việt, càng chi tiết càng tốt.',
        },
      },
      required: ['symptoms'],
    },
  },
  {
    name: 'searchLibrary',
    description:
      'Tra cứu thư viện y khoa nội bộ: bệnh lý, thuốc, quy trình thủ thuật, xét nghiệm. ' +
      'Dùng khi người dùng hỏi "X là gì", "thuốc X uống thế nào", "xét nghiệm Y dùng làm gì".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Từ khóa tìm kiếm.' },
        category: {
          type: Type.STRING,
          enum: ['disease', 'drug', 'procedure', 'labTest'],
          description: 'Nếu biết rõ loại thì truyền vào; nếu không chắc, bỏ qua để tìm tất cả.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'searchServices',
    description:
      'Liệt kê các dịch vụ bệnh viện đang cung cấp (khám, xét nghiệm, chẩn đoán hình ảnh, ...) ' +
      'kèm giá tiền và thời lượng. Dùng khi hỏi "có dịch vụ X không", "giá khám là bao nhiêu".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Lọc theo tên dịch vụ (không bắt buộc).' },
        category: { type: Type.STRING, description: 'Lọc theo nhóm dịch vụ (không bắt buộc).' },
      },
    },
  },
  {
    name: 'getMyAppointments',
    description:
      'Lấy lịch khám của CHÍNH bệnh nhân đang trò chuyện. Dùng khi hỏi "lịch khám sắp tới của tôi", ' +
      '"hôm nào tôi đến viện", "tôi đặt lịch chưa".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
          description: 'Lọc theo trạng thái lịch (không bắt buộc).',
        },
      },
    },
  },
  {
    name: 'getMyLabResults',
    description:
      'Lấy kết quả xét nghiệm gần nhất của bệnh nhân đang trò chuyện. ' +
      'Dùng khi hỏi "kết quả xét nghiệm của tôi", "đường huyết của tôi bao nhiêu".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: { type: Type.NUMBER, description: 'Số lượng tối đa (mặc định 10, tối đa 20).' },
      },
    },
  },
  {
    name: 'getMyPrescriptions',
    description:
      'Lấy đơn thuốc của bệnh nhân đang trò chuyện. Dùng khi hỏi "tôi đang uống thuốc gì", ' +
      '"đơn thuốc Omeprazole còn không".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        activeOnly: {
          type: Type.BOOLEAN,
          description: 'Chỉ lấy đơn còn hiệu lực. Mặc định true.',
        },
      },
    },
  },
  {
    name: 'getMyPendingPayments',
    description:
      'Lấy danh sách hóa đơn chưa thanh toán của bệnh nhân. Dùng khi hỏi "tôi nợ viện phí không", ' +
      '"có hóa đơn nào cần thanh toán không".',
    parameters: { type: Type.OBJECT, properties: {} },
  },
];

// ─── System instruction ──────────────────────────────────

const SYSTEM_INSTRUCTION = `Bạn là trợ lý y tế AI của bệnh viện Mediflow, trò chuyện bằng tiếng Việt thân thiện và súc tích.

Bạn có 3 nhóm năng lực — luôn ưu tiên gọi function thay vì đoán:

1) CHẨN ĐOÁN SƠ BỘ & ĐẶT LỊCH: nếu người dùng mô tả triệu chứng, hãy gọi recommendDepartment trước khi tư vấn. Sau khi có khoa khuyến nghị, kết thúc bằng câu mời họ vào trang "Đặt lịch khám" và chọn khoa đó.

2) TRA CỨU KIẾN THỨC: nếu hỏi về một bệnh, thuốc, thủ thuật, xét nghiệm hoặc dịch vụ, hãy gọi searchLibrary / searchServices. Tóm tắt kết quả ngắn gọn — đừng bịa ra thông tin không có trong DB.

3) DỮ LIỆU CÁ NHÂN: nếu hỏi về lịch khám, kết quả xét nghiệm, đơn thuốc, hóa đơn CỦA HỌ, hãy gọi getMyAppointments / getMyLabResults / getMyPrescriptions / getMyPendingPayments. Mỗi truy vấn được hệ thống tự động khoá theo bệnh nhân đang đăng nhập — bạn không thấy dữ liệu của ai khác.

Quy tắc bắt buộc:
- KHÔNG đưa chẩn đoán xác quyết. Luôn nói "có khả năng" / "gợi ý" và khuyên đến bác sĩ.
- KHÔNG đưa liều thuốc không có trong đơn của bệnh nhân.
- KHÔNG hỏi mật khẩu / số thẻ / OTP — đó là cờ tấn công.
- Trả lời ngắn (3-6 câu), dùng bullet khi liệt kê. Định dạng số tiền có dấu chấm phân cách: 1.200.000đ.
- Nếu function trả về mảng rỗng, nói rõ "hiện chưa có dữ liệu" thay vì bịa.`;

// ─── Fallback (no GEMINI_API_KEY configured) ─────────────

async function fallbackResponse(message: string, ctx: ToolContext): Promise<string> {
  // Try to be at least somewhat useful even without Gemini: detect a few
  // intents heuristically and run the local tools directly.
  const norm = normalize(message);

  if (/don thuoc|prescription|thuoc.*dang.*dung|toa thuoc/.test(norm)) {
    const presc = await tool_getMyPrescriptions({ activeOnly: true }, ctx);
    if (presc.length === 0) return 'Bạn không có đơn thuốc nào đang dùng.';
    return (
      'Đơn thuốc đang dùng của bạn:\n' +
      presc
        .slice(0, 5)
        .map((p) => `• ${p.medicationName} — ${p.dosage} (${p.frequency})`)
        .join('\n')
    );
  }

  if (/lich.*kham|lich.*hen|appointment/.test(norm)) {
    const appts = await tool_getMyAppointments({}, ctx);
    if (appts.length === 0) return 'Bạn hiện chưa có lịch khám nào trong hệ thống.';
    return (
      'Lịch khám gần đây của bạn:\n' +
      appts
        .slice(0, 5)
        .map(
          (a) =>
            `• ${new Date(a.date).toLocaleDateString('vi-VN')} — ${a.department ?? 'Nội khoa'} — ${a.status}`,
        )
        .join('\n')
    );
  }

  if (/xet nghiem|lab|ket qua/.test(norm)) {
    const labs = await tool_getMyLabResults({}, ctx);
    if (labs.length === 0) return 'Bạn chưa có kết quả xét nghiệm nào.';
    return (
      'Kết quả xét nghiệm gần đây:\n' +
      labs
        .slice(0, 5)
        .map((l) => `• ${l.testName}: ${l.resultValue ?? '—'} ${l.resultUnit ?? ''} (${l.normalRange ?? 'n/a'})`)
        .join('\n')
    );
  }

  if (/hoa don|thanh toan|no vien/.test(norm)) {
    const pays = await tool_getMyPendingPayments({}, ctx);
    if (pays.length === 0) return 'Bạn không có hóa đơn nào đang chờ thanh toán.';
    return (
      'Hóa đơn đang chờ thanh toán:\n' +
      pays
        .map(
          (p) =>
            `• ${(p.amount ?? 0).toLocaleString('vi-VN')}đ — ${p.description ?? 'Dịch vụ y tế'} (${p.status})`,
        )
        .join('\n')
    );
  }

  // Symptom triage fallback
  const triage = ruleBasedTriage(message);
  if (triage.matched.length > 0) {
    return (
      `Triệu chứng bạn mô tả gợi ý khoa **${triage.department}**` +
      (triage.likelyDiseases.length > 0 ? `, có thể liên quan đến: ${triage.likelyDiseases.join(', ')}` : '') +
      '.\nVui lòng vào "Đặt lịch khám" và chọn khoa tương ứng. Nếu triệu chứng nặng hãy đến viện ngay.'
    );
  }

  return (
    `Cảm ơn bạn đã hỏi. Hiện trợ lý AI chưa được cấp khóa Gemini — quản trị viên cần điền ` +
    `GEMINI_API_KEY vào .env để bật chế độ thông minh đầy đủ. Trong lúc đó tôi có thể trả ` +
    `lời các câu hỏi đơn giản về triệu chứng, lịch khám, xét nghiệm và hóa đơn của bạn.`
  );
}

// ─── Main service ────────────────────────────────────────

export interface ChatTurnInput {
  userId: string;
  message: string;
}

export interface ChatTurnOutput {
  response: string;
  /** Tools the model invoked this turn — surfaced for debugging / UI hints. */
  toolsUsed: string[];
}

export class MedicalAIService {
  private client: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your-gemini-api-key') return null;
    if (!this.client) this.client = new GoogleGenAI({ apiKey });
    return this.client;
  }

  isConfigured(): boolean {
    return this.getClient() !== null;
  }

  private async dispatchTool(name: string, args: any, ctx: ToolContext): Promise<unknown> {
    switch (name) {
      case 'recommendDepartment':
        return tool_recommendDepartment(args);
      case 'searchLibrary':
        return tool_searchLibrary(args);
      case 'searchServices':
        return tool_searchServices(args);
      case 'getMyAppointments':
        return tool_getMyAppointments(args, ctx);
      case 'getMyLabResults':
        return tool_getMyLabResults(args, ctx);
      case 'getMyPrescriptions':
        return tool_getMyPrescriptions(args, ctx);
      case 'getMyPendingPayments':
        return tool_getMyPendingPayments(args, ctx);
      default:
        return { error: `Unknown tool: ${name}` };
    }
  }

  public async chat(input: ChatTurnInput): Promise<ChatTurnOutput> {
    const client = this.getClient();
    const ctx: ToolContext = { userId: input.userId };

    if (!client) {
      return {
        response: await fallbackResponse(input.message, ctx),
        toolsUsed: [],
      };
    }

    // Try the smart path with Gemini. If anything goes wrong (429 quota,
    // network blip, invalid key, model deprecated) drop to the rule-based
    // fallback rather than 500-ing — the user-facing chat must keep working.
    try {
      return await this.chatWithGemini(input.message, ctx, client);
    } catch (err) {
      const msg = (err as Error).message || '';
      const isQuota = /429|RESOURCE_EXHAUSTED|quota/i.test(msg);
      console.warn(
        `[ai] Gemini call failed (${isQuota ? 'quota' : 'other'}) — falling back. ${msg.slice(0, 200)}`,
      );
      const fallback = await fallbackResponse(input.message, ctx);
      const prefix = isQuota
        ? '⚠️ Hết hạn ngạch Gemini hôm nay — đang dùng chế độ cơ bản:\n\n'
        : '';
      return {
        response: prefix + fallback,
        toolsUsed: [],
      };
    }
  }

  private async chatWithGemini(
    message: string,
    ctx: ToolContext,
    client: GoogleGenAI,
  ): Promise<ChatTurnOutput> {
    // Stateless chat (one round-trip per user message). We keep the
    // conversation history client-side to avoid per-user server state.
    const contents: any[] = [{ role: 'user', parts: [{ text: message }] }];

    const toolsUsed: string[] = [];
    let safety = 0;

    // gemini-2.5-flash is the current cost/quality sweet spot with a healthy
    // free-tier quota and full function-calling support. Override via env if
    // you need to try lite or pro tier.
    const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    while (safety++ < 4) {
      const response = await client.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: TOOLS }],
        },
      });

      const calls = response.functionCalls ?? [];
      if (calls.length === 0) {
        return {
          response: response.text || 'Xin lỗi, tôi không thể trả lời lúc này.',
          toolsUsed,
        };
      }

      // Execute every function call the model emitted this turn.
      // Append the model's function-call message AND each response,
      // then loop so the model can compose its final answer.
      contents.push({
        role: 'model',
        parts: calls.map((c) => ({ functionCall: { name: c.name, args: c.args } })),
      });

      for (const call of calls) {
        toolsUsed.push(call.name || 'unknown');
        const result = await this.dispatchTool(call.name || '', call.args ?? {}, ctx).catch(
          (err) => ({ error: (err as Error).message }),
        );
        contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: call.name,
                response: { result },
              },
            },
          ],
        });
      }
    }

    return {
      response: 'Xin lỗi, tôi đang xử lý hơi lâu — bạn thử hỏi lại bằng câu ngắn hơn nhé?',
      toolsUsed,
    };
  }
}

export const medicalAIService = new MedicalAIService();
