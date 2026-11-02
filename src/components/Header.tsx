import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  GraduationCap, 
  UserCheck, 
  Check, 
  Sparkles,
  X,
  User
} from 'lucide-react';
import { UserProfile, NotificationItem } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface HeaderProps {
  currentUser: UserProfile;
  notifications: NotificationItem[];
  onSwitchUser: (user: UserProfile) => void;
  onOpenNotifications: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  notifications,
  onSwitchUser,
  onNavigateTab
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="relative bg-gradient-to-r from-[#005ea6] via-[#0866D9] to-[#0447a8] text-white shadow-md border-b border-[#16D8FF]/30 z-30 select-none">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6 py-2 flex items-center justify-between gap-3">
        
        {/* LEFT: Logo & Brand + School Crest + School Info */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0">
          
          {/* Brand Logo: IT English Learning */}
          <div 
            onClick={() => onNavigateTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 p-1 ring-2 ring-white/30 group-hover:ring-[#16D8FF] transition-all flex items-center justify-center shadow-md">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#0866D9] to-[#061D49] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white drop-shadow" />
              </div>
            </div>
            <div className="leading-tight">
              <div className="font-black text-base sm:text-lg tracking-wider text-white font-sans flex items-center">
                <span>IT ENGLISH</span>
              </div>
              <div className="text-[11px] sm:text-xs font-extrabold text-white tracking-widest uppercase">
                LEARNING
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-9 w-[1.5px] bg-white/30 shrink-0" />

          {/* School Emblem Seal */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative w-11 h-11 shrink-0 rounded-full bg-white p-0.5 shadow-md border-2 border-white/80">
              {/* Circular Emblem SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#005ea6" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#F5B827" strokeWidth="1.5" strokeDasharray="3 2" />
                {/* Book & Torch / Mountain illustration */}
                <path d="M 28 62 Q 50 52 72 62 L 72 72 Q 50 62 28 72 Z" fill="#0866D9" />
                <path d="M 30 60 Q 50 50 70 60 L 50 68 Z" fill="#12B981" />
                <polygon points="50,22 54,34 66,34 56,42 60,54 50,46 40,54 44,42 34,34 46,34" fill="#F5B827" />
                <circle cx="50" cy="50" r="14" fill="none" stroke="#D97706" strokeWidth="1" />
                <text x="50" y="86" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#061D49">BÌNH THUẬN</text>
                <text x="50" y="16" fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="#073B86">TRƯỜNG PT DTNT THPT</text>
              </svg>
            </div>

            {/* School Title & Teacher Name */}
            <div className="flex flex-col">
              <div className="font-extrabold text-sm lg:text-base text-white tracking-wide uppercase drop-shadow-sm leading-tight">
                TRƯỜNG PT DTNT THPT BÌNH THUẬN
              </div>
              <div className="text-[11px] lg:text-xs text-[#EAF5FF] font-medium leading-tight">
                Học từ vựng tiếng Anh chuyên ngành Tin học THPT
              </div>
              {/* Teacher Pill */}
              <div className="mt-1 inline-flex items-center gap-1.5 self-start bg-[#061D49]/90 text-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-white/20 shadow-xs">
                <UserCheck className="w-3 h-3 text-[#16D8FF]" />
                <span>Giáo viên: <strong className="text-white font-bold">Nguyễn Thị Châu</strong></span>
              </div>
            </div>
          </div>

        </div>

        {/* CENTER-RIGHT: School Facade Illustration Banner (Matches reference photo) */}
        <div className="hidden xl:flex items-center justify-center shrink-0">
          <div className="relative w-72 h-14 rounded-xl overflow-hidden border border-white/30 shadow-md bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 flex flex-col justify-end">
            {/* Vietnamese Flag flying on top */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/70 px-1.5 py-0.5 rounded-full shadow-xs">
              <svg width="18" height="12" viewBox="0 0 30 20" className="rounded-xs shadow-xs shrink-0">
                <rect width="30" height="20" fill="#DA251D" />
                <polygon points="15,4 17.3,11.2 23.6,11.2 18.5,15.6 20.4,22.8 15,18.4 9.6,22.8 11.5,15.6 6.4,11.2 12.7,11.2" fill="#FFFF00" transform="scale(0.7) translate(6.5, -1)" />
              </svg>
            </div>

            {/* School Building Archway */}
            <div className="w-full bg-white/95 border-t border-amber-300 px-2 py-0.5 text-center shadow-xs">
              <div className="text-[9px] font-black tracking-wider text-rose-800 uppercase leading-none">
                TRƯỜNG PT DTNT THPT
              </div>
              <div className="text-[11px] font-black tracking-widest text-blue-900 uppercase leading-tight">
                BÌNH THUẬN
              </div>
            </div>

            {/* Decorative facade columns and trees */}
            <div className="w-full h-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 flex items-center justify-around px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>

        {/* RIGHT: Notifications & Student Profile Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Bell Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifModal(!showNotifModal)}
              title="Thông báo"
              className="relative w-10 h-10 rounded-full bg-[#061D49]/80 hover:bg-[#061D49] active:scale-95 transition-all text-white border-2 border-[#16D8FF]/70 shadow-md flex items-center justify-center cursor-pointer"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifModal && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-[#061D49] rounded-2xl shadow-2xl border border-[#B6D9F9] overflow-hidden z-50">
                <div className="p-3 bg-gradient-to-r from-[#073B86] to-[#0866D9] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Bell className="w-4 h-4 text-[#16D8FF]" />
                    <span>Thông báo ({notifications.length})</span>
                  </div>
                  <button 
                    onClick={() => setShowNotifModal(false)}
                    className="p-1 hover:bg-white/20 rounded-lg text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-3 text-xs transition-colors hover:bg-sky-50 ${!n.isRead ? 'bg-blue-50/70 font-medium' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-[#073B86]">{n.title}</span>
                        {n.badge && (
                          <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold">
                            {n.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 mt-1 line-clamp-2">{n.content}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.date}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-slate-50 text-center border-t border-slate-100">
                  <button 
                    onClick={() => {
                      setShowNotifModal(false);
                      onNavigateTab('home');
                    }}
                    className="text-xs text-[#0866D9] font-semibold hover:underline"
                  >
                    Đóng thông báo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill (Exactly matches the reference image: Avatar + "Học sinh" / "Lớp 12A1" + Chevron) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 bg-[#061D49]/70 hover:bg-[#061D49] active:scale-98 px-3 py-1.5 rounded-full border border-white/30 transition-all cursor-pointer text-left shadow-md"
            >
              {/* Circular Avatar */}
              <div className="w-8 h-8 rounded-full bg-white p-0.5 shadow-sm shrink-0 border border-[#16D8FF]/60 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0866D9] to-[#005ea6] flex items-center justify-center text-white">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Text: 2 lines */}
              <div className="leading-tight pr-1">
                <div className="text-[11px] text-white/90 font-medium">
                  {currentUser.role === 'teacher' ? 'Giáo viên' : currentUser.role === 'admin' ? 'Quản trị' : 'Học sinh'}
                </div>
                <div className="text-xs font-black text-white tracking-wide">
                  {currentUser.role === 'teacher' ? 'GV Nguyễn Thị Châu' : currentUser.role === 'admin' ? 'Admin HT' : (currentUser.className ? `Lớp ${currentUser.className}` : 'Lớp 12A1')}
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-white/80 shrink-0" />
            </button>

            {/* Quick Demo Switcher Dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-[#061D49] rounded-2xl shadow-2xl border border-[#B6D9F9] p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 text-xs">
                  <p className="font-bold text-slate-800">Chuyển đổi vai trò xem trước</p>
                  <p className="text-[11px] text-slate-500">Thử nghiệm giao diện Học sinh, Giáo viên & Quản trị</p>
                </div>
                
                <div className="py-1 space-y-1">
                  {INITIAL_USERS.map(user => {
                    const isCurrent = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          onSwitchUser(user);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                          isCurrent ? 'bg-[#EAF5FF] text-[#0866D9] font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                            user.role === 'teacher' ? 'bg-amber-100 text-amber-700' :
                            user.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role === 'teacher' ? 'GV' : user.role === 'admin' ? 'AD' : 'HS'}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-slate-800">{user.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {user.role === 'student' ? `Học sinh lớp ${user.className}` : user.role === 'teacher' ? 'Giáo viên phụ trách' : 'Quản trị hệ thống'}
                            </div>
                          </div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-[#0866D9]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <Sparkles className="w-3 h-3" /> Chế độ Demo
                  </span>
                  <button 
                    onClick={() => {
                      setShowRoleMenu(false);
                      onNavigateTab('admin-settings');
                    }}
                    className="text-[#0866D9] hover:underline cursor-pointer"
                  >
                    Cài đặt
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile School Banner Subtitle Strip */}
      <div className="md:hidden bg-[#061D49] px-3 py-1 text-center text-[10px] text-[#16D8FF] border-t border-white/10 flex items-center justify-center gap-2">
        <span className="font-bold text-white uppercase">TRƯỜNG PT DTNT THPT BÌNH THUẬN</span>
        <span>•</span>
        <span>GV: Nguyễn Thị Châu</span>
      </div>
    </header>
  );
};

