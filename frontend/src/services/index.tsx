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
    const { data } = await api2.get(`/period/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getEvents = async () => {
  try {
    const data = await api2.get(`/periods/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getAnnouncements = async () => {
  try {
    const data = await api2.get(`/announcement/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getCourseOutlines = async () => {
  try {
    const data = await api2.get(`/outline/`);
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
    const data = await api2.get(`/documents/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getDocumentOptions = async () => {
  try {
    const data = await api2.get(`/documents/categories/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getDocumentColours = async () => {
  try {
    const data = await api2.get(`/documents/themes/`);
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

export const getUserSubmissionData = async (student: number) => {
  try {
    const data = await api2.get(`/submissions/${student}/`);
    console.log(data);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const uploadSubmission = async ({
  studentId,
  file,
  submissionPhaseId,
}: {
  studentId: number;
  file: File;
  submissionPhaseId: number;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("submission_phase", submissionPhaseId.toString());

  return api2.post(`/submissions/upload/${studentId}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteSubmission = async (
  studentId: number,
  submissionId: number
) => {
  try {
    return await api2.delete(
      `/submissions/delete/${studentId}/${submissionId}/`
    );
  } catch (error: any) {
    console.error("Error deleting submission:", error);
    throw new Error(error.message);
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
