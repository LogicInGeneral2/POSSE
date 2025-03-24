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
