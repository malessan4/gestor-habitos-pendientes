import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { HabitsService } from './habits.service';

@Controller('habits')
export class HabitsController {
    constructor(private readonly habitsService: HabitsService) { }

    @Get()
    findAll() {
        return this.habitsService.findAll();
    }

    @Post(':id/complete')
    complete(@Param('id') id: string) {
        return this.habitsService.complete(Number(id));
    }

    @Post()
    create(@Body('title') title: string) {
        return this.habitsService.create(title);
    }
}