import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../entities/task.entity';
import { TaskType } from '../../entities/taskType.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async getUserTask(
    userId: number,
    page: number,
    pageSize: number,
    startTime: number,
    endTime: number,
    status: number,
    typeId: number,
  ) {
    // 分页操作
    const qb = this.taskRepository.createQueryBuilder('task');
    const [result, total] = await qb
      .leftJoinAndMapOne(
        // .leftJoinAndMapMany(
        'task.typeMessage',
        TaskType,
        'taskType',
        'task.typeId = taskType.typeId',
      )
      // .leftJoinAndSelect(TaskType, 'taskType', 'task.typeId = taskType.typeId') // 表关联
      .where('task.userId = :userId', { userId })
      .andWhere('task.createTime >= :startTime', { startTime })
      .andWhere('task.createTime <= :endTime', { endTime })
      .andWhere('task.status = :status', { status })
      .andWhere('task.typeId = :typeId', { typeId })
      .skip(pageSize * (page - 1))
      .take(pageSize)
      // .execute();
      .getManyAndCount();
    return {
      result,
      total,
    };
  }

  async getTaskDetail(taskId: number) {
    const task = await this.taskRepository.findBy({ taskId });
    return task;
  }

  async addUserTask(params: {
    userId: number;
    typeId: number;
    taskName: string;
    taskContent: string;
    createTime: string;
  }) {
    await this.taskRepository.insert(params);
    return { status: 1, message: '添加成功' };
  }

  async delTask(taskId: number) {
    await this.taskRepository.delete({ taskId });
    return { status: 1, message: '删除成功' };
  }

  async updateTaskStatus(updateParams: any) {
    const { taskId, ...params } = updateParams;
    const qb = this.taskRepository.createQueryBuilder('task');
    qb.update(Task)
      .set(params)
      .where('task.taskId = :taskId', { taskId })
      .execute();
    return { status: 1, message: '更新成功' };
  }

  async updateTask(updateParams: any) {
    const { taskId, ...params } = updateParams;
    const qb = this.taskRepository.createQueryBuilder('task');
    qb.update(Task)
      .set(params)
      .where('task.taskId = :taskId', { taskId })
      .execute();
    return { status: 1, message: '更新成功' };
  }

  async getTaskListByName(userId: number, taskName) {
    // 分页操作
    const qb = this.taskRepository.createQueryBuilder('task');
    const [result, total] = await qb
      .leftJoinAndMapOne(
        'task.typeMessage',
        TaskType,
        'taskType',
        'task.typeId = taskType.typeId',
      )
      .where('task.userId = :userId', { userId })
      .andWhere('task.taskName LIKE :taskName', {
        taskName: '%' + taskName + '%',
      })
      .skip(10 * (1 - 1))
      .take(10)
      .getManyAndCount();
    return {
      result,
      total,
    };
  }
}