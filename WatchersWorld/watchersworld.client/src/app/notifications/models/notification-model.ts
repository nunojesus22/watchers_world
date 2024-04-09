export class NotificationModel {
  triggeredByUserId: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  eventType: string;

  constructor(
    triggeredByUserId: string,
    message: string,
    createdAt: Date,
    isRead: boolean,
    eventType: string
  ) {
    this.triggeredByUserId = triggeredByUserId;
    this.message = message;
    this.createdAt = createdAt;
    this.isRead = isRead;
    this.eventType = eventType;
  }
}
