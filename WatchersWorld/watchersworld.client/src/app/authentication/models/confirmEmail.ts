/**
 * Interface para representar os dados necessários para confirmar o endereço de email de um utilizador.
 *
 * @interface ConfirmEmail
 */
export interface ConfirmEmail {
  token: string;
  email: string;
}
