import { Controller, Get, Post, Param } from '@nestjs/common';
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
}