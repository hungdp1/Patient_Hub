import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'vi' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  vi: {
    dashboard: 'Trợ lý AI',
    scheduling: 'Lịch khám',
    payment: 'Thanh toán',
    services: 'Dịch vụ',
    library: 'Thư viện',
    records: 'Hồ sơ',
    profile: 'Cá nhân',
    logout: 'Thoát hệ thống',
    search_placeholder: 'Tra cứu bệnh lý, thuốc, bác sĩ...',
    new_chat: 'Chat mới',
    recent: 'Gần đây',
    ai_assistant: 'Trợ lý Mediflow',
    ai_online: 'AI đang trực tuyến',
    ai_welcome: 'Xin chào, tôi là trợ lý Mediflow',
    ai_description: 'Tôi có thể giúp bạn giải thích kết quả xét nghiệm, chẩn đoán triệu chứng hoặc tìm lịch khám.',
    ai_warning: 'Mediflow AI có thể đưa ra câu trả lời không chính xác. Hãy kiểm tra với bác sĩ.',
    diagnosis: 'Chẩn đoán bệnh',
    input_placeholder: 'Nhập câu hỏi hoặc triệu chứng của bạn...',
    exam_blood: 'Giải thích KQ xét nghiệm máu',
    find_doctor: 'Tìm bác sĩ tiêu hóa',
    remind_meds: 'Nhắc lịch uống thuốc',
    directions: 'Chỉ đường tới P.201',
    history: 'Theo đợt khám',
    labs: 'Xét nghiệm',
    meds: 'Đơn thuốc',
    diagnoses: 'Chẩn đoán',
    optimized_schedule: 'Lịch trình khám tối ưu',
    ai_recommends: 'Gợi ý tối ưu từ AI',
    total: 'Tổng cộng',
    pay_now: 'Thanh toán ngay',
    patient_name: 'Nguyễn Văn A',
    profile_title: 'Hồ sơ bệnh nhân',
    profile_desc: 'Quản lý thông tin cá nhân và cài đặt bảo mật.',
    personal_info: 'Thông tin',
    security: 'Bảo mật',
    blood_type: 'Nhóm máu',
    gender: 'Giới tính',
    vitals: 'Chỉ số gần nhất',
    height: 'Chiều cao',
    weight: 'Cân nặng',
    bp: 'Huyết áp',
    contact_details: 'Chi tiết liên hệ',
    full_name: 'Họ và tên',
    dob: 'Ngày sinh',
    phone: 'Số điện thoại',
    email: 'Email',
    address: 'Địa chỉ',
    save_changes: 'Lưu thay đổi',
    save_success: 'Cập nhật thành công!',
    change_password: 'Đổi mật khẩu',
    password_desc: 'Đảm bảo tài khoản của bạn được bảo mật bằng mật khẩu mạnh.',
    current_password: 'Mật khẩu hiện tại',
    new_password: 'Mật khẩu mới',
    confirm_password: 'Xác nhận mật khẩu',
    update_password: 'Cập nhật mật khẩu',
    password_success: 'Mật khẩu đã được thay đổi!',
    sessions: 'Phiên đăng nhập',
    sessions_desc: 'Đăng xuất khỏi tất cả các thiết bị khác.',
    logout_all: 'Đăng xuất tất cả',
    services_title: 'Dịch vụ bệnh viện',
    services_desc: 'Danh mục các dịch vụ khám chữa bệnh và bảng giá tham khảo.',
    search_services: 'Tìm dịch vụ...',
    all_services: 'Tất cả',
    clinic_sv: 'Khám lâm sàng',
    lab_sv: 'Xét nghiệm',
    imaging_sv: 'Chẩn đoán hình ảnh',
  },
  ja: {
    dashboard: 'AIアシスタント',
    scheduling: '診療予約',
    payment: '支払い',
    services: 'サービス',
    library: 'ライブラリ',
    records: '医療記録',
    profile: 'プロフィール',
    logout: 'ログアウト',
    search_placeholder: '病気、薬、医師を検索...',
    new_chat: '新しいチャット',
    recent: '履歴',
    ai_assistant: 'Mediflowアシスタント',
    ai_online: 'AIオンライン',
    ai_welcome: 'こんにちは、Mediflowアシスタントです',
    ai_description: '検査結果の説明、症状の診断、または診療スケジュールの確認をお手伝いします。',
    ai_warning: 'Mediflow AIは不正確な回答を出す可能性があります。医師にご相談ください。',
    diagnosis: '病状診断',
    input_placeholder: '質問や症状を入力してください...',
    exam_blood: '血液検査結果の説明',
    find_doctor: '消化器科医を探す',
    remind_meds: '服薬リマインダー',
    directions: 'P.201への道順',
    history: '診察履歴',
    labs: '検査結果',
    meds: '処方薬',
    diagnoses: '診断',
    optimized_schedule: '最適化された診療スケジュール',
    ai_recommends: 'AIからの最適化提案',
    total: '合計',
    pay_now: '今すぐ支払う',
    patient_name: 'グエン・ヴァン・A',
    profile_title: '患者プロフィール',
    profile_desc: '個人情報とセキュリティ設定の管理。',
    personal_info: '情報',
    security: 'セキュリティ',
    blood_type: '血液型',
    gender: '性別',
    vitals: '最近のバイタル',
    height: '身長',
    weight: '体重',
    bp: '血圧',
    contact_details: '連絡先詳細',
    full_name: 'フルネーム',
    dob: '生年月日',
    phone: '電話番号',
    email: 'メール',
    address: '住所',
    save_changes: '変更を保存',
    save_success: '更新に成功しました！',
    change_password: 'パスワード変更',
    password_desc: '強力なパスワードでアカウントを保護してください。',
    current_password: '現在のパスワード',
    new_password: '新しいパスワード',
    confirm_password: 'パスワードの確認',
    update_password: 'パスワードを更新',
    password_success: 'パスワードが変更されました！',
    sessions: 'ログインセッション',
    sessions_desc: '他のすべてのデバイスからログアウトします。',
    logout_all: 'すべてログアウト',
    services_title: '病院サービス',
    services_desc: '医療サービスの一覧と参考価格表。',
    search_services: 'サービスを検索...',
    all_services: 'すべて',
    clinic_sv: '臨床検査',
    lab_sv: 'ラボ試験',
    imaging_sv: '画像診断',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('vi');

  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
