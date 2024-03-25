export class NotificationModel {
  triggeredByUserName: string;
  triggeredByUserPhoto: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  eventType: string;

  constructor(triggeredByUserName: string, triggeredByUserPhoto: string, message: string, createdAt: Date, isRead: boolean, eventType: string) {
    this.triggeredByUserName = triggeredByUserName;
    this.triggeredByUserPhoto = triggeredByUserPhoto;
    this.message = message;
    this.createdAt = createdAt;
    this.isRead = isRead;
    this.eventType = eventType;
  }
}
