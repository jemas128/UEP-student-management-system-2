import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  LogOut, 
  Menu,
  X,
  UserCheck
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  onLogout,
  currentPage,
  onNavigate 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) return <>{children}</>;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.STUDENT] },
    { id: 'students', label: 'Student Directory', icon: Users, roles: [UserRole.ADMIN] },
    { id: 'approvals', label: 'Pending Approvals', icon: UserCheck, roles: [UserRole.ADMIN] },
    { id: 'grades', label: 'Gradebook', icon: BookOpen, roles: [UserRole.ADMIN] },
    { id: 'my-grades', label: 'My Grades', icon: FileText, roles: [UserRole.STUDENT] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-maroon-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-maroon-300" />
          <span className="font-bold text-lg tracking-wide">UEP SYSTEM</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-maroon-900 text-white transform transition-transform duration-300 ease-in-out shadow-xl
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:flex md:flex-col
      `}>
        <div className="p-6 border-b border-maroon-800 flex items-center space-x-3">
          <GraduationCap className="h-10 w-10 text-white" />
          <div>
            <h1 className="text-xl font-bold tracking-wider">UEP</h1>
            <h2 className="text-xs text-maroon-200 uppercase tracking-[0.2em]">System Portal</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6 bg-maroon-800 p-3 rounded-lg border border-maroon-700">
            <div className="h-10 w-10 rounded-full bg-maroon-500 flex items-center justify-center text-lg font-bold">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{currentUser.fullName}</p>
              <p className="text-xs text-maroon-300 capitalize">{currentUser.role.toLowerCase()}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200
                  ${currentPage === item.id 
                    ? 'bg-maroon-700 text-white shadow-inner border-l-4 border-white' 
                    : 'text-maroon-100 hover:bg-maroon-800 hover:text-white'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-maroon-800">
          <button
            onClick={onLogout}
            className="flex items-center space-x-3 text-maroon-200 hover:text-white transition-colors w-full px-4 py-2"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};