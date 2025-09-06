import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(email: string, password: string, organizationId?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('User exists');

    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hash,
        organizationId: organizationId || undefined,
      },
    });
    return { id: user.id, email: user.email, organizationId: user.organizationId };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, organizationId: user.organizationId, role: user.role };
    return { access_token: this.jwt.sign(payload) };
  }
}