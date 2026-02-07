// backend/src/habits.controller.ts
import { Controller, Get, Post, Param, Body, Delete, Patch, UseGuards, Request } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('habits')
@UseGuards(JwtAuthGuard) // <--- Todos los endpoints de aquí abajo ahora son privados
export class HabitsController {
    constructor(private readonly habitsService: HabitsService) { }

    @Get()
    findAll(@Request() req: any) {
        // Obtenemos el userId del token decodificado
        return this.habitsService.findAll(req.user.sub);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: any) {
        // Agregamos req.user.sub para pasar el ID del usuario logueado
        return this.habitsService.findOne(Number(id), req.user.sub);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.habitsService.update(Number(id), data);
    }

    @Post()
    create(@Request() req: any, @Body('title') title: string) {
        // Creamos el hábito vinculado al usuario logueado
        return this.habitsService.create(req.user.sub, title);
    }

    @Post(':id/complete')
    complete(@Param('id') id: string, @Body('minutes') minutes: number) {
        return this.habitsService.complete(Number(id), Number(minutes) || 0);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.habitsService.removeHabit(Number(id));
    }

    @Delete(':id/undo')
    undo(@Param('id') id: string) {
        return this.habitsService.undoLastCompletion(Number(id));
    }
}