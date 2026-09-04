const NOTIFICATIONS_KEY = "pennyplot-notifications";

export const NOTIFICATION_TYPES = {
  BUDGET: "budget",
  RECURRING: "recurring",
  SPENDING: "spending",
  SUMMARY: "summary",
  CONNECTION: "connection",
  SYSTEM: "system",
};

export function getNotifications() {
  try {
    const savedNotifications =
      localStorage.getItem(NOTIFICATIONS_KEY);

    if (!savedNotifications) return [];

    const parsedNotifications = JSON.parse(savedNotifications);

    return Array.isArray(parsedNotifications)
      ? parsedNotifications
      : [];
  } catch (error) {
    console.error(
      "Failed to load notifications:",
      error,
    );

    return [];
  }
}

export function saveNotifications(notifications) {
  try {
    localStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify(notifications),
    );

    return true;
  } catch (error) {
    console.error(
      "Failed to save notifications:",
      error,
    );

    return false;
  }
}

export function createNotification({
  type = NOTIFICATION_TYPES.SYSTEM,
  title,
  message,
}) {
  const notifications = getNotifications();

  const notification = {
    id: crypto.randomUUID(),
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const updatedNotifications = [
    notification,
    ...notifications,
  ];

  saveNotifications(updatedNotifications);

  return notification;
}

export function markNotificationAsRead(id) {
  const notifications = getNotifications();

  const updatedNotifications = notifications.map(
    (notification) =>
      notification.id === id
        ? { ...notification, read: true }
        : notification,
  );

  saveNotifications(updatedNotifications);

  return updatedNotifications;
}

export function markAllNotificationsAsRead() {
  const notifications = getNotifications();

  const updatedNotifications = notifications.map(
    (notification) => ({
      ...notification,
      read: true,
    }),
  );

  saveNotifications(updatedNotifications);

  return updatedNotifications;
}

export function deleteNotification(id) {
  const notifications = getNotifications();

  const updatedNotifications = notifications.filter(
    (notification) => notification.id !== id,
  );

  saveNotifications(updatedNotifications);

  return updatedNotifications;
}

export function clearNotifications() {
  saveNotifications([]);

  return [];
}

export function getUnreadNotificationCount() {
  return getNotifications().filter(
    (notification) => !notification.read,
  ).length;
}