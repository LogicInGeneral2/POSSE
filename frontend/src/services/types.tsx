export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "supervisor" | "examiner" | "course_coordinator";
}

export interface Student extends User {
  student_id: number;
  supervisor?: string; // NUMBER
  course?: string;
}

export interface Supervisor extends User {
  supervisor_id: number;
  supervisees_FYP1?: string[]; // NUMBER
  supervisees_FYP2?: string[]; // NUMBER
}

export interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export interface periodTypes {
  title: String;
  description: String;
  directory: String;
  start_date: Date;
  end_date: Date;
  days_left: number;
}

export interface AnnouncementTypes {
  id: number;
  src: string;
  title: string;
  message: string;
}

export interface CourseOutlineTabs {
  label: string;
  items: string;
}

export interface SupervisorsSelectionType {
  inputValue?: string;
  name: string;
}
