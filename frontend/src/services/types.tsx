export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "supervisor" | "examiner" | "course_coordinator";
}

export interface Student extends User {
  student_id: number;
  supervisor?: string; // NUMBER
  evaluators?: string[]; // NUMBER
  course?: string;
}

export interface Supervisor extends User {
  supervisor_id: number;
  supervisees_FYP1?: string[]; // NUMBER
  supervisees_FYP2?: string[]; // NUMBER
  evaluatees_FYP1?: string[]; // NUMBER
  evaluatees_FYP2?: string[]; // NUMBER
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

export interface SubmissonsEntry extends periodTypes {}

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

interface FileType {
  id: number;
  title: string;
  upload_date: Date;
  src: string;
}

export interface DocumentType extends FileType {
  type: "document";
  category: string;
  thumbnail: string;
}

export interface SubmissionType extends FileType {
  type: "submission";
  progress: string;
  status: string;
  submission: string;
  studentId: number;
  assignmentId: number;
}

export interface FeedbackType extends FileType {
  type: "feedback";
  supervisorId: number;
  submissionId: number;
}

export interface OptionType {
  label: string;
}

export interface ColorType {
  value: string;
  primary: string;
  secondary: string;
}

export interface SuperviseeSubmission {
  student: Student;
  submissions: SubmissionType[];
}

export interface DataTableProps {
  data: SuperviseeSubmission[];
  category: string;
}

export interface GradingContentsType {
  label: string;
  marks: number;
  weightage: number;
  PIC: string;
  contents: string[];
}

export interface SubmissionsMetaType {
  id: number;
  title: string;
  date_open: string;
  date_close: string;
  days_left: number;
  status: string;
  description: string;
  submission: SubmissionType;
  feedback: FeedbackType;
}

export interface LogType {
  id: number;
  supervisor_id: number;
  student_id: number;
  date: string;
  activities: string;
  feedbacks: string;
  plan: string;
  status: string;
}
