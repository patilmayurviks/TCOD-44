const axios = require("axios");

const API_URL =
  "http://4.224.186.213/evaluation-service/notifications";

const weights = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

async function getPriorityNotifications() {
  try {
    const response = await axios.get(API_URL);

    const notifications = response.data.notifications;

    const scoredNotifications = notifications.map((notification) => {

      const weight = weights[notification.Type] || 0;

      const age =
        Date.now() - new Date(notification.Timestamp).getTime();

      const priorityScore = weight * 1000000000 - age;

      return {
        ...notification,
        priorityScore,
      };
    });

    scoredNotifications.sort(
      (a, b) => b.priorityScore - a.priorityScore
    );

    const top10 = scoredNotifications.slice(0, 10);

    console.log("Top 10 Priority Notifications");

    console.table(top10);

  } catch (error) {
    console.log(error.message);
  }
}

getPriorityNotifications();