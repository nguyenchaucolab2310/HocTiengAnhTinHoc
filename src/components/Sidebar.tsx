import React from 'react';
import { 
  Home, 
  BookOpen, 
  Layers, 
  Gamepad2, 
  ClipboardCheck, 
  BarChart2, 
  Star, 
  Users, 
  FileCheck2, 
  BarChart, 
  BookMarked, 
  DownloadCloud, 
  Settings, 
  HelpCircle
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserProfile;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  isMobileOpen,
  onCloseMobile
}) => {
  const isTeacherOrAdmin = currentUser.role === 'teacher' || currentUser.role === 'admin';

  const navGroups = [
    {
      group: '',
      items: [
        { id: 'home', label: 'Trang chủ', icon: Home, isTeacherOnly: false }
      ]
    },
    {
      group: 'HỌC TẬP',
      items: [
        { id: 'vocabulary', label: 'Học từ vựng', icon: BookOpen, isTeacherOnly: false },
        { id: 'flashcard', label: 'Flashcard', icon: Layers, isTeacherOnly: false },
        { id: 'practice', label: 'Luyện tập', icon: Gamepad2, isTeacherOnly: false },
        { id: 'exam', label: 'Kiểm tra', icon: ClipboardCheck, isTeacherOnly: false },
        { id: 'results', label: 'Kết quả học tập', icon: BarChart2, isTeacherOnly: false },
        { id: 'favorites', label: 'Kho từ yêu thích', icon: Star, isTeacherOnly: false }
      ]
    },
    {
      group: 'DÀNH CHO GIÁO VIÊN',
      items: [
        { id: 'teacher-classes', label: 'Quản lý lớp học', icon: Users, isTeacherOnly: true },
        { id: 'teacher-assignments', label: 'Giao bài, kiểm tra', icon: FileCheck2, isTeacherOnly: true },
        { id: 'teacher-analytics', label: 'Thống kê – Báo cáo', icon: BarChart, isTeacherOnly: true },
        { id: 'teacher-vocab', label: 'Quản lý ngân hàng từ vựng', icon: BookMarked, isTeacherOnly: true },
        { id: 'teacher-excel', label: 'Nhập từ vựng (Excel)', icon: DownloadCloud, isTeacherOnly: true }
      ]
    },
    {
      group: 'HỆ THỐNG',
      items: [
        { id: 'admin-settings', label: 'Quản trị & phân quyền', icon: Settings, isTeacherOnly: false },
        { id: 'user-guide', label: 'Hướng dẫn sử dụng', icon: HelpCircle, isTeacherOnly: false }
      ]
    }
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-60 xl:w-64 bg-[#051B42] text-white z-50 flex flex-col border-r border-[#1388F5]/20 shadow-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="lg:hidden p-4 border-b border-white/10 flex items-center justify-between">
          <div className="font-extrabold text-white text-sm">MENU ĐIỀU HƯỚNG</div>
          <button 
            onClick={onCloseMobile} 
            className="text-white/70 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-3.5 custom-scrollbar">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {group.group && (
                <div className="flex items-center gap-2 px-2.5 pt-2 pb-1 text-[11px] font-extrabold tracking-wider text-white/90 uppercase">
                  <span>{group.group}</span>
                  <div className="h-[1px] bg-white/20 flex-1"></div>
                </div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                const isTeacherItem = item.isTeacherOnly;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer text-left ${
                      isActive
                        ? 'bg-[#0866D9] text-white shadow-md shadow-[#0866D9]/40'
                        : 'text-slate-200 hover:bg-[#073B86]/60 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                    <span className="truncate">{item.label}</span>
                    {isTeacherItem && !isTeacherOrAdmin && (
                      <span className="ml-auto text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold">
                        GV
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-white/10 bg-[#061D49]/40 text-[10px] text-slate-400 text-center">
          <div className="text-[#16D8FF] font-bold">IT English Learning</div>
          <div className="text-slate-400 text-[9px]">PT DTNT THPT Bình Thuận</div>
        </div>
      </aside>
    </>
  );
};

