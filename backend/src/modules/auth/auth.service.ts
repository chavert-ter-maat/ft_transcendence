import { BadRequestException, HttpException, HttpStatus, Injectable, MaxFileSizeValidator } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from '../users/dto/LoginUser.dto';
import { CreateUserDto } from '../users/dto/CreateUser.dto';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';


@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UsersService,
		private readonly jwtService: JwtService,
	) { }

	async validateUser(username: string, pass: string) {
		// find if user exist with this email
		const user = await this.userService.findOneByEmail(username);
		if (!user) {
			return null;
		}

		// find if user password match
		const match = await this.comparePassword(pass, user.password);
		if (!match) {
			return null;
		}

		// tslint:disable-next-line: no-string-literal
		const { password, ...result } = user['dataValues'];
		return result;
	}

	public async login(user: LoginUserDto) {
		const token = await this.generateToken(user);
		return { user, token };
	}

	public async create(user: CreateUserDto) {
		// hash the password
		const pass = await this.hashPassword(user.password);

		// create the user

		try {
			const newUser = await this.userService.create({ ...user, password: pass });
			// tslint:disable-next-line: no-string-literal
			const { password, ...result } = newUser['dataValues'];

			// generate token
			const token = await this.generateToken(result);

			// return the user and the token
			return { user: result, token };
		} catch (error) {
			if (error.name == "SequelizeUniqueConstraintError") {
				throw new HttpException(error.original.detail, HttpStatus.BAD_REQUEST)
			}
			else {
				throw new HttpException(error, HttpStatus.BAD_REQUEST)
			}
		}

	}

	private async generateToken(user) {
		const token = await this.jwtService.signAsync(user);
		return token;
	}

	private async hashPassword(password) {
		const hash = await bcrypt.hash(password, 10);
		return hash;
	}

	private async comparePassword(enteredPassword, dbPassword) {
		const match = await bcrypt.compare(enteredPassword, dbPassword);
		return match;
	}
}
