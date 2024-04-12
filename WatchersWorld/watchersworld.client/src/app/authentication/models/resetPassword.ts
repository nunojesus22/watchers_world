/**
 * Interface para representar os dados necessários para realizar a operação de redefinição de senha.
 *
 * @interface ResetPassword
 */
export interface ResetPassword {
  token: string;
  email: string;
  newPassword: string;
}
