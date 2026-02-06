import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class HabitsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.habit.findMany({
            where: { userId: 1 },
            include: { completions: true },
        });
    }

    async findOne(id: number) {
        return this.prisma.habit.findUnique({
            where: { id },
            include: { completions: true },
        });
    }

    async update(id: number, data: { title?: string; description?: string }) {
        return this.prisma.habit.update({
            where: { id },
            data,
        });
    }

    async create(title: string) {
        return this.prisma.habit.create({
            data: { title, userId: 1 },
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