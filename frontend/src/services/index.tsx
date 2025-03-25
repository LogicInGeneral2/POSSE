import api from "../api";

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
