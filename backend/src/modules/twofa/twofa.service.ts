import { Injectable, Inject } from '@nestjs/common';
import { TwoFA } from './twofa.entity';
// import { TwoFADto } from './dto/TwoFA.dto';
import { TWOFA_REPOSITORY } from '../../core/constants';

@Injectable()
export class TwoFAService {

	constructor(@Inject(TWOFA_REPOSITORY) private readonly TwoFARepository: typeof TwoFA) { }

	// async create(user: CreateUserDto): Promise<User> {
	// 	return await this.userRepository.create<User>(user);
	// }

	// async findOneByEmail(email: string): Promise<User> {
	// 	return await this.userRepository.findOne<User>({ where: { email } });
	// }

	// async findOneById(id: number): Promise<User> {
	// 	return await this.userRepository.findOne<User>({ where: { id } });
	// }

	async updateTwoFaSecret(email: string, secret): Promise<[number]> {
		return await this.TwoFARepository.update({ secretKey: secret }, { where: { email } });
	}

	async updateIsActiveTwoFa(email: string, value): Promise<[number]> {
		return await this.TwoFARepository.update({ isActiveTwoFa: value }, { where: { email } });
	}

	async resetTwoFaSecret(email: string): Promise<[number]> {
		return await this.TwoFARepository.update({ isActiveTwoFa: false, secretKey: null }, { where: { email } });
	}
}