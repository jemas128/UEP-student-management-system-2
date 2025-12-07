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
    // Only show full loading spinner on initial load, not background refreshes
    if (!allUsers.length) setIsLoading(true);
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
    // Optimistic Update
    setAllUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    
    const targetUser = allUsers.find(u => u.id === id);
    if (targetUser) {
      const updated = { ...targetUser, status };
      await storage.saveUser(updated);
      await refreshData(); // Sync with backend
    }
  };

  const handleEditUser = async (updatedUser: User) => {
    // Optimistic Update
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    
    await storage.saveUser(updatedUser);
    await refreshData();
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This will also remove their grades.')) {
      // 1. Optimistic Update (Instant Removal from UI)
      setAllUsers(prev => prev.filter(u => u.id !== id));
      
      try {
        // 2. Perform actual delete
        await storage.deleteUser(id);
        // 3. Sync to ensure data integrity
        await refreshData();
      } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete user. Please try again.");
        refreshData(); // Revert state if failed
      }
    }
  };

  const handleGradeChange = async (grade: Grade) => {
    // Optimistic Update for grades is tricky because of the structure, 
    // but we can update the list directly
    setGrades(prev => {
      const exists = prev.find(g => g.id === grade.id);
      if (exists) return prev.map(g => g.id === grade.id ? grade : g);
      return [...prev, grade];
    });

    await storage.saveGrade(grade);
    // Background refresh
    storage.getGrades().then(setGrades);
  };

  const handleSubjectSave = async (subject: Subject) => {
    setSubjects(prev => {
      const idx = prev.findIndex(s => s.id === subject.id);
      if (idx >= 0) {
        const newSubs = [...prev];
        newSubs[idx] = subject;
        return newSubs;
      }
      return [...prev, subject];
    });

    await storage.saveSubject(subject);
    await refreshData();
  };

  const handleSubjectDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject? All associated student grades will be lost.')) {
      // 1. Optimistic Update (Instant Removal)
      setSubjects(prev => prev.filter(s => s.id !== id));
      
      try {
        // 2. Actual Delete
        await storage.deleteSubject(id);
        // 3. Sync
        await refreshData();
      } catch (error) {
        console.error("Subject delete failed", error);
        refreshData();
      }
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