export type Student = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  address: string | null;
  createdAt: string;
};

export type Course = {
  id: number;
  departmentId: number | null;
  code: string;
  name: string;
  description: string | null;
  credits: number;
  createdAt: string;
};

export type Enrollment = {
  id: number;
  studentId: number;
  courseId: number;
  enrolledAt: string;
  grade: string | null;
};