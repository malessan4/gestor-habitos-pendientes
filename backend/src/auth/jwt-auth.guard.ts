// backend/src/auth/jwt-auth.guard.ts
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('No se encontró el token de acceso');
        }

        try {
            // Validamos el token y metemos los datos del usuario en la request
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || 'clave_temporal_solo_para_local',
            });

            request['user'] = payload; // Esto contiene el userId (sub) y el email
        } catch {
            throw new UnauthorizedException('Token inválido o expirado');
        }
        return true;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}