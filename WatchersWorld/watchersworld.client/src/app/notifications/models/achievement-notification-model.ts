import { NotificationModel } from "./notification-model";

export class AchievementNotificationModel extends NotificationModel {
  achievementName: string;

  constructor(
    triggeredByUserId: string,
    message: string,
    createdAt: Date,
    isRead: boolean,
    eventType: string,
    achievementName: string
  ) {
    super(triggeredByUserId, message, createdAt, isRead, eventType);
    this.achievementName = achievementName;
  }
}
