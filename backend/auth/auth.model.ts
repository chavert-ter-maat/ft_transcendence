// users/user-token.model.ts
import { Column, Model, Table, ForeignKey } from 'sequelize-typescript';
import { User } from '../users/user.model';

@Table({ tableName: 'UserTokens' })
export class UserToken extends Model<UserToken> {
  @ForeignKey(() => User)
  @Column
  userId!: number;

  @Column({ allowNull: false })
  accessToken!: string;

  @Column({ allowNull: true })
  refreshToken!: string;

  @Column({ allowNull: true })
  tokenType!: string;

  @Column({ allowNull: true })
  expiresAt!: Date;
}