import { taskPriorities } from '../constants/taskPriorities';

const getPriorityTagClass = (taskPriority: string, tagName?: string) => {
	if(!tagName) {
		return taskPriorities.find((p) => p.value === taskPriority)!.tagClass;
	}
	
	if(taskPriority === tagName) {
		const baseClass = taskPriorities.find((p) => p.value === taskPriority)!.tagClass;
		const hoverClass = taskPriorities.find((p) => p.value === taskPriority)?.hoverClass;
		return `${baseClass} ${hoverClass}`;
	} else {
		return taskPriorities.find((p) => p.value === tagName)!.hoverClass;
	}
};

export { getPriorityTagClass };
