export class FavoriteActor {
  Username: string;
  ActorChoiceId: number;
  Media: { MediaId: number; Type: string };
  MediaCast: { ActorId: number; ActorName: string }[];

  constructor(
    username: string,
    actorChoiceId: number,
    mediaId: number,
    type: string,
    mediaCast: { ActorId: number; ActorName: string }[]
  ) {
    this.Username = username;
    this.ActorChoiceId = actorChoiceId;
    this.Media = { MediaId: mediaId, Type: type };
    this.MediaCast = mediaCast.map(mc => ({
      ActorId: mc.ActorId,
      ActorName: mc.ActorName
    }));
  }
}
