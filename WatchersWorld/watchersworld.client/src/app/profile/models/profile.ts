export class Profile {
  userName: string | undefined;
  birthDate: Date;
  description: string | null;
  gender: string | null;
  profilePhoto: string;
  coverPhoto: string;
  profileStatus: string;
  followers: number;
  following: number
  startBanDate: Date | undefined;
  endBanDate: Date | undefined;
  isBanned: boolean | undefined;

  constructor(
    birthDate: Date,
    description: string | null,
    gender: string | null,
    profilePhoto: string,
    coverPhoto: string,
    profileStatus: string,
    followers: number,
    following: number,
  ) {
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
