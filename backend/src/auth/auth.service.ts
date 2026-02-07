// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(email: string, pass: string) {
        // Verificar si el usuario ya existe
        const exists = await this.prisma.user.findUnique({ where: { email } });
        if (exists) throw new BadRequestException('El email ya está registrado');

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(pass, 10);

        // Crear usuario
        const user = await this.prisma.user.create({
            data: { email, password: hashedPassword },
        });

        return this.generateToken(user.id, user.email);
    }

    async login(email: string, pass: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('Credenciales inválidas');

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');

        return this.generateToken(user.id, user.email);
    }

    private generateToken(userId: number, email: string) {
        const payload = { sub: userId, email };
        return {
            userId,
            token: this.jwtService.sign(payload),
        };
    }
}