import { NotificationModel } from "./notification-model";

export class MessageNotificationModel extends NotificationModel {
  targetUserId: string;
  triggeredByUserPhoto: string;

  constructor(
    triggeredByUserId: string,
    message: string,
    createdAt: Date,
    isRead: boolean,
    eventType: string,
    targetUserId: string,
    triggeredByUserPhoto: string
  ) {
    super(triggeredByUserId, message, createdAt, isRead, eventType);
    this.targetUserId = targetUserId;
    this.triggeredByUserPhoto = triggeredByUserPhoto;
  }
}
