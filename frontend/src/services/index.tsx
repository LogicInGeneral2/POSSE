import { ACCESS_TOKEN, REFRESH_TOKEN } from "../api/constants";
import { Student, Supervisor, User } from "./types";
import api2 from "../api";
const api = "../data";

export const loginUser = async (
  username: string,
  password: string
): Promise<{ user: User | Student | Supervisor }> => {
  const res = await api2.post("/api/token/", { username, password });

  localStorage.setItem(ACCESS_TOKEN, res.data.access);
  localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

  const userRes = await api2.get("/api/users/me/");
  console.log(userRes.data);
  const userData = userRes.data as User | Student | Supervisor;

  return { user: userData };
};

export const logoutUser = async () => {
  const refreshToken = localStorage.getItem("refresh");

  if (!refreshToken) {
    console.error("No refresh token found");
    return;
  }

  try {
    await api2.post("/api/logout/", { refresh: refreshToken });
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem("refresh");
  } catch (error) {
    console.error("Logout failed", error);
  }
};

export const getPeriod = async () => {
  try {
    const response = await fetch(`${api}/period_modal.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getEvents = async () => {
  try {
    const response = await fetch(`${api}/period_all.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getAnnouncements = async () => {
  try {
    const response = await fetch(`${api}/announcement.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getCourseOutlines = async () => {
  try {
    const response = await fetch(`${api}/courseOutline_modal.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getSelectionStatus = async () => {
  try {
    const response = await fetch(`${api}/selection.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getSelectionLists = async () => {
  try {
    const response = await fetch(`${api}/supervisors.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const saveSupervisorChoices = async (payload: any) => {
  try {
    const response = await fetch(`${api}/save-supervisors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to save supervisor choices");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error saving choices:", error);
    throw new Error(error);
  }
};

export const getDocuments = async () => {
  try {
    const response = await fetch(`${api}/documents.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getFile = (fileUrl: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getDocumentOptions = async () => {
  try {
    const response = await fetch(`${api}/documents_options_modal.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getDocumentColours = async () => {
  try {
    const response = await fetch(`${api}/documents_colours_modal.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getSupervisees = async () => {
  try {
    const response = await fetch(`${api}/supervisees_submissions.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getEvaluatees = async () => {
  try {
    const response = await fetch(`${api}/supervisees_submissions.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getSuperviseesModal = async () => {
  try {
    const response = await fetch(`${api}/supervisees_modal.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getUserSubmissions = async () => {
  try {
    const response = await fetch(`${api}/submissions_user.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getLatestUserSubmission = async (student: string) => {
  try {
    const response = await fetch(`${api}/submissions_user_latest.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const uploadFeedback = async (payload: any) => {
  try {
    const response = await fetch(`${api}/upload-feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to upload feedback");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error uploading feedback:", error);
    throw new Error(error);
  }
};

export const getGrades = async (student: string) => {
  try {
    const response = await fetch(`${api}/supervises_grades.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getMarkingScheme = async () => {
  try {
    const response = await fetch(`${api}/grading_content.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const saveGrades = async (payload: any) => {
  try {
    await fetch("/api/save-grades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Failed to send grades:", error);
  }
};

export const getUserSubmissionData = async () => {
  try {
    const response = await fetch(`${api}/submissions_user_combined.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getStudentList = async (category: string) => {
  try {
    const response = await fetch(`${api}/supervisees_list.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getLogbookList = async (student: number) => {
  try {
    const response = await fetch(`${api}/logs.json`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};
