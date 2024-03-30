import { NotificationModel } from "./notification-model";

export class AchievementNotificationModel extends NotificationModel {
  userMedalId: number;
  achievementPhoto: string;

  constructor(
    triggeredByUserId: string,
    message: string,
    createdAt: Date,
    isRead: boolean,
    eventType: string,
    userMedalId: number,
    achievementPhoto: string
  ) {
    super(triggeredByUserId, message, createdAt, isRead, eventType);
    this.achievementPhoto = achievementPhoto;
    this.userMedalId = userMedalId;
  }
}
