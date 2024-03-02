export class Profile {
  userEmail!: string;
  userName: string;
  birthDate: Date;
  description: string | null;
  gender: string | null;
  profilePhoto: string;
  coverPhoto: string;
  profileStatus: string;
  followers: string[]; 
  following: string[]; 

  constructor(
    userName: string,
    birthDate: Date,
    description: string | null,
    gender: string | null,
    profilePhoto: string,
    coverPhoto: string,
    profileStatus: string,
    followers: string[] = [],
    following: string[] = []
  ) {
    this.userName = userName;
    this.birthDate = birthDate;
    this.description = description;
    this.gender = gender;
    this.profilePhoto = profilePhoto;
    this.coverPhoto = coverPhoto;
    this.profileStatus = profileStatus;
    this.followers = followers;
    this.following = following;
  }
}
