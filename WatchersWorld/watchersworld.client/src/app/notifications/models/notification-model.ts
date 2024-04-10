/**
 * Modelo base para representar notificações na aplicação.
 * Define a estrutura comum a todas as notificações, incluindo dados do usuário que disparou a notificação,
 * a mensagem da notificação, data de criação, status de leitura e tipo de evento.
 *
 * Propriedades:
 * - triggeredByUserId: Identificador do usuário que disparou a notificação.
 * - message: Mensagem da notificação.
 * - createdAt: Data e hora da criação da notificação.
 * - isRead: Estado da notificação, indicando se já foi lida.
 * - eventType: Tipo do evento que disparou a notificação.
 */
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
