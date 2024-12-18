import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
	require('dotenv').config();
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix('api');

	app.enableCors({
		origin: "*" , //process.env.FRONTEND_URL,
		credentials: true,
	});

	const sequelize = app.get(Sequelize);
	await sequelize.sync();

	const port = process.env.PORT_BACKEND || 4000;
	await app.listen(port);
	console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
