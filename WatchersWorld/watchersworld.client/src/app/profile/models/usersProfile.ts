export class Profile {
  userEmail: string;
  userName: string;
  profilePhoto: string;

  constructor(
    userEmail: string,
    userName: string,
    profilePhoto: string,
  ) {
    this.userEmail = userEmail;
    this.userName = userName;
    this.profilePhoto = profilePhoto;
  }
}
