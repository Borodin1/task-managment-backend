import { TaskStatus } from '../task.model';

export interface GetTaskWithFilter {
  status?: TaskStatus;
  search?: string;
}
