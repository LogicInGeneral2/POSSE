interface SubmissionsType {
  id: number;
  title: string;
  date_open: string;
  date_close: string;
  days_left: number;
  status: string;
  description: string;
  feedback_file: string;
  submission_file: string;
}

export default SubmissionsType;
