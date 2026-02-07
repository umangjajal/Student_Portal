import Notification from "../models/Notification.js";

export const createNotification = async ({
  title,
  message,
  roleTarget
}) => {
  return await Notification.create({
    title,
    message,
    roleTarget
  });
};
