export class LoginWithExternal {
  
  accessToken: string;
  userId: string;
  provider: string;
  email: string;

  constructor(accessToken: string, userId: string, provider: string, email: string)//
 {
    
    
    this.accessToken = accessToken;
    this.userId = userId;
    this.provider = provider;
    this.email = email;
  }
}
