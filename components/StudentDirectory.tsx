import React, { useState } from 'react';
import { User, AccountStatus, UserRole } from '../types';
import { Check, X, Search, Trash2, Edit, ShieldCheck, Save } from 'lucide-react';

interface StudentDirectoryProps {
  students: User[];
  onUpdateStatus: (id: string, status: AccountStatus) => void;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  isApprovalsMode?: boolean;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({ 
  students, 
  onUpdateStatus, 
  onEdit,
  onDelete,
  isApprovalsMode = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  // Filter based on mode
  const displayedStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (isApprovalsMode) {
      return s.status === AccountStatus.PENDING && matchesSearch;
    }
    return s.status !== AccountStatus.PENDING && matchesSearch;
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      onEdit(editingStudent);
      setEditingStudent(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-maroon-900">
            {isApprovalsMode ? 'Pending Approvals' : 'Student Directory'}
          </h1>
          <p className="text-gray-500">
            {isApprovalsMode 
              ? 'Review and approve new student account requests.' 
              : 'Manage registered student accounts.'}
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-maroon-50 border-b border-maroon-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-maroon-800 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-maroon-800 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-semibold text-maroon-800 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-xs font-semibold text-maroon-800 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-maroon-800 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                displayedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-maroon-100 text-maroon-700 flex items-center justify-center font-bold text-xs mr-3">
                          {student.fullName.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{student.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded w-fit">{student.username}</td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${student.status === AccountStatus.APPROVED ? 'bg-green-100 text-green-800' : ''}
                        ${student.status === AccountStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${student.status === AccountStatus.REJECTED ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isApprovalsMode ? (
                        <div className="flex justify-end space-x-2">
                           <button 
                            onClick={() => onUpdateStatus(student.id, AccountStatus.APPROVED)}
                            className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => onUpdateStatus(student.id, AccountStatus.REJECTED)}
                            className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => setEditingStudent(student)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors group relative"
                            title="Edit Student"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap left-1/2 transform -translate-x-1/2">Edit</span>
                          </button>
                          <button 
                            onClick={() => onDelete(student.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors group relative"
                            title="Delete Student"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap left-1/2 transform -translate-x-1/2">Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-maroon-900 p-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold flex items-center">
                <Edit className="mr-2 h-5 w-5" /> Edit Student
              </h2>
              <button onClick={() => setEditingStudent(null)} className="text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({...editingStudent, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-maroon-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-maroon-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Username</label>
                <input 
                  type="text" 
                  value={editingStudent.username}
                  onChange={(e) => setEditingStudent({...editingStudent, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-maroon-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Password</label>
                <input 
                  type="text" 
                  value={editingStudent.password || ''}
                  onChange={(e) => setEditingStudent({...editingStudent, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-maroon-500 outline-none"
                  placeholder="Enter new password to reset"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 text-white bg-maroon-800 hover:bg-maroon-900 rounded transition-colors flex items-center justify-center"
                >
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};