import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Receipt,
  History,
  X,
  Loader2,
  ExternalLink,
  Zap,
  Banknote,
  Info,
  Sparkles,
} from 'lucide-react';

import { cn } from '../lib/utils';
import { dataService } from '../services/dataService';

// ─── Local types ────────────────────────────────────────────
interface ApiPayment {
  id: string;
  userId: string;
  appointmentId?: string | null;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  method?: string | null;
  description?: string | null;
  transactionId?: string | null;
  paymentDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_PILL: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Chờ thanh toán', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  PROCESSING: { label: 'Đang xử lý', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  COMPLETED: { label: 'Đã thanh toán', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  FAILED: { label: 'Thất bại', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const METHOD_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  CREDIT_CARD: 'Thẻ tín dụng',
  BANK_TRANSFER: 'Chuyển khoản',
  E_WALLET: 'Ví điện tử / PayOS',
};

const formatVnd = (n: number) => (n || 0).toLocaleString('vi-VN') + 'đ';
const formatDate = (s?: string | null) =>
  s ? new Date(s).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export default function Payment() {
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [payosEnabled, setPayosEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payosLoadingId, setPayosLoadingId] = useState<string | null>(null);
  const [returnStatus, setReturnStatus] = useState<'success' | 'cancel' | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const refreshPayments = useCallback(async () => {
    try {
      const all = (await dataService.getPayments()) as unknown as ApiPayment[];
      setPayments(all);
    } catch (e) {
      console.warn('Failed to load payments', e);
    }
  }, []);

  // Initial load: PayOS config + payments
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [{ enabled }] = await Promise.all([
          dataService.getPayOSConfig().catch(() => ({ enabled: false })),
          refreshPayments(),
        ]);
        setPayosEnabled(enabled);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshPayments]);

  // Handle return URL from PayOS (?status=success|cancel&pid=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const pid = params.get('pid');
    if (status !== 'success' && status !== 'cancel') return;

    setReturnStatus(status);
    window.history.replaceState({}, '', window.location.pathname);

    if (pid && status === 'success') {
      // Poll for webhook to land (it may be a few seconds behind the redirect).
      (async () => {
        for (let i = 0; i < 6; i++) {
          try {
            const r = await dataService.checkPayOSStatus(pid);
            if (r.localStatus === 'COMPLETED') break;
          } catch {
            /* swallow — keep polling */
          }
          await new Promise((r) => setTimeout(r, 1500));
        }
        await refreshPayments();
      })();
    }
  }, [refreshPayments]);

  const handlePayWithPayOS = async (paymentId: string) => {
    setPayosLoadingId(paymentId);
    try {
      const { checkoutUrl } = await dataService.createPayOSLink(paymentId);
      // Full-window redirect — PayOS will bounce back to /payment?status=...
      window.location.href = checkoutUrl;
    } catch (err: any) {
      alert(err?.message || 'Không tạo được liên kết PayOS. Vui lòng thử lại.');
      setPayosLoadingId(null);
    }
  };

  const pending = payments.filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING');
  const completed = payments.filter((p) => p.status === 'COMPLETED');
  const totalPending = pending.reduce((s, p) => s + (p.amount || 0), 0);
  const totalPaid = completed.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Thanh toán & Hóa đơn</h2>
          <p className="text-slate-500 text-sm">
            Quản lý các khoản phí y tế và lịch sử giao dịch một cách an toàn.
          </p>
        </div>
        <button
          onClick={() => setShowHistory((v) => !v)}
          className={cn(
            'px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all',
            showHistory
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
          )}
        >
          <History size={18} />
          {showHistory ? 'Quay lại hóa đơn chờ' : 'Lịch sử hóa đơn'}
        </button>
      </div>

      {/* ─── Summary cards ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Hóa đơn chờ"
          value={pending.length.toString()}
          sub={formatVnd(totalPending)}
          icon={<AlertCircle size={20} />}
          tone="amber"
        />
        <SummaryCard
          label="Đã thanh toán"
          value={completed.length.toString()}
          sub={formatVnd(totalPaid)}
          icon={<CheckCircle2 size={20} />}
          tone="emerald"
        />
        <SummaryCard
          label="Cổng thanh toán"
          value={payosEnabled ? 'PayOS' : 'Chưa cấu hình'}
          sub={payosEnabled ? 'Sẵn sàng quét QR / chuyển khoản' : 'Liên hệ admin để bật PayOS'}
          icon={<Sparkles size={20} />}
          tone={payosEnabled ? 'sky' : 'slate'}
        />
      </div>

      {/* ─── PayOS return banner ─────────────────────────── */}
      <AnimatePresence>
        {returnStatus === 'success' && (
          <ReturnBanner
            tone="success"
            title="Thanh toán thành công qua PayOS"
            body="Cảm ơn bạn! Hóa đơn đã được cập nhật trong lịch sử."
            onClose={() => setReturnStatus(null)}
          />
        )}
        {returnStatus === 'cancel' && (
          <ReturnBanner
            tone="warning"
            title="Thanh toán đã bị hủy"
            body="Không sao — bạn có thể thử lại bất cứ lúc nào."
            onClose={() => setReturnStatus(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── PayOS disabled notice ───────────────────────── */}
      {!payosEnabled && !loading && pending.length > 0 && (
        <div className="card-flat p-5 bg-amber-50/60 border-amber-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 grid place-items-center shrink-0">
            <Info size={20} />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-amber-900">PayOS chưa được kích hoạt</p>
            <p className="text-sm text-amber-800/90 leading-relaxed">
              Quản trị viên cần điền 3 khóa <code className="font-mono text-xs">PAYOS_CLIENT_ID</code>,{' '}
              <code className="font-mono text-xs">PAYOS_API_KEY</code>,{' '}
              <code className="font-mono text-xs">PAYOS_CHECKSUM_KEY</code> trong file <code className="font-mono text-xs">.env</code>
              {' '}rồi chạy <code className="font-mono text-xs">docker compose up -d backend</code> để bật cổng thanh toán online.
            </p>
          </div>
        </div>
      )}

      {/* ─── Main content ────────────────────────────────── */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400 text-sm">
          <Loader2 className="animate-spin mx-auto mb-3" size={28} />
          Đang tải hóa đơn...
        </div>
      ) : showHistory ? (
        <HistoryList payments={payments} />
      ) : pending.length === 0 ? (
        <EmptyPending />
      ) : (
        <PendingList
          payments={pending}
          payosEnabled={payosEnabled}
          payosLoadingId={payosLoadingId}
          onPay={handlePayWithPayOS}
        />
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  tone: 'amber' | 'emerald' | 'sky' | 'slate';
}) {
  const toneClasses = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
    slate: 'bg-slate-50 text-slate-500 border-slate-200',
  }[tone];

  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-xl grid place-items-center border', toneClasses)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
          {label}
        </p>
        <p className="text-xl font-extrabold text-slate-900 leading-tight">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>
      </div>
    </div>
  );
}

