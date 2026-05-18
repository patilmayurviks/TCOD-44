import axios from "axios";

const API_URL =
  "http://4.224.186.213/evaluation-service/notifications";

export const getNotifications = async () => {

  const response = await axios.get(API_URL);

  return response.data.notifications;
};