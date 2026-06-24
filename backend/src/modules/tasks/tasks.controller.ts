import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskMovementResponse, TaskResponse } from './tasks.types';
import { TasksService } from './tasks.service';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(): Promise<TaskResponse[]> {
    return this.tasksService.findAll();
  }

  @Post()
  create(
    @Body() payload: CreateTaskDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TaskResponse> {
    return this.tasksService.create(payload, currentUser);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<TaskResponse> {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateTaskDto,
  ): Promise<TaskResponse> {
    return this.tasksService.update(id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.tasksService.remove(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateTaskStatusDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<TaskResponse> {
    return this.tasksService.updateStatus(id, payload, currentUser);
  }

  @Get(':id/movements')
  findMovements(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TaskMovementResponse[]> {
    return this.tasksService.findMovements(id);
  }
}

