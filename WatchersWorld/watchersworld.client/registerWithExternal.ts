export class RegisterWithExternal {
  userName: string;
  userId: string;
  accessToken: string;
  provider: string;
  email: string;

  constructor(userName: string, userId: string, accessToken: string, provider: string, email:string)
 {
    this.userName = userName;
    this.userId = userId;
    this.accessToken = accessToken;
    this.provider = provider;
    this.email = email;
  }
}
