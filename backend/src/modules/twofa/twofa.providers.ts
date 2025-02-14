import { TwoFA } from './twofa.entity';
import { TWOFA_REPOSITORY } from '../../core/constants';

export const TwoFAProviders = [{
	provide: TWOFA_REPOSITORY,
	useValue: TwoFA,
}];