import { ACCESS_TOKEN, REFRESH_TOKEN } from "../api/constants";
import { Student, Supervisor, User } from "./types";
import api from "../api";

export const loginUser = async (
  username: string,
  password: string
): Promise<{ user: User | Student | Supervisor }> => {
  const res = await api.post("/api/token/", { username, password });

  localStorage.setItem(ACCESS_TOKEN, res.data.access);
  localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

  const userRes = await api.get("/api/users/me/");
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
    await api.post("/api/logout/", { refresh: refreshToken });
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem("refresh");
  } catch (error) {
    console.error("Logout failed", error);
  }
};

export const getPeriod = async () => {
  try {
    const { data } = await api.get(`/period/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getEvents = async () => {
  try {
    const data = await api.get(`/periods/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getAnnouncements = async () => {
  try {
    const data = await api.get(`/announcement/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getCourseOutlines = async () => {
  try {
    const data = await api.get(`/outline/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getSelectionStatus = async () => {
  try {
    const data = await api.get(`/period/selection/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getSelectionLists = async () => {
  try {
    const data = await api.get(`users/supervisors/lists/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getSupervisor = async () => {
  try {
    const data = await api.get(`api/users/supervisor/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const saveSupervisorChoices = async (formData: FormData) => {
  try {
    const response = await api.post(
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
    const data = await api.get(`/submissions/supervisors/choices/${student}/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getDocuments = async () => {
  try {
    const data = await api.get(`/documents/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getDocumentOptions = async () => {
  try {
    const data = await api.get(`/documents/categories/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getDocumentColours = async () => {
  try {
    const data = await api.get(`/documents/themes/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getSupervisees = async () => {
  try {
    const data = await api.get(`api/users/supervisees/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getEvaluatees = async () => {
  try {
    const data = await api.get(`api/users/evaluatees/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getStudents = async (category: string) => {
  try {
    const data = await api.get(`api/users/students/${category}/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getUserSubmissions = async (student: number) => {
  try {
    const data = await api.get(`submissions/${student}/all/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getLatestUserSubmission = async (student: number) => {
  try {
    const data = await api.get(`submissions/${student}/latest/`);
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

  return api.post(`feedback/upload/${studentId}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteFeedback = async (feedbackId: number) => {
  try {
    const data = await api.delete(`feedback/delete/${feedbackId}/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getMarkingSchemeDoc = async (title: string) => {
  try {
    const data = await api.get(`documents/scheme/${title}/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const getGrades = async (student: number) => {
  try {
    const { data } = await api.get(`grades/student/${student}/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching grades:", error);
    throw new Error(error.message);
  }
};

export const getMarkingScheme = async (studentId: number) => {
  try {
    const { data } = await api.get(`grades/scheme/${studentId}/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching marking scheme:", error);
    throw new Error(error.message);
  }
};

export const saveGrades = async ({
  studentId,
  user_id,
  grades,
}: {
  studentId: number;
  user_id: number;
  grades: { scheme_id: number; grades: number[] }[];
}) => {
  try {
    const payload = {
      user_id,
      grades,
    };
    const { data } = await api.post(`grades/save/${studentId}/`, payload);
    return data;
  } catch (error: any) {
    console.error("Failed to save grades:", error);
    throw new Error(error.message);
  }
};

export const getUserSubmissionData = async (student: number) => {
  try {
    const data = await api.get(`/submissions/${student}/`);
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

  return api.post(`/submissions/upload/${studentId}/`, formData, {
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
    return await api.delete(
      `/submissions/delete/${studentId}/${submissionId}/`
    );
  } catch (error: any) {
    console.error("Error deleting submission:", error);
    throw new Error(error.message);
  }
};

export const getLogbookList = async (student: number) => {
  try {
    const data = await api.get(`/logbooks/student/${student}/`);
    return data;
  } catch (error: any) {
    console.error("Error fetching period:", error);
    throw new Error(error);
  }
};

export const saveLogbook = async ({
  id,
  date,
  activities,
  feedbacks,
  plan,
  studentId,
  supervisorId,
}: {
  id?: number;
  date: string;
  activities: string;
  feedbacks: string;
  plan: string;
  studentId?: number | string;
  supervisorId?: number | string;
}) => {
  const payload = {
    date,
    activities: activities || "",
    feedbacks: feedbacks || "",
    plan: plan || "",
    ...(studentId && { student: studentId }),
    ...(supervisorId && { supervisor: supervisorId }),
  };

  try {
    const response = id
      ? await api.put(`/logbooks/${id}/`, payload)
      : await api.post("/logbooks/", payload);
    return response;
  } catch (error: any) {
    throw error.response?.data || { detail: "Failed to save logbook." };
  }
};

export const updateLogbookStatus = async (logId: number, status: string) => {
  try {
    const response = await api.patch(`/logbooks/${logId}/status/`, { status });
    return response;
  } catch (error: any) {
    throw (
      error.response?.data || { detail: "Failed to update logbook status." }
    );
  }
};

export const deleteLogbook = async (logId: number) => {
  try {
    await api.delete(`/logbooks/${logId}/`);
  } catch (error: any) {
    throw error.response?.data || { detail: "Failed to delete logbook." };
  }
};
