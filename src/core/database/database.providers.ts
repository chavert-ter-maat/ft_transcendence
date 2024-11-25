import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE, DEVELOPMENT, TEST, PRODUCTION } from '../constants';
import { databaseConfig } from './database.config';
import { User } from '../../modules/users/user.entity';

export const databaseProviders = [{
	provide: SEQUELIZE,
	useFactory: async () => {
		let config;
		switch (process.env.NODE_ENV) {
			case DEVELOPMENT:
				config = databaseConfig.development;
				console.log("dev")
				break;
			case TEST:
				config = databaseConfig.test;
				console.log("test")
				break;
			case PRODUCTION:
				config = databaseConfig.production;
				console.log("prod")
				break;
			default:
				config = databaseConfig.development;
		}
		const sequelize = new Sequelize(config);
		sequelize.addModels([User]);
		await sequelize.sync();
		return sequelize;
	},
}];