function ReturnBanner({
  tone,
  title,
  body,
  onClose,
}: {
  tone: 'success' | 'warning';
  title: string;
  body: string;
  onClose: () => void;
}) {
  const isSuccess = tone === 'success';
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={cn(
        'card-flat p-5 flex items-start gap-4',
        isSuccess ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200',
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-xl grid place-items-center shrink-0',
          isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600',
        )}
      >
        {isSuccess ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      </div>
      <div className="flex-1">
        <p className={cn('text-sm font-semibold', isSuccess ? 'text-emerald-900' : 'text-amber-900')}>{title}</p>
        <p className={cn('text-sm mt-0.5', isSuccess ? 'text-emerald-800/80' : 'text-amber-800/80')}>{body}</p>
      </div>
      <button onClick={onClose} className={isSuccess ? 'text-emerald-700' : 'text-amber-700'}>
        <X size={16} />
      </button>
    </motion.div>
  );
}

function PendingList({
  payments,
  payosEnabled,
  payosLoadingId,
  onPay,
}: {
  payments: ApiPayment[];
  payosEnabled: boolean;
  payosLoadingId: string | null;
  onPay: (id: string) => void;
}) {
  return (
    <section className="card p-6 sm:p-7">
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white grid place-items-center shadow-md shadow-sky-500/20">
            <Receipt size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Hóa đơn chờ thanh toán</h3>
            <p className="text-xs text-slate-500">
              {payosEnabled
                ? 'Quét QR hoặc chuyển khoản qua PayOS — xác nhận tự động trong vài giây.'
                : 'PayOS chưa bật — vui lòng đăng ký cấu hình để thanh toán online.'}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
          <AlertCircle size={12} /> {payments.length} hóa đơn
        </span>
      </div>

      <div className="space-y-3">
        {payments.map((p) => {
          const pill = STATUS_PILL[p.status];
          return (
            <div
              key={p.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/70 hover:border-primary/40 hover:bg-slate-50/50 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {p.description || 'Dịch vụ y tế Mediflow'}
                  </p>
                  <span
                    className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border', pill.className)}
                  >
                    {p.status === 'PROCESSING' ? (
                      <span className="inline-flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" />
                        {pill.label}
                      </span>
                    ) : (
                      pill.label
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono">#{p.id.slice(-8).toUpperCase()}</span>
                  <span>{formatDate(p.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-between sm:justify-end">
                <p className="text-xl font-extrabold text-slate-900 tabular-nums">
                  {formatVnd(p.amount)}
                </p>
                <button
                  onClick={() => onPay(p.id)}
                  disabled={!payosEnabled || payosLoadingId === p.id}
                  className={cn(
                    'btn-primary',
                    (!payosEnabled || payosLoadingId === p.id) && 'opacity-50 cursor-not-allowed',
                  )}
                  title={payosEnabled ? 'Thanh toán qua PayOS' : 'PayOS chưa được cấu hình'}
                >
                  {payosLoadingId === p.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      Thanh toán PayOS
                      <ExternalLink size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {payosEnabled && (
        <p className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5">
          <ShieldCheck size={12} /> Bạn sẽ được chuyển đến trang thanh toán chính thức của PayOS. Sau khi hoàn tất, bạn
          sẽ tự động quay lại đây.
        </p>
      )}
    </section>
  );
}

function HistoryList({ payments }: { payments: ApiPayment[] }) {
  if (payments.length === 0) {
    return (
      <div className="card p-12 text-center space-y-3">
        <div className="w-14 h-14 mx-auto bg-slate-100 text-slate-400 rounded-2xl grid place-items-center">
          <Receipt size={26} />
        </div>
        <p className="text-slate-600 font-semibold">Chưa có hóa đơn nào</p>
        <p className="text-xs text-slate-400">Các giao dịch của bạn sẽ xuất hiện ở đây.</p>
      </div>
    );
  }

  // Newest first
  const sorted = [...payments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <section className="card overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
          <History size={14} /> Lịch sử giao dịch
        </h3>
      </div>
      <div className="divide-y divide-slate-100">
        {sorted.map((p) => {
          const pill = STATUS_PILL[p.status];
          return (
            <div
              key={p.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl grid place-items-center shrink-0',
                    p.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-600'
                      : p.status === 'PENDING' || p.status === 'PROCESSING'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600',
                  )}
                >
                  {p.status === 'COMPLETED' ? <CheckCircle2 size={18} /> : <Banknote size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {p.description || 'Dịch vụ y tế Mediflow'}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                    <span className="font-mono">#{p.id.slice(-8).toUpperCase()}</span>
                    <span>•</span>
                    <span>{formatDate(p.paymentDate || p.createdAt)}</span>
                    {p.method && (
                      <>
                        <span>•</span>
                        <span>{METHOD_LABEL[p.method] || p.method}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <span
                  className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border', pill.className)}
                >
                  {pill.label}
                </span>
                <p className="text-lg font-extrabold text-slate-900 tabular-nums">{formatVnd(p.amount)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function EmptyPending() {
  return (
    <div className="card p-12 text-center space-y-3">
      <div className="w-16 h-16 mx-auto bg-emerald-50 text-emerald-600 rounded-2xl grid place-items-center">
        <CheckCircle2 size={28} />
      </div>
      <p className="text-slate-700 font-semibold text-lg">Bạn không có hóa đơn nào đang chờ</p>
      <p className="text-sm text-slate-500 max-w-md mx-auto">
        Tất cả các giao dịch đã được thanh toán. Khi có hóa đơn mới, nó sẽ xuất hiện ở đây kèm nút thanh toán PayOS.
      </p>
    </div>
  );
}
