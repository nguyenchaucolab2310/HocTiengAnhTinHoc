import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomeDashboard } from './components/HomeDashboard';
import { VocabularyView } from './components/VocabularyView';
import { FlashcardView } from './components/FlashcardView';
import { PracticeView } from './components/PracticeView';
import { ExamView } from './components/ExamView';
import { ResultsView } from './components/ResultsView';
import { FavoritesView } from './components/FavoritesView';
import { ClassroomManager } from './components/teacher/ClassroomManager';
import { AssignmentManager } from './components/teacher/AssignmentManager';
import { AnalyticsReport } from './components/teacher/AnalyticsReport';
import { VocabularyManager } from './components/teacher/VocabularyManager';
import { ExcelImportExport } from './components/teacher/ExcelImportExport';
import { AIAssistant } from './components/teacher/AIAssistant';
import { AdminSettings } from './components/system/AdminSettings';
import { UserGuide } from './components/system/UserGuide';
import { StorageService } from './services/storage';
import { 
  UserProfile, 
  GradeLevel, 
  TopicItem, 
  VocabularyItem, 
  Classroom, 
  Assignment, 
  NotificationItem, 
  StudentProgress 
} from './types';
import { Menu } from 'lucide-react';

export function App() {
  // Global Application State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => StorageService.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(12);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('les-12-3-1');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data Collections
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(() => StorageService.getVocabulary());
  const [topics, setTopics] = useState<TopicItem[]>(() => StorageService.getTopics());
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => StorageService.getClassrooms());
  const [assignments, setAssignments] = useState<Assignment[]>(() => StorageService.getAssignments());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageService.getNotifications());
  const [studentProgress, setStudentProgress] = useState<StudentProgress>(() => StorageService.getStudentProgress(currentUser.id));

  // Sync progress when user changes
  useEffect(() => {
    setStudentProgress(StorageService.getStudentProgress(currentUser.id));
  }, [currentUser]);

  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
    StorageService.saveCurrentUser(user);
    setStudentProgress(StorageService.getStudentProgress(user.id));
  };

  const handleToggleFavorite = (id: string) => {
    StorageService.toggleFavorite(id);
    setVocabulary(StorageService.getVocabulary());
  };

  const handleToggleLearned = (id: string) => {
    StorageService.toggleLearned(id);
    setVocabulary(StorageService.getVocabulary());
    const updatedProg = StorageService.getStudentProgress(currentUser.id);
    setStudentProgress(updatedProg);
  };

  const handleResetApp = () => {
    setVocabulary(StorageService.getVocabulary());
    setTopics(StorageService.getTopics());
    setClassrooms(StorageService.getClassrooms());
    setAssignments(StorageService.getAssignments());
    setNotifications(StorageService.getNotifications());
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
    setStudentProgress(StorageService.getStudentProgress(user.id));
  };

  return (
    <div className="min-h-screen bg-[#EAF5FF] flex flex-col selection:bg-[#0866D9] selection:text-white">
      
      {/* 1. Header (Sticky) */}
      <Header
        currentUser={currentUser}
        notifications={notifications}
        onSwitchUser={handleSwitchUser}
        onOpenNotifications={() => {}}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      {/* Mobile Top Navbar with Menu Toggle */}
      <div className="lg:hidden bg-[#061D49] border-b border-[#1388F5]/30 px-4 py-2 flex items-center justify-between text-white">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 flex items-center gap-2 text-xs font-bold"
        >
          <Menu className="w-4 h-4 text-[#16D8FF]" />
          <span>Menu danh mục</span>
        </button>
        <div className="text-xs font-bold text-[#16D8FF]">
          {currentUser.role === 'teacher' ? 'GV Nguyễn Thị Châu' : `Học sinh: ${currentUser.name}`}
        </div>
      </div>

      {/* 2. Main Body: Sidebar + Dynamic Content Canvas */}
      <div className="flex-1 max-w-[1920px] w-full mx-auto flex">
        
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          currentUser={currentUser}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Right Main Content Viewport */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {currentTab === 'home' && (
            <HomeDashboard
              topics={topics}
              vocabulary={vocabulary}
              progress={studentProgress}
              notifications={notifications}
              selectedGrade={selectedGrade}
              selectedLessonId={selectedLessonId}
              onChangeGrade={setSelectedGrade}
              onChangeLesson={setSelectedLessonId}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'vocabulary' && (
            <VocabularyView
              vocabulary={vocabulary}
              topics={topics}
              selectedGrade={selectedGrade}
              selectedLessonId={selectedLessonId}
              onChangeGrade={setSelectedGrade}
              onChangeLesson={setSelectedLessonId}
              onToggleFavorite={handleToggleFavorite}
              onToggleLearned={handleToggleLearned}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'flashcard' && (
            <FlashcardView
              vocabulary={vocabulary}
              topics={topics}
              selectedGrade={selectedGrade}
              selectedLessonId={selectedLessonId}
              onChangeGrade={setSelectedGrade}
              onChangeLesson={setSelectedLessonId}
              onToggleLearned={handleToggleLearned}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'practice' && (
            <PracticeView
              vocabulary={vocabulary}
              topics={topics}
              selectedGrade={selectedGrade}
              selectedLessonId={selectedLessonId}
              onChangeGrade={setSelectedGrade}
              onChangeLesson={setSelectedLessonId}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'exam' && (
            <ExamView
              vocabulary={vocabulary}
              topics={topics}
              currentUser={currentUser}
              selectedGrade={selectedGrade}
              selectedLessonId={selectedLessonId}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'results' && (
            <ResultsView
              currentUser={currentUser}
              progress={studentProgress}
              vocabulary={vocabulary}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'favorites' && (
            <FavoritesView
              vocabulary={vocabulary}
              onToggleFavorite={handleToggleFavorite}
              onNavigateTab={setCurrentTab}
            />
          )}

          {/* Teacher Modules */}
          {currentTab === 'teacher-classes' && (
            <ClassroomManager
              classrooms={classrooms}
              onUpdateClassrooms={setClassrooms}
            />
          )}

          {currentTab === 'teacher-assignments' && (
            <AssignmentManager
              assignments={assignments}
              classrooms={classrooms}
              topics={topics}
              onUpdateAssignments={setAssignments}
            />
          )}

          {currentTab === 'teacher-analytics' && (
            <AnalyticsReport
              classrooms={classrooms}
              vocabulary={vocabulary}
            />
          )}

          {currentTab === 'teacher-vocab' && (
            <VocabularyManager
              vocabulary={vocabulary}
              topics={topics}
              onUpdateVocabulary={setVocabulary}
            />
          )}

          {currentTab === 'teacher-excel' && (
            <ExcelImportExport
              vocabulary={vocabulary}
              onUpdateVocabulary={setVocabulary}
            />
          )}

          {currentTab === 'teacher-ai' && (
            <AIAssistant
              vocabulary={vocabulary}
              topics={topics}
              onUpdateVocabulary={setVocabulary}
            />
          )}

          {/* System & Support Modules */}
          {currentTab === 'admin-settings' && (
            <AdminSettings
              currentUser={currentUser}
              onSwitchUser={handleSwitchUser}
              onResetApp={handleResetApp}
            />
          )}

          {currentTab === 'user-guide' && (
            <UserGuide />
          )}
        </main>

      </div>

      {/* Global Footer */}
      <footer className="bg-[#061D49] text-slate-400 py-3 px-6 text-center text-xs border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-white">IT ENGLISH LEARNING</strong> &bull; Trường PT DTNT THPT Bình Thuận
          </div>
          <div className="text-[11px] text-[#16D8FF]">
            Giáo viên phụ trách: <strong>Nguyễn Thị Châu</strong> &bull; GDPT 2018 Kết nối tri thức với cuộc sống
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
