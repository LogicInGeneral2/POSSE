import { JSX } from "react";

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
  supervisor_email?: string;
  mode?: string;
  topic?: string;
}

export interface Supervisor extends User {
  supervisor_id: number;
  supervisees_FYP1?: number;
  supervisees_FYP2?: number;
  evaluatees_FYP1?: number;
  evaluatees_FYP2?: number;
}

export interface BreadcrumbInfo {
  student_id: number;
  course: string;
  topic: string;
  mode: string;
}

export interface BreadcrumbData {
  id: string;
  name: string;
}

export interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export interface SystemTheme {
  id: number;
  main: string;
  label: string;
}

export interface periodTypes {
  title: String;
  description: String;
  directory: String;
  start_date: Date;
  end_date: Date;
  days_left: number;
}

export interface StatusIcon {
  icon: JSX.Element;
}

export interface StatusInfo {
  value: string;
  color: string;
  icon: JSX.Element;
  legend: JSX.Element;
}

export interface Action {
  label: string;
  icon: JSX.Element;
  type: "dialog" | "navigate";
  path?: string;
}

export interface SubmissionTheme {
  label: string;
  primary: string;
  secondary: string;
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
  proof?: File | string;
  id?: number;
  name: string;
  hasSavedProof?: boolean;
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
  mode: string;
  thumbnail_url: string;
}

export interface SubmissionType extends FileType {
  type: "submission";
  progress: string;
  status: string;
  submission: string;
  studentId: number;
  assignmentId: number;
  assignment_title?: string;
  feedback?: FeedbackType;
}

export interface FeedbackType extends FileType {
  type: "feedback";
  supervisorId: number;
  supervisorName?: string;
  submissionId: number;
  comment: string;
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

export interface BreadcrumbUser {
  id: number;
  name: string;
  submissionsLength: number;
  has_logbook: boolean;
}

export interface DataTableProps {
  data: SuperviseeSubmission[];
  category: string;
  onRefresh: () => void;
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
  feedback: FeedbackType[];
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
  comment: string;
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
  { label: "Submitted" },
  { label: "No Submission" },
];

export const modeOptions: Option[] = [
  { label: "development" },
  { label: "research" },
];

export const courseOptions: Option[] = [{ label: "FYP1" }, { label: "FYP2" }];

export interface phaseOptions {
  title: string;
}

/* TESTING FOR GRADES PAGE */
export interface MarkingScheme {
  id: number;
  label: string;
  marks: number;
  weightage: number;
  pic: string;
  contents: any;
  course: string;
}

export interface TotalMarks {
  id: number;
  student: string;
  course: string;
  total_mark: number;
  breakdown: Record<string, number>;
  grade_letter: string;
  grade_gpa: number;
  mode: string;
}
