import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class HabitsService {
    constructor(private prisma: PrismaService) { }

    // Obtener todos los hábitos del usuario 1 (el que creamos con el seed)
    async findAll() {
        return this.prisma.habit.findMany({
            where: { userId: 1 },
            include: { completions: true },
        });
    }

    // Registrar una completitud para hoy
    async complete(habitId: number) {
        return this.prisma.completionLog.create({
            data: {
                habitId: habitId,
                date: new Date(),
            },
        });
    }

    async create(title: string) {
        return this.prisma.habit.create({
            data: {
                title,
                userId: 1,
            },
        });
    }
}