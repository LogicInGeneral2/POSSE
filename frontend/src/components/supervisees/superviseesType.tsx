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

export type { Action, Supervisee, SupervisorsTableProps };
