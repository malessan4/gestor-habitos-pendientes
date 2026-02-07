// backend/src/habits.service.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class HabitsService {
    constructor(private prisma: PrismaService) { }

    // Trae solo los hábitos del usuario logueado
    async findAll(userId: number) {
        return this.prisma.habit.findMany({
            where: { userId },
            include: { completions: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Busca un hábito y verifica que pertenezca al usuario
    async findOne(id: number, userId: number) {
        const habit = await this.prisma.habit.findUnique({
            where: { id },
            include: { completions: true },
        });

        if (!habit) throw new NotFoundException('Unidad no encontrada');
        if (habit.userId !== userId) throw new ForbiddenException('No tienes permiso para ver esta unidad');

        return habit;
    }

    // Permite actualizar título, descripción y la frecuencia de la racha
    async update(id: number, data: { title?: string; description?: string; frequency?: number[] }) {
        return this.prisma.habit.update({
            where: { id },
            data,
        });
    }

    // Crea el hábito vinculado al ID del usuario que lo registra
    async create(userId: number, title: string) {
        return this.prisma.habit.create({
            data: {
                title,
                userId,
                frequency: [1, 2, 3, 4, 5] // Por defecto Lunes a Viernes, o el que prefieras
            },
        });
    }

    async complete(habitId: number, minutes: number) {
        return this.prisma.completionLog.create({
            data: { habitId, minutes },
        });
    }

    async removeHabit(id: number) {
        return this.prisma.habit.delete({ where: { id } });
    }

    async undoLastCompletion(habitId: number) {
        const last = await this.prisma.completionLog.findFirst({
            where: { habitId },
            orderBy: { date: 'desc' },
        });
        if (last) {
            return this.prisma.completionLog.delete({ where: { id: last.id } });
        }
    }
}