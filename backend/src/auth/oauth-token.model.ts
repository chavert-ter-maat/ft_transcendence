// /auth/oauth-token.model.ts

import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../users/user.model';

@Table({
  tableName: 'oauth_tokens',
  timestamps: true,
})
export class OauthToken extends Model<OauthToken> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true, // Change to primaryKey: true
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'access_token', // Use snake_case for database column names
  })
  accessToken: string; // Use camelCase for TypeScript property

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'refresh_token',
  })
  refreshToken: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'expires_at',
  })
  expiresAt: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;
}