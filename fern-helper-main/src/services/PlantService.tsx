import { requestWithBackendFallback } from "./apiClient";

export const addPlant = async (plantData: any) => {
  const formData = new FormData();
  Object.keys(plantData).forEach((key) => {
    if (key === "image" && plantData[key]) {
      formData.append(key, plantData[key]); // Append the file
    } else {
      formData.append(key, plantData[key]);
    }
  });

  try {
    const response = await requestWithBackendFallback({
      method: "POST",
      url: "/plants",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    console.error("Error adding plant:", error);
    throw error;
  }
};

export const fetchUserPlants = async (userId: string) => {
  try {
    const response = await requestWithBackendFallback({
      method: "GET",
      url: "/plants",
      params: { uid: userId },
    });
    return response;
  } catch (error) {
    console.error("Error fetching user plants:", error);
    throw error;
  }
};

export const fetchPlantById = async (id: string) => {
  try {
    const response = await requestWithBackendFallback({
      method: "GET",
      url: `/plants/${id}`,
    });
    return response;
  } catch (error) {
    console.error(`Error fetching plant with ID ${id}:`, error);
    throw error;
  }
};
