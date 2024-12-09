// /users/user.token.ts

import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { User } from './user.model';  // Assuming the User model is in the same directory

type UserTokenCreationAttributes = {
  token: string;
  expiresAt: Date;
};

@Table({
  tableName: 'user_tokens',
  timestamps: true,
})
export class UserToken extends Model<UserToken, UserTokenCreationAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  token: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresat: Date;

  // Foreign key linking to the User model
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userid: string;

  // Defining the relationship with the User model
  // This is an inverse of the @HasMany in the User model
  user: User;
}
