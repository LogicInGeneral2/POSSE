import { JSX } from "react";

interface Action {
  label: string;
  icon: JSX.Element;
  type: "dialog" | "navigate";
  path?: string;
}

interface Supervisee {
  id: number;
  name: string;
  course: string;
  progress: string;
  status: string;
}

interface SupervisorsTableProps {
  data: Supervisee[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
interface UserType {
  id: number;
  name: string;
  course: string;
  progress: string;
  status: string;
}

export type {
  Action,
  Supervisee,
  SupervisorsTableProps,
  TabPanelProps,
  UserType,
};
