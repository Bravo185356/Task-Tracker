import { taskPriorities } from '../constants/taskPriorities';

const getPriorityTagClass = (taskPriority: string) => {
	return taskPriorities.find((p) => p.value === taskPriority)!.tagClass;
};

export { getPriorityTagClass };
