import { Injectable, NotFoundException } from '@nestjs/common';
// import { TaskStatus } from './task-status.enum';
// import { CreateTaskDto } from './dto/create-task.dto';
// import { GetTaskWithFilter } from './dto/get-task-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { Repository } from 'typeorm';
import { GetTaskWithFilter } from './dto/get-task-filter.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {
    console.log('TasksRepository injected:', !!this.tasksRepository);
  }

  async getTasks(filterDto: GetTaskWithFilter): Promise<Task[]> {
    const { search, status } = filterDto;
    const query = this.tasksRepository.createQueryBuilder('task');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    if (search) {
      query.andWhere(
        'LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)',
        { search: `%${search}%` },
      );
    }

    const tasks = await query.getMany();
    return tasks;
  }

  async getTaskById(id: string): Promise<Task> {
    const found = await this.tasksRepository.findOne({ where: { id } });

    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.tasksRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
    });

    await this.tasksRepository.save(task);

    return task;
  }

  async deleteTaskById(id: string): Promise<void> {
    const result = await this.tasksRepository.delete({ id: id });

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.getTaskById(id);
    task.status = status;
    await this.tasksRepository.save(task);

    return task;
  }
}
