export interface User {
  userId: number;
  username: string;
  email: string;
  oauthToken: string;
  oauthRefreshToken: string;
  provider: string;
  displayName: string;
  avatar?: string; // Add avatar field to the User model
  imageType: string;
  imageName?: string;
  imageData?: ArrayBuffer;
  imageString?: string;
  invited?:		boolean;
}
