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
	username: string;
	timestamp: number;
	forever: boolean;
}

@Table
export class User extends Model<User> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	userId: number;

	@Column({
		type: DataType.STRING,
		allowNull: false,
		unique: true,
	})
	username: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	password: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	oauthToken: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	oauthRefreshToken: string;

	@Column({
		type: DataType.DATE,
		allowNull: true,
	})
	oauthExpiresAt: Date;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	provider: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	email: string;

	@Column({
		type: DataType.STRING,
		allowNull: true, // Display name is optional
	})
	displayName: string; // New column added here

	@Column({
		type: DataType.DATE,
		allowNull: false,
		defaultValue: DataType.NOW,
	})
	createdAt: Date;

	@Column({
		type: DataType.STRING,
		allowNull: true, // Avatar field is optional
	})
	avatar: string; // Add avatar field

	@Column({
		type: DataType.DATE,
		allowNull: false,
		defaultValue: DataType.NOW,
	})
	updatedAt: Date;

	@Column(DataType.STRING)
	imageType: string;

	@Column(DataType.STRING)
	imageName: string;

	@Column(DataType.BLOB)
	imageData: ArrayBuffer;

	@Column(DataType.STRING)
	imageString: string;

	@Column({
		type: DataType.ARRAY(DataType.JSON),
		defaultValue: [],
		allowNull: true,
	})
	public blocked_users!: BlockUser[];

	@Column({
		type: DataType.STRING(512),
		allowNull: true,
	})
	twoFASecretKey: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	sessionId: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	accessToken: string;

	@BelongsToMany(() => Chat, {
		through: () => UserChat,
		foreignKey: 'userId',
		otherKey: 'chatId',
	})
	public users?: Chat[];
}
