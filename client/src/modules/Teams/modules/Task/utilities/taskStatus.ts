import { taskStatuses } from '../constants/taskStatuses';

const getStatusTagClass = (taskStatus: string, isText = false) => {
	return isText ? 
        taskStatuses.find((status) => status.value === taskStatus)!.textClass : 
        taskStatuses.find((status) => status.value === taskStatus)!.tagClass;
};

const getStatusLabel = (status: string) => {
	return taskStatuses.find((taskStatus) => taskStatus.value === status)?.label;
};

export { getStatusTagClass, getStatusLabel };
