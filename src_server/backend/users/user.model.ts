// src/users/user.model.ts
import { Column, Model, Table, BelongsToMany, HasMany, DataType } from 'sequelize-typescript';
// import { Optional } from 'sequelize-typescript'; 
import { Chat } from '../messages/message.model';
import { UserChat } from '../messages/userchat.model';

interface UserAttributes {
	id:			number;
	username:	string;
	password:	string;
  }
  

@Table // ({ tableName: 'Users' })
export class User extends Model<UserAttributes> implements UserAttributes{
	@Column({
		type:			DataType.INTEGER,
		primaryKey:		true,
		autoIncrement:	true,
	})
	public id!: number;
	
	@Column({
		type:			DataType.STRING,
		unique:			true,
		allowNull:		false,
	})
	public username!: string;

	@Column({
		type:			DataType.STRING,
		allowNull:		false,
	})
	public password!: string;

	@BelongsToMany(() => Chat, { 
		through: () => UserChat,
		foreignKey: 'userId',
		otherKey: 'chatId',
	})
	public users?: Chat[];
}
