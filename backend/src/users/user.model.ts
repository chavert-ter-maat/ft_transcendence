import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: false, //change true 
})
export class User extends Model<User> {
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
  username: string;

  @Column({
    type: DataType.STRING,
    allowNull: true, // Keep as allowNull: true
  })
  email?: string; // Use optional type

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatarurl?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  oauthprovider: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  oauthid: string;
}