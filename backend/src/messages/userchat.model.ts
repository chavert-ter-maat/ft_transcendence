import { Column, Model, Table, BelongsTo, DataType, HasMany, BelongsToMany, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import { User } from '../auth/auth.model';
import { Chat } from "./message.model"; 

@Table //({ tableName: 'UsersChats' })
export class UserChat extends Model {
	@ForeignKey(() => User)
	@Column (DataType.INTEGER)
	public userId!: number;

	@ForeignKey(() => Chat)
	@Column (DataType.INTEGER)
	public chatId!: number;

}
