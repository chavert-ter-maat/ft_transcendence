// src/users/user.model.ts
import { Column, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'Users' })
export class User extends Model<User> {
  @Column({ unique: true, allowNull: false })
  username!: string;

  @Column({ allowNull: false })
  password!: string;
}
