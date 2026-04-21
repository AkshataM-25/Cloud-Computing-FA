import { requestWithBackendFallback } from "./apiClient";

export const sendMessageToChatBot = async (message: string) => {
  try {
    const response = await requestWithBackendFallback<{ response: string }>({
      method: "POST",
      url: "/chat",
      data: { message },
    });
    return response.response;
  } catch (error) {
    console.error("Error sending message to chatbot:", error);
    throw error;
  }
};
