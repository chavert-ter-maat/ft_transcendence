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
  userId: number;

  @Column(DataType.STRING)
  username: string;

  @Column(DataType.STRING)
  password: string;

  @Column(DataType.STRING)
  oauthToken: string;

  @Column(DataType.STRING)
  oauthRefreshToken: string;

  @Column(DataType.DATE)
  oauthExpiresAt: Date;

  @Column(DataType.STRING)
  email: string;

  @Column(DataType.STRING)
  provider: string;
}
