import { Module } from '@nestjs/common';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  controllers: [HabitsController],
  providers: [HabitsService, PrismaService],
})
export class AppModule { }