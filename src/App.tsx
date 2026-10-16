import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StorageProvider } from './context/StorageContext';
import { LoginView } from './components/auth/LoginView';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveNavTab } from './components/layout/Sidebar';
import { StorageView } from './components/storage/StorageView';
import { SuratManagementView } from './components/surat/SuratManagementView';
import { AdminUserManagement } from './components/admin/AdminUserManagement';
import { AdminSecurityAuditView } from './components/admin/AdminSecurityAuditView';
import { IKUManagementView } from './components/iku/IKUManagementView';
import { TujuanSasaranManagementView } from './components/tujuan-sasaran/TujuanSasaranManagementView';
import { NextcloudModal } from './components/nextcloud/NextcloudModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { AntiInspectShield } from './components/security/AntiInspectShield';
import { SecurityService } from './services/securityService';

function MainApp() {
  const { currentUser, isBidang, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('private');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [nextcloudModalOpen, setNextcloudModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    SecurityService.setCurrentUser(currentUser);
  }, [currentUser]);

  // Enforce role navigation constraints:
  // "selain admin, user dan bidang bisa akses menu iku dan tujuan-sasaran"
  useEffect(() => {
    if (isBidang && activeTab !== 'bidang' && activeTab !== 'iku' && activeTab !== 'tujuan-sasaran') {
      setActiveTab('bidang');
    } else if ((activeTab === 'users' || activeTab === 'security') && !isAdmin) {
      setActiveTab('private');
    }
  }, [isBidang, isAdmin, activeTab]);

  if (!currentUser) {
    return <LoginView />;
  }

  const handleSelectTab = (tab: ActiveNavTab) => {
    // Role protection: user bidang can access 'bidang', 'iku', and 'tujuan-sasaran'
    if (isBidang && tab !== 'bidang' && tab !== 'iku' && tab !== 'tujuan-sasaran') {
      return;
    }
    if ((tab === 'users' || tab === 'security') && !isAdmin) {
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar with strict role-based items */}
      <Sidebar
        currentTab={activeTab}
        onSelectTab={handleSelectTab}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onOpenNextcloudModal={() => setNextcloudModalOpen(true)}
        onOpenProfileModal={() => setProfileModalOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onMobileMenuToggle={() => setMobileSidebarOpen((prev) => !prev)}
          activeView={activeTab}
          onOpenNextcloudModal={() => setNextcloudModalOpen(true)}
          onOpenProfileModal={() => setProfileModalOpen(true)}
        />

        {/* Viewport content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {activeTab === 'private' && <StorageView scope="private" />}
          {activeTab === 'public' && <StorageView scope="public" />}
          {activeTab === 'bidang' && <StorageView scope="bidang" />}
          {activeTab === 'surat' && <SuratManagementView initialTab="all" />}
          {activeTab === 'surat-keluar' && <SuratManagementView initialTab="keluar" />}
          {activeTab === 'iku' && <IKUManagementView />}
          {activeTab === 'tujuan-sasaran' && <TujuanSasaranManagementView />}
          {activeTab === 'users' && (
            <AdminUserManagement
              onSwitchToUserDrive={(userId) => {
                setActiveTab('private');
              }}
            />
          )}
          {activeTab === 'security' && <AdminSecurityAuditView />}
        </main>
      </div>

      {/* Nextcloud Real Storage & Database Modal */}
      <NextcloudModal
        isOpen={nextcloudModalOpen}
        onClose={() => setNextcloudModalOpen(false)}
      />

      {/* Profile & Password Setting Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StorageProvider>
        <AntiInspectShield />
        <MainApp />
      </StorageProvider>
    </AuthProvider>
  );
}
