/**
 * Define a estrutura para uma mensagem dentro de um chat.
 */
export interface Message {
  /**
   * Identificador único da mensagem.
   */
  messageId: string | undefined;

  /**
   * Nome de utilizador do remetente da mensagem.
   */
  sendUsername: string;

  /**
   * Texto da mensagem enviada.
   */
  text: string;

  /**
   * Data e hora em que a mensagem foi enviada.
   */
  sentAt: Date | undefined;

  /**
   * Data e hora em que a mensagem foi lida pelo destinatário.
   */
  readAt: Date | undefined;
}

