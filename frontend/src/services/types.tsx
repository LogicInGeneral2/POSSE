export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "supervisor" | "examiner" | "course_coordinator";
}

export interface Student extends User {
  student_id: number;
  supervisor?: string;
  evaluators?: string[];
  course?: string;
}

export interface Supervisor extends User {
  supervisor_id: number;
  supervisees_FYP1?: string[];
  supervisees_FYP2?: string[];
  evaluatees_FYP1?: string[];
  evaluatees_FYP2?: string[];
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
  src: string;
}

export interface SupervisorsSelectionType {
  inputValue?: string;
  proof?: File;
  id?: number;
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
  thumbnail_url: string;
}

export interface SubmissionType extends FileType {
  type: "submission";
  progress: string;
  status: string;
  submission: string;
  studentId: number;
  assignmentId: number;
  feedback?: FeedbackType;
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

export interface SupervisorsList {
  id: number;
  name: string;
}

export interface SuperviseeSubmission {
  student: Student;
  submissions: SubmissionType[];
  has_logbook?: boolean;
}

export interface DataTableProps {
  data: SuperviseeSubmission[];
  category: string;
}

export interface GradingContentsType {
  id: number;
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

export interface SelectionContextType {
  selectionStatus: boolean | null;
  loading: boolean;
  refreshStatus: () => void;
}

export interface Option {
  label: string;
}

export const statusOptions: Option[] = [
  { label: "Reviewed" },
  { label: "Pending" },
  { label: "Submitted" },
  { label: "Behind" },
  { label: "Completed" },
  { label: "Evaluated" },
];

export const courseOptions: Option[] = [{ label: "FYP1" }, { label: "FYP2" }];
