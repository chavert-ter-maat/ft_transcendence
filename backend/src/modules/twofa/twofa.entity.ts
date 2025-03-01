import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'Twofas' })
export class TwoFA extends Model<TwoFA> {
	@Column({
		type: DataType.STRING,
		primaryKey: true,
		unique: true,
		allowNull: false,
	})
	email: string;

	@Column({
		type: DataType.STRING,
		allowNull: false
	})
	secretKey: string;
}