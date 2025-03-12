import { Controller, Body, Post, Get, Delete, UseGuards, Request, ValidationPipe, Param, Query } from '@nestjs/common';
import { TwoFAService } from '../twofa/twofa.service';
import { VerifyTwoFADto } from './dto/VerifyTwoFA.dto';
import { TwoFADto } from './dto/TwoFA.dto';

@Controller('auth/twofa')
export class TwoFAController {
	constructor(private twoFAService: TwoFAService) { }

	@Get('item')
	async retrieveTwoFaSetup(@Query() data) {
		return await this.twoFAService.retrieveTwoFaSetup(data);
	}

	@Get('generate')
	async generateTwoFASecret() {
		return await this.twoFAService.generateTwoFaSecret();
	}

	@Post('save')
	async saveTwoFASetup(@Body() data: TwoFADto) {
		return this.twoFAService.saveToDb(data);
	}

	@Post('verify')
	async verifyTwoFa(@Body() data: VerifyTwoFADto) {
		return this.twoFAService.verifyTwoFa(data);
	}

	@Delete('item')
	async deleteTwoFaSecret(@Body() user: TwoFADto) {
		const secret = await this.twoFAService.deleteTwoFAItem(user);
		return secret
	}

}
