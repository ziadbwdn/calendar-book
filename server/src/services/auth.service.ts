import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { RegisterDto, LoginDto } from '../dto/AuthDto';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, TokenPayload } from '../utils/jwt';

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);

  async register(dto: RegisterDto): Promise<{ user: User; token: string }> {
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = this.userRepo.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
      role: dto.role || UserRole.INVITEE,
      isVerified: true,
    });

    await this.userRepo.save(user);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async login(dto: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const passwordMatch = await comparePassword(dto.password, user.password);
    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id: userId } });
  }
}
