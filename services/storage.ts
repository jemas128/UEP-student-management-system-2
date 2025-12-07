import { User, UserRole, AccountStatus, Subject, Grade, AnalysisResult } from '../types';

/**
 * !!! IMPORTANT DEPLOYMENT INSTRUCTION !!!
 * 
 * Currently, this file uses "localStorage" to simulate a database.
 * I have updated it to use "Promises" (async/await) to simulate a real network connection.
 * 
 * To connect this to your Byet.host PHP Backend:
 * 1. Open README.md
 * 2. Go to "Phase 4: Connecting React to PHP"
 * 3. Copy the code from there.
 * 4. Replace ALL the code in this file with that code.
 */

// Initial Mock Data
const INITIAL_ADMIN: User = {
  id: 'admin-1',
  username: 'admin',
  password: 'admin',
  fullName: 'System Administrator',
  role: UserRole.ADMIN,
  status: AccountStatus.APPROVED,
  email: 'admin@uep.edu.ph'
};

const STORAGE_KEYS = {
  USERS: 'sms_users',
  SUBJECTS: 'sms_subjects',
  GRADES: 'sms_grades',
  ANALYSIS: 'sms_analysis'
};

class StorageService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([INITIAL_ADMIN]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
      const defaultSubjects: Subject[] = [
        { id: 'sub-1', name: 'Mathematics', code: 'MATH101', credits: 3 },
        { id: 'sub-2', name: 'Physics', code: 'PHYS101', credits: 4 },
        { id: 'sub-3', name: 'Introduction to Programming', code: 'CS101', credits: 3 },
        { id: 'sub-4', name: 'History', code: 'HIST101', credits: 2 },
      ];
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(defaultSubjects));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GRADES)) {
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify([]));
    }
  }

  // Helper to simulate network delay
  private async delay(ms = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getUsers(): Promise<User[]> {
    await this.delay();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  async saveUser(user: User): Promise<void> {
    await this.delay();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const idx = users.findIndex((u: User) => String(u.id) === String(user.id));
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  async deleteUser(userId: string): Promise<void> {
    await this.delay();
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    // Fix: Ensure we compare strings to avoid string vs number issues
    const filteredUsers = users.filter((u: User) => String(u.id) !== String(userId));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
    
    // Cleanup grades
    const grades = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || '[]');
    const filteredGrades = grades.filter((g: Grade) => String(g.studentId) !== String(userId));
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(filteredGrades));
  }

  async getSubjects(): Promise<Subject[]> {
    await this.delay();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBJECTS) || '[]');
  }

  async saveSubject(subject: Subject): Promise<void> {
    await this.delay();
    const subjects = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBJECTS) || '[]');
    const idx = subjects.findIndex((s: Subject) => String(s.id) === String(subject.id));
    if (idx >= 0) subjects[idx] = subject;
    else subjects.push(subject);
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }

  async deleteSubject(subjectId: string): Promise<void> {
    await this.delay();
    const subjects = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBJECTS) || '[]');
    // Fix: Ensure we compare strings to avoid string vs number issues
    const filteredSubjects = subjects.filter((s: Subject) => String(s.id) !== String(subjectId));
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(filteredSubjects));

    const grades = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || '[]');
    const filteredGrades = grades.filter((g: Grade) => String(g.subjectId) !== String(subjectId));
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(filteredGrades));
  }

  async getGrades(): Promise<Grade[]> {
    await this.delay();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || '[]');
  }

  async saveGrade(grade: Grade): Promise<void> {
    await this.delay();
    const grades = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRADES) || '[]');
    
    const idx = grades.findIndex((g: Grade) => 
      String(g.id) === String(grade.id) || 
      (String(g.studentId) === String(grade.studentId) && String(g.subjectId) === String(grade.subjectId))
    );

    if (idx >= 0) {
      grade.id = grades[idx].id; 
      grades[idx] = grade;
    } else {
      grades.push(grade);
    }
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
  }

  // AI Analysis storage
  async saveAnalysis(result: AnalysisResult): Promise<void> {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANALYSIS) || '[]');
    data.push(result);
    localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(data));
  }

  getAnalysis(studentId: string): AnalysisResult | undefined {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANALYSIS) || '[]');
    return data.filter((a: AnalysisResult) => String(a.studentId) === String(studentId)).pop();
  }
}

export const storage = new StorageService();