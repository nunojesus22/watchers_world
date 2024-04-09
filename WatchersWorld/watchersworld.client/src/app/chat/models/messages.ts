export interface Message {
  messageId: string | undefined,
  sendUsername: string,
  text: string,
  sentAt: Date | undefined,
  readAt: Date | undefined
}

