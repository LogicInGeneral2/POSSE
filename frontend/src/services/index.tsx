import { ACCESS_TOKEN, REFRESH_TOKEN } from "../api/constants";
import {
  Student,
  SubmissionTheme,
  Supervisor,
  User,
  SystemTheme,
} from "./types";
import { api, api_public } from "../api";

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

export const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN); // Using REFRESH_TOKEN constant
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await api_public.post("/api/token/refresh/", {
      refresh: refreshToken,
    });
    const { access } = response.data;
    localStorage.setItem(ACCESS_TOKEN, access); // Using ACCESS_TOKEN constant
    return true;
  } catch (error) {
    localStorage.removeItem(ACCESS_TOKEN); // Clear tokens on failure
    localStorage.removeItem(REFRESH_TOKEN);
    return false;
  }
};

export const resetPasswordRequest = async (email: string) => {
  try {
    const response = await api_public.post("/api/password-reset/request/", {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Password reset request failed:", error);
  }
};

export const resetPasswordConfirm = async (
  uid: string,
  token: string,
  password: string
) => {
  const response = await api_public.post("/api/password-reset/confirm/", {
    uid,
    token,
    password,
  });
  return response.data;
};

export { api, api_public };

export const logoutUser = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);
  if (refreshToken) {
    try {
      await api_public.post("/api/logout/", { refresh: refreshToken });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
};

export const getSystemTheme = async (): Promise<SystemTheme[]> => {
  try {
    const response = await api_public.get<SystemTheme[]>("/theme/");
    return response.data;
  } catch (error) {
    console.error("Error fetching theme details:", error);
    return [];
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

export const getLogsLists = async (id: number) => {
  try {
    const data = await api.get(`/logbooks/${id}/calendar/`);
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
    return response.data;
  } catch (error: any) {
    console.error("Error saving choices:", error);
    throw error;
  }
};

export const getSupervisorChoices = async (studentId: number) => {
  try {
    const response = await api.get(
      `/submissions/supervisors/choices/${studentId}/`
    );
    return response;
  } catch (error: any) {
    console.error("Error fetching choices:", error);
    throw error;
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

export const getDocumentModes = async () => {
  try {
    const data = await api.get(`/documents/modes/`);
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

export const getSubmissionStatusThemes = async (): Promise<
  SubmissionTheme[]
> => {
  try {
    const response = await api.get<SubmissionTheme[]>("submissions/themes/");
    return response.data;
  } catch (error) {
    console.error("Error fetching theme details:", error);
    return [];
  }
};

export const getUserSubmissions = async (student: number) => {
  try {
    const data = await api.get(`submissions/all/${student}/`);
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
  comment,
}: {
  studentId: number;
  file?: File;
  submissionId: number;
  comment: string;
}) => {
  const formData = new FormData();
  formData.append("file", file ?? "");
  formData.append("comment", comment);
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
  status,
}: {
  id?: number;
  date: string;
  activities: string;
  feedbacks: string;
  plan: string;
  studentId?: number | string;
  supervisorId?: number | string;
  status?: string;
}) => {
  const payload = {
    date,
    activities: activities || "",
    feedbacks: feedbacks || "",
    plan: plan || "",
    status: status || "",
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

export const updateLogbookStatus = async (
  logId: number,
  status: string,
  comment?: string
) => {
  try {
    const payload: { status: string; comment?: string } = { status };
    if (comment !== undefined) {
      payload.comment = comment;
    }
    const response = await api.patch(`/logbooks/${logId}/status/`, payload);
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

export const exportLogs = async (student: number) => {
  try {
    const response = await api.post(
      `/logbooks/export/${student}/`,
      {},
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "logs_export.pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting PDF:", error);
    throw new Error("Failed to export PDF. Please try again.");
  }
};
