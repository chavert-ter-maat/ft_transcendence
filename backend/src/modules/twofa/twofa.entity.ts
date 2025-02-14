import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class TwoFA extends Model<TwoFA> {
	@Column({
		type: DataType.STRING,
		unique: true,
		allowNull: false,
	})
	username: string;

	@Column({
		type: DataType.STRING,
		unique: true,
		allowNull: false,
	})
	email: string;
	@Column({ allowNull: true })
	secretKey: string;

	@Column({
		type: DataType.BOOLEAN, // Specify the data type as BOOLEAN
		defaultValue: false,    // Set the default value to false
		allowNull: false,
	})
	isActiveTwoFa: boolean;
}