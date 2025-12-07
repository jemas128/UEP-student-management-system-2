import React from 'react';
import { User, Grade, Subject, UserRole, AccountStatus } from '../types';
import { Users, BookOpen, GraduationCap, AlertCircle, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  users: User[];
  grades: Grade[];
  subjects: Subject[];
  currentUser: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ users, grades, subjects, currentUser }) => {
  const students = users.filter(u => u.role === UserRole.STUDENT);
  const pendingStudents = students.filter(u => u.status === AccountStatus.PENDING);
  const approvedStudents = students.filter(u => u.status === AccountStatus.APPROVED);
  
  // Calculate average grade per subject
  const subjectPerformance = subjects.map(sub => {
    const subjectGrades = grades.filter(g => g.subjectId === sub.id);
    const avg = subjectGrades.length > 0 
      ? subjectGrades.reduce((a, b) => a + b.score, 0) / subjectGrades.length 
      : 0;
    return {
      name: sub.code,
      average: Math.round(avg * 10) / 10
    };
  });

  if (currentUser.role === UserRole.STUDENT) {
    const myGrades = grades.filter(g => g.studentId === currentUser.id);
    const myAverage = myGrades.length > 0
      ? myGrades.reduce((a, b) => a + b.score, 0) / myGrades.length
      : 0;

    return (
       <div className="space-y-6 animate-in fade-in duration-500">
        <h1 className="text-3xl font-bold text-maroon-900">Welcome, {currentUser.fullName}</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-maroon-100 flex items-center space-x-4">
             <div className="p-3 bg-maroon-100 rounded-lg">
               <GraduationCap className="h-8 w-8 text-maroon-800" />
             </div>
             <div>
               <p className="text-sm text-gray-500">My GPA (Avg)</p>
               <p className="text-2xl font-bold text-gray-900">{myAverage.toFixed(2)}</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-maroon-100 flex items-center space-x-4">
             <div className="p-3 bg-blue-100 rounded-lg">
               <BookOpen className="h-8 w-8 text-blue-800" />
             </div>
             <div>
               <p className="text-sm text-gray-500">Enrolled Subjects</p>
               <p className="text-2xl font-bold text-gray-900">{myGrades.length}</p>
             </div>
          </div>
        </div>

        {/* Detailed Grade Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-maroon-900 text-lg">Academic Record</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Subject Code</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Subject Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Units</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subjects.map(subject => {
                  const grade = myGrades.find(g => g.subjectId === subject.id);
                  const score = grade ? grade.score : null;
                  
                  // Only show subjects that have a grade entered or are part of the curriculum
                  // For this view, we'll list all subjects to show what's missing too
                  return (
                    <tr key={subject.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">{subject.code}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{subject.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{subject.credits}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {score !== null ? score : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        {score !== null ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            score >= 75 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {score >= 75 ? 'PASSED' : 'FAILED'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            NO GRADE
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Admin View
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-maroon-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of school performance and activities.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-maroon-600 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{students.length}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-full">
            <Users className="h-6 w-6 text-maroon-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
            <p className="text-2xl font-bold text-gray-900">{pendingStudents.length}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-full">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Students</p>
            <p className="text-2xl font-bold text-gray-900">{approvedStudents.length}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-full">
            <UserCheck className="h-6 w-6 text-green-600" />
          </div>
        </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Subjects</p>
            <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Average Performance by Subject</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#fdf2f2' }}
              />
              <Bar dataKey="average" fill="#9b1c1c" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};