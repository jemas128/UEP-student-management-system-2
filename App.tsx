import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { User, Grade, Subject, UserRole, AccountStatus } from './types';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { StudentDirectory } from './components/StudentDirectory';
import { Gradebook } from './components/Gradebook';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  // App Data State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [u, s, g] = await Promise.all([
        storage.getUsers(),
        storage.getSubjects(),
        storage.getGrades()
      ]);
      setAllUsers(u);
      setSubjects(s);
      setGrades(g);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (u: User) => {
    setUser(u);
    setCurrentPage('dashboard');
    refreshData(); // Refresh to ensure latest data upon login
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  const handleUpdateStatus = async (id: string, status: AccountStatus) => {
    const targetUser = allUsers.find(u => u.id === id);
    if (targetUser) {
      const updated = { ...targetUser, status };
      await storage.saveUser(updated);
      await refreshData();
    }
  };

  const handleEditUser = async (updatedUser: User) => {
    await storage.saveUser(updatedUser);
    await refreshData();
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user? This will also remove their grades.')) {
      await storage.deleteUser(id);
      await refreshData();
    }
  };

  const handleGradeChange = async (grade: Grade) => {
    await storage.saveGrade(grade);
    await refreshData();
  };

  const handleSubjectSave = async (subject: Subject) => {
    await storage.saveSubject(subject);
    await refreshData();
  };

  const handleSubjectDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subject? All associated student grades will be lost.')) {
      await storage.deleteSubject(id);
      await refreshData();
    }
  };

  if (!user) {
    return (
      <Auth 
        onLogin={handleLogin} 
        onSignup={async (newUser) => {
          await storage.saveUser(newUser);
          await refreshData();
        }}
        users={allUsers}
      />
    );
  }

  if (isLoading && !allUsers.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-maroon-800 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading System Data...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard users={allUsers} grades={grades} subjects={subjects} currentUser={user} />;
      case 'students':
        return (
          <StudentDirectory 
            students={allUsers} 
            onUpdateStatus={handleUpdateStatus} 
            onEdit={handleEditUser}
            onDelete={handleDeleteUser} 
          />
        );
      case 'approvals':
        return (
          <StudentDirectory 
            students={allUsers} 
            onUpdateStatus={handleUpdateStatus} 
            onEdit={handleEditUser}
            onDelete={handleDeleteUser} 
            isApprovalsMode 
          />
        );
      case 'grades':
        return (
          <Gradebook 
            students={allUsers} 
            subjects={subjects} 
            grades={grades} 
            onGradeChange={handleGradeChange} 
            onSubjectSave={handleSubjectSave}
            onSubjectDelete={handleSubjectDelete}
            currentUser={user}
          />
        );
      case 'my-grades':
         return <Dashboard users={allUsers} grades={grades} subjects={subjects} currentUser={user} />;
      default:
        return <Dashboard users={allUsers} grades={grades} subjects={subjects} currentUser={user} />;
    }
  };

  return (
    <Layout 
      currentUser={user} 
      onLogout={handleLogout} 
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;