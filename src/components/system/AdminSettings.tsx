import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Database, 
  RotateCcw, 
  UserCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  CloudCheck
} from 'lucide-react';
import { UserProfile, Role } from '../../types';
import { INITIAL_USERS } from '../../data/mockData';
import { StorageService } from '../../services/storage';

interface AdminSettingsProps {
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  onResetApp: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  currentUser,
  onSwitchUser,
  onResetApp
}) => {
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    if (confirm('Thầy/Cô và Quản trị viên có chắc chắn muốn đặt lại toàn bộ dữ liệu mẫu (Demo Data)? Thao tác này sẽ làm mới danh sách từ vựng, lớp học và kết quả kiểm tra.')) {
      StorageService.resetToDefault();
      onResetApp();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#B6D9F9]/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#061D49] to-[#0866D9] text-white flex items-center justify-center shadow-md">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#073B86]">
              Quản Trị Hệ Thống & Phân Quyền
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Cấu hình phân quyền người dùng, bảo mật dữ liệu và kết nối cơ sở dữ liệu Cloud
            </p>
          </div>
        </div>
      </div>

      {/* Role Management Panel */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-extrabold text-base text-[#073B86] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0866D9]" />
            <span>Chuyển đổi người dùng kiểm thử (Demo Switcher)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_USERS.map(user => {
            const isCurrent = user.id === currentUser.id;
            return (
              <div
                key={user.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isCurrent 
                    ? 'border-[#0866D9] bg-[#EAF5FF] ring-2 ring-[#0866D9]/20 shadow-md' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${
                      user.role === 'teacher' ? 'bg-amber-100 text-amber-800' :
                      user.role === 'admin' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'teacher' ? 'Giáo viên' : user.role === 'admin' ? 'Quản trị' : 'Học sinh'}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-[#0866D9] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đang chọn
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-sm text-slate-900 mt-2">{user.name}</h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</div>
                  <div className="text-xs text-slate-600 mt-2">
                    {user.role === 'student' ? `Học sinh lớp ${user.className} - Đầy đủ quyền làm bài và xem kết quả cá nhân.` :
                     user.role === 'teacher' ? 'Giáo viên phụ trách - Quản lý lớp, từ vựng, giao bài và xem báo cáo.' :
                     'Quản trị viên - Cấu hình hệ thống, kiểm soát truy cập và sao lưu.'}
                  </div>
                </div>

                {!isCurrent ? (
                  <button
                    onClick={() => onSwitchUser(user)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#0866D9] hover:text-white text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Chuyển sang tài khoản này
                  </button>
                ) : (
                  <div className="w-full py-2 px-3 rounded-xl bg-[#0866D9] text-white text-xs font-bold text-center">
                    Tài khoản hiện tại
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Database & Cloud State */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-[#B6D9F9]/50 space-y-4">
        <h2 className="font-extrabold text-base text-[#073B86] flex items-center gap-2">
          <Database className="w-5 h-5 text-[#0866D9]" />
          <span>Tình trạng lưu trữ dữ liệu (Persistent Database)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <div className="font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cơ sở dữ liệu cục bộ (LocalStorage)</span>
            </div>
            <p className="text-emerald-700">
              Đang hoạt động hoàn hảo. Dữ liệu từ vựng, học sinh, lớp học và bài kiểm tra được lưu vĩnh viễn trên trình duyệt.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
            <div className="font-bold text-[#073B86] flex items-center gap-1.5">
              <Server className="w-4 h-4 text-[#0866D9]" />
              <span>Cơ chế bảo mật RBAC</span>
            </div>
            <p className="text-slate-600">
              Phân quyền chặt chẽ: Học sinh chỉ xem kết quả của chính mình; Giáo viên quản lý lớp được phân công.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
            <div className="font-bold text-purple-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Trường PT DTNT THPT Bình Thuận</span>
            </div>
            <p className="text-purple-700">
              Cấu hình chuẩn hóa bộ sách Kết nối tri thức với cuộc sống theo GDPT 2018.
            </p>
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="font-bold text-xs text-slate-800">Khôi phục dữ liệu mẫu ban đầu:</div>
            <div className="text-[11px] text-slate-500">Đặt lại ngân hàng từ vựng SGK và các lớp 10, 11, 12 về mặc định.</div>
          </div>

          <button
            onClick={handleResetData}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Đặt lại toàn bộ dữ liệu mẫu</span>
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold text-center">
            Đã khôi phục dữ liệu mẫu thành công!
          </div>
        )}
      </div>

    </div>
  );
};
