import { Column, Model, Table, BelongsTo, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import { User } from '../users/user.model';
import { UserChat } from './userchat.model'; 

// interface Message {
// 	message_contant:	string;
// 	user: 				string;
// }

interface message_stamp { message_: string, name_: string, user_ : string, timestamp: string, pic_: string };
interface user_stamp	{ name_: string, admin_: boolean, timestamp: string };

interface ChatAtributes {
	chatId:		number;
	chatname:		string;
	creator:		string;
	messages:		message_stamp[];
	user_stamps:	user_stamp[];
	password:		string;
}

@Table // ({ tableName: 'Chats' })
export class Chat extends Model<ChatAtributes> implements ChatAtributes {
	@Column({
		type:			DataType.INTEGER,
		primaryKey:		true,
		autoIncrement:	true,
	})
	public chatId!: number;
	
	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	public chatname!: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	public creator!: string;

	@Column({
		type: DataType.ARRAY(DataType.JSON),
		allowNull: false,
	})
	public messages!: message_stamp[];

	@Column({
		type: DataType.ARRAY(DataType.JSON),
		allowNull: false,
	})
	public user_stamps!: user_stamp[];

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	public password!: string;

	@BelongsToMany(() => User, { 
		through: () => UserChat,
		foreignKey: 'chatId',
		otherKey: 'userId',
	})
	public users?: User[];
}
