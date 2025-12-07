export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export enum AccountStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string; // INT in SQL, but handled as string in frontend for compatibility
  username: string;
  password?: string; // stored plainly for demo/simple implementations
  fullName: string; // maps to full_name in SQL
  role: UserRole;
  status: AccountStatus;
  email: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
}

export interface Grade {
  id: string;
  studentId: string; // maps to student_id
  subjectId: string; // maps to subject_id
  score: number; // 0-100
  semester: string;
}

export interface StudentProfile extends User {
  studentIdNumber: string; // e.g., "2023-001"
  gradeLevel: string;
}

// For AI Analysis
export interface AnalysisResult {
  studentId: string;
  analysis: string;
  generatedAt: string;
}