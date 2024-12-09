import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { CreateUserDto } from './user.dto';
import { OauthToken } from '../auth/oauth-token.model';


@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,

    @InjectModel(OauthToken)
    private readonly oauthTokenModel: typeof OauthToken, // Inject the OauthToken model
  ) {}

  async createUser(data: CreateUserDto): Promise<User> {
    try {
      const userCreateData = {
        ...data,
        email: data.email || undefined,
        avatarurl: data.avatarurl || undefined,
      };

      return await this.userModel.create(userCreateData as any);
    } catch (error) {
      this.logger.error('Error creating user', error);
      throw error;
    }
  }

  // Get all users
  async findAll(): Promise<User[]> {
    return this.userModel.findAll({
      attributes: { exclude: ['password'] }, // Exclude sensitive information
    });
  }

  // Get a user by ID
  async findById(id: string): Promise<User | null> {
    return this.userModel.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
  }

  // Update a user
  async updateUser(id: string, data: Partial<User>): Promise<[number, User[]]> {
    try {
      return await this.userModel.update(data, { 
        where: { id }, 
        returning: true 
      });
    } catch (error) {
      this.logger.error(`Error updating user ${id}`, error);
      throw error;
    }
  }

  // Delete a user
  async deleteUser(id: string): Promise<number> {
    try {
      return await this.userModel.destroy({ where: { id } });
    } catch (error) {
      this.logger.error(`Error deleting user ${id}`, error);
      throw error;
    }
  }

  async saveUserToken(tokenData: {
    accessToken: string, 
    refreshToken?: string, 
    expiresIn: number, 
    userId: string
  }): Promise<OauthToken> {
    try {
      return await this.oauthTokenModel.create({
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken ?? null,
        expiresAt: new Date(Date.now() + tokenData.expiresIn * 1000),
        userId: tokenData.userId
      } as any);
    } catch (error) {
      this.logger.error('Error saving user token', error);
      throw error;
    }
  }

  // Optional: Find user by OAuth provider and ID
  async findByOAuthProviderAndId(provider: string, oauthId: string): Promise<User | null> {
    return this.userModel.findOne({ 
      where: { 
        oauthprovider: provider, 
        oauthid: oauthId 
      },
      attributes: { exclude: ['password'] }
    });
  }
}