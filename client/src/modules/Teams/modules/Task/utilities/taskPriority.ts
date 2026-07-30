import { taskPriorities } from '../constants/taskPriorities';

const getPriorityTagClass = (taskPriority: string, isText = false) => {
	return isText ? 
        taskPriorities.find((priority) => priority.value === taskPriority)!.textClass : 
        taskPriorities.find((priority) => priority.value === taskPriority)!.tagClass;
};

const getPriorityLabel = (taskPriority: string) => {
	return taskPriorities.find((priority) => priority.value === taskPriority)?.label;
};

export { getPriorityTagClass, getPriorityLabel };
