export class NotificationModel {
  id: string;
  triggeredByUserName: string;
  triggeredByUserPhoto: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  eventType: string;

  constructor(
    id: string,
    triggeredByUserName: string,
    triggeredByUserPhoto: string,
    message: string,
    createdAt: Date,
    isRead: boolean,
    eventType: string
  ) {
    this.id = id; 
    this.triggeredByUserName = triggeredByUserName;
    this.triggeredByUserPhoto = triggeredByUserPhoto;
    this.message = message;
    this.createdAt = createdAt;
    this.isRead = isRead;
    this.eventType = eventType;
  }
}
