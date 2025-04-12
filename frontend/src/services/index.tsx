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
    const data = await api2.get(`/period/selection/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getSelectionLists = async () => {
  try {
    const data = await api2.get(`users/supervisors/lists/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getSupervisor = async () => {
  try {
    const data = await api2.get(`api/users/supervisor/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const saveSupervisorChoices = async (formData: FormData) => {
  try {
    const response = await api2.post(
      `/submissions/supervisors/choices/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status !== 200 && response.status !== 201) {
      throw new Error("Failed to save supervisor choices");
    }
  } catch (error: any) {
    console.error("Error saving choices:", error);
    throw new Error(error);
  }
};

export const getSupervisorChoices = async (student: number) => {
  try {
    const data = await api2.get(`/submissions/supervisors/choices/${student}/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
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
    const data = await api2.get(`api/users/supervisees/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getEvaluatees = async () => {
  try {
    const data = await api2.get(`api/users/evaluatees/`);
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

export const getUserSubmissions = async (student: number) => {
  try {
    const data = await api2.get(`submissions/${student}/all/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getLatestUserSubmission = async (student: number) => {
  try {
    const data = await api2.get(`submissions/${student}/latest/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const uploadFeedback = async ({
  studentId,
  file,
  submissionId,
}: {
  studentId: number;
  file: File;
  submissionId: number;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("submission", submissionId.toString());

  return api2.post(`feedback/upload/${studentId}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteFeedback = async (feedbackId: number) => {
  try {
    const data = await api2.delete(`feedback/delete/${feedbackId}/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
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
