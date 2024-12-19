import {
  Column,
  Model,
  Table,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { Chat } from '../messages/message.model';
import { UserChat } from '../messages/userchat.model';

interface BlockUser {
	username:		string;
	timestamp:		number;
	forever:		boolean;
}

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

  @Column({
		type:			DataType.ARRAY(DataType.JSON),
		allowNull:		false,
	})
	public blocked_users!: BlockUser[];
  
	@BelongsToMany(() => Chat, { 
		through: () => UserChat,
		foreignKey: 'userId',
		otherKey: 'chatId',
	})
	public users?: Chat[];
}
