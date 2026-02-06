import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { HabitsService } from './habits.service';

@Controller('habits')
export class HabitsController {
    constructor(private readonly habitsService: HabitsService) { }

    @Get()
    findAll() {
        return this.habitsService.findAll();
    }

    @Post()
    create(@Body('title') title: string) {
        return this.habitsService.create(title);
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