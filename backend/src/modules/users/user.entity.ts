import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({ tableName: 'Users' })
export class User extends Model<User> {
    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
        // primaryKey: true
    })
    username: string;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
    })
    email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password: string;

    @Column({ allowNull: true })
    secretKey: string;

    @Column({
        type: DataType.BOOLEAN, // Specify the data type as BOOLEAN
        defaultValue: false,    // Set the default value to false
        allowNull: false,
    })
    isActiveTwoFa: boolean;

}