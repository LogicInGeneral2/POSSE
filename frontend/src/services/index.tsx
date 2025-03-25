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
