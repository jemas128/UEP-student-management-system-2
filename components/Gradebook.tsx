import React, { useState, useEffect } from 'react';
import { User, Grade, Subject, UserRole, AnalysisResult } from '../types';
import { analyzeStudentPerformance } from '../services/geminiService';
import { storage } from '../services/storage';
import { Plus, Sparkles, Trash2, Save, Loader2, Edit, X } from 'lucide-react';

interface GradebookProps {
  students: User[];
  subjects: Subject[];
  grades: Grade[];
  onGradeChange: (grade: Grade) => void;
  onSubjectSave: (subject: Subject) => void;
  onSubjectDelete: (id: string) => void;
  currentUser: User;
}

export const Gradebook: React.FC<GradebookProps> = ({ 
  students, 
  subjects, 
  grades, 
  onGradeChange,
  onSubjectSave,
  onSubjectDelete,
  currentUser
}) => {
  // Filter active students only - Moved to top level for initialization logic
  const activeStudents = students.filter(s => s.role === UserRole.STUDENT);

  // Initialize selectedStudentId with the first active student if available
  const [selectedStudentId, setSelectedStudentId] = useState<string>(activeStudents[0]?.id || '');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState({ id: '', name: '', code: '', credits: 3 });
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  
  // Ensure selectedStudentId is always valid when the student list changes
  useEffect(() => {
    // If the currently selected ID is not in the active students list (or is empty), default to the first student
    const isValidSelection = activeStudents.find(s => s.id === selectedStudentId);
    if (!isValidSelection && activeStudents.length > 0) {
      setSelectedStudentId(activeStudents[0].id);
    }
  }, [activeStudents, selectedStudentId]);

  const handleScoreChange = (subjectId: string, scoreStr: string) => {
    // Prevent saving if no student is actually selected
    if (!selectedStudentId) return;

    const score = parseInt(scoreStr);
    
    // Check existing grade
    const existingGrade = grades.find(g => g.studentId === selectedStudentId && g.subjectId === subjectId);
    
    // If input is empty/NaN, we could theoretically delete the grade, but for now we default to 0
    const finalScore = isNaN(score) ? 0 : Math.min(100, Math.max(0, score));

    const gradePayload: Grade = {
      id: existingGrade ? existingGrade.id : `g-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      studentId: selectedStudentId,
      subjectId,
      score: finalScore,
      semester: 'Fall 2024'
    };
    onGradeChange(gradePayload);
  };

  const handleAIAnalysis = async () => {
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    setAnalyzing(true);
    setAnalysis(null);
    
    // Get student specific grades
    const studentGrades = grades.filter(g => g.studentId === selectedStudentId);
    
    const resultText = await analyzeStudentPerformance(student, studentGrades, subjects);
    
    setAnalysis(resultText);
    
    // Save async
    await storage.saveAnalysis({
      studentId: selectedStudentId,
      analysis: resultText,
      generatedAt: new Date().toISOString()
    });
    setAnalyzing(false);
  };

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubjectSave({
      id: isEditingSubject ? subjectForm.id : `sub-${Date.now()}`,
      name: subjectForm.name,
      code: subjectForm.code,
      credits: subjectForm.credits
    });
    resetSubjectForm();
  };

  const startEditSubject = (sub: Subject) => {
    setSubjectForm(sub);
    setIsEditingSubject(true);
  };

  const resetSubjectForm = () => {
    setSubjectForm({ id: '', name: '', code: '', credits: 3 });
    setIsEditingSubject(false);
  };

  if (activeStudents.length === 0) {
    return <div className="p-8 text-center text-gray-500">No active students to manage. Please approve students from the directory first.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-maroon-900">Gradebook Management</h1>
          <p className="text-gray-500">Input grades and manage subjects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tools */}
        <div className="space-y-6">
          {/* Student Selector & AI */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
            <select 
              value={selectedStudentId} 
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setAnalysis(null);
                const prevAnalysis = storage.getAnalysis(e.target.value);
                if(prevAnalysis) setAnalysis(prevAnalysis.analysis);
              }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-maroon-500 focus:ring-maroon-500 py-2 border px-3"
            >
              {activeStudents.map(s => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.username})</option>
              ))}
            </select>

             <div className="mt-6">
              <button 
                onClick={handleAIAnalysis}
                disabled={analyzing}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-maroon-800 to-maroon-600 text-white py-3 rounded-lg hover:from-maroon-900 hover:to-maroon-700 transition-all shadow-md disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="animate-spin h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                <span>{analyzing ? 'Analyzing with Gemini...' : 'Analyze Performance'}</span>
              </button>
             </div>
          </div>

          {analysis && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm animate-in slide-in-from-bottom-2">
              <div className="flex items-center space-x-2 mb-3 text-indigo-900">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold">AI Insight</h3>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed italic">
                "{analysis}"
              </p>
              <p className="text-xs text-indigo-400 mt-4 text-right">Powered by Gemini 2.5 Flash</p>
            </div>
          )}

          {/* Subject Management */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">{isEditingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
                {isEditingSubject && (
                  <button onClick={resetSubjectForm} className="text-xs text-gray-500 hover:text-maroon-600 flex items-center">
                    <X className="h-3 w-3 mr-1" /> Cancel
                  </button>
                )}
             </div>
             
             <form onSubmit={handleSubjectSubmit} className="space-y-4">
               <div>
                 <input 
                  placeholder="Subject Name (e.g. Biology)"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-maroon-500 outline-none"
                  value={subjectForm.name}
                  onChange={e => setSubjectForm({...subjectForm, name: e.target.value})}
                  required
                 />
               </div>
               <div className="flex space-x-2">
                  <input 
                    placeholder="Code"
                    className="w-1/2 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-maroon-500 outline-none"
                    value={subjectForm.code}
                    onChange={e => setSubjectForm({...subjectForm, code: e.target.value})}
                    required
                  />
                  <input 
                    type="number"
                    placeholder="Credits"
                    className="w-1/2 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-maroon-500 outline-none"
                    value={subjectForm.credits}
                    onChange={e => setSubjectForm({...subjectForm, credits: parseInt(e.target.value)})}
                    required
                  />
               </div>
               <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded text-sm hover:bg-gray-900 transition-colors flex justify-center items-center">
                 {isEditingSubject ? <><Save className="h-4 w-4 mr-2"/> Update Subject</> : <><Plus className="h-4 w-4 mr-2"/> Add Subject</>}
               </button>
             </form>

             {/* Existing Subjects List */}
             <div className="mt-6 border-t border-gray-100 pt-4">
               <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Existing Subjects</h4>
               <div className="space-y-2 max-h-60 overflow-y-auto">
                 {subjects.map(sub => (
                   <div key={sub.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded border border-gray-100 group">
                     <div>
                       <span className="font-bold text-gray-800">{sub.code}</span>
                       <span className="text-gray-500 text-xs ml-2">{sub.name}</span>
                     </div>
                     <div className="flex space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => startEditSubject(sub)} className="p-1 hover:bg-blue-100 text-blue-600 rounded">
                         <Edit className="h-3 w-3" />
                       </button>
                       <button onClick={() => onSubjectDelete(sub.id)} className="p-1 hover:bg-red-100 text-red-600 rounded">
                         <Trash2 className="h-3 w-3" />
                       </button>
                     </div>
                   </div>
                 ))}
                 {subjects.length === 0 && <p className="text-xs text-gray-400 italic">No subjects added.</p>}
               </div>
             </div>
           </div>
        </div>

        {/* Right Column: Grade Input Grid */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900">Transcript Editor</h3>
              <p className="text-sm text-gray-500">Updating grades for <span className="font-semibold text-maroon-800">{activeStudents.find(s => s.id === selectedStudentId)?.fullName}</span></p>
            </div>
            <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              ID: {selectedStudentId}
            </div>
          </div>
          <div className="p-0 flex-1 overflow-auto">
             <table className="w-full">
               <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
                 <tr>
                   <th className="px-6 py-3 text-left bg-gray-50">Code</th>
                   <th className="px-6 py-3 text-left bg-gray-50">Subject</th>
                   <th className="px-6 py-3 text-left bg-gray-50">Credits</th>
                   <th className="px-6 py-3 text-left bg-gray-50">Score (0-100)</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {subjects.map(subject => {
                   const grade = grades.find(g => g.studentId === selectedStudentId && g.subjectId === subject.id);
                   // Show empty string if no grade, otherwise number
                   const score = grade ? grade.score : '';
                   return (
                     <tr key={subject.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-6 py-4 font-mono text-sm text-gray-600">{subject.code}</td>
                       <td className="px-6 py-4 font-medium text-gray-900">{subject.name}</td>
                       <td className="px-6 py-4 text-sm text-gray-500">{subject.credits}</td>
                       <td className="px-6 py-4">
                         <input 
                          type="number" 
                          min="0" 
                          max="100"
                          value={score}
                          onChange={(e) => handleScoreChange(subject.id, e.target.value)}
                          className={`w-24 border rounded px-3 py-1.5 text-center focus:ring-2 focus:ring-maroon-500 focus:border-maroon-500 outline-none transition-shadow
                            ${score !== '' && Number(score) < 75 ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-300'}
                            ${score !== '' && Number(score) >= 90 ? 'border-green-300 bg-green-50 text-green-900' : ''}
                          `}
                          placeholder="-"
                         />
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
             {subjects.length === 0 && (
               <div className="p-12 text-center text-gray-400">
                 <p>No subjects defined.</p>
                 <p className="text-sm">Use the "Add New Subject" form on the left to build the curriculum.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};