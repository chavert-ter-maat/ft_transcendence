import {
  Column,
  Model,
  Table,
  PrimaryKey,
  AutoIncrement,
  DataType,
} from 'sequelize-typescript';

@Table
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  userId: number; // Primary key for the user model

  @Column(DataType.STRING)
  username: string;

  @Column(DataType.STRING)
  password: string;

  @Column(DataType.STRING)
  oauthToken: string; // OAuth Access Token

  @Column(DataType.STRING)
  oauthRefreshToken: string; // OAuth Refresh Token

  @Column(DataType.DATE)
  oauthExpiresAt: Date; // Expiration Date for OAuth Access Token

  @Column(DataType.STRING)
  provider: string; // OAuth Provider (e.g., '42')
}
