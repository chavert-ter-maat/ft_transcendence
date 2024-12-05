import { Column, Model, Table, BelongsTo, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import { User } from '../users/user.model';
import { UserChat } from './userchat.model'; 

interface message_stamp { message_: string, name_: string, user_ : string, timestamp: string, pic_: string };
interface user_stamp	{ name_: string, admin_: boolean, timestamp: string };

interface MutedUser {
	username:		string;
	timestamp:		number;
	forever:		boolean;
}

interface ChatAtributes {
	chatId:			number;
	chatname:		string;
	creator:		string;
	admins:			string[];
	messages:		message_stamp[];
	user_stamps:	user_stamp[];
	muted_users:	MutedUser[];
	password:		string;
	public:			boolean;
	DM:				boolean;
	last_edit:		string;
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
		type: DataType.ARRAY(DataType.STRING),
		allowNull: true,
	})
	public admins!: string[];

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
		type: DataType.ARRAY(DataType.JSON),
		allowNull: false,
	})
	public muted_users!: MutedUser[];

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	public password!: string;

	@Column({
		type: DataType.BOOLEAN,
		allowNull: false,
	})
	public public!: boolean;

	@Column({
		type: DataType.BOOLEAN,
		allowNull: false,
	})
	public DM!: boolean;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	public last_edit!: string;

	@BelongsToMany(() => User, { 
		through: () => UserChat,
		foreignKey: 'chatId',
		otherKey: 'userId',
	})
	public users?: User[];
}
