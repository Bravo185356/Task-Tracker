type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
type TaskColumn = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'TESTING' | 'DONE';
type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
type ChatType = 'DIRECT' | 'GROUP';

interface User {
	id: string;
	username: string;
	email: string;
	avatar: string | null;
}

interface Team {
	id: string;
	name: string;
	members: TeamMember[];
	createdAt: string;
	updatedAt: string;
	lastCreatedTasks?: Task[];
	lastCompletedTasks?: Task[];
	statistic: TeamStatistic;
}

interface TeamStatistic {
	totalTasks: number;
	tasksCompleted: number;
	tasksInProgress: number;
	tasksTodo: number;
	unassignedTasks: number;
}

interface TeamMember {
	id: string;
	userId: string;
	role: Role;
	username: string;
	email: string;
	joinedAt: string;
	createdAt: string;
	updatedAt: string;
	avatar: string | null;
}

interface Board {
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	tasks: Task[];
}

interface Task {
	id: string;
	title: string;
	description?: string;
	assignedTo: string | null;
	assigned?: User;
	status: string;
	boardId: string;
	teamId: string;
	createdAt: string;
	updatedAt: string;
	order: number | null;
	priority: Priority;
	startedAt: string | null;
	endedAt: string | null;
}

interface Chat {
	id: string;
	teamId: string;
	type: ChatType;
	name: string;
	createdById: string;
	createdAt: string;
	updatedAt: string;
	unreadCount: number;
	lastMessage: Message;
	participants: ChatParticipant[];
}

interface ChatDetails extends Chat {
	messages: Message[];
}

interface ChatParticipant {
	userId: string;
	username: string;
	avatar: string | null;
	joinedAt: string;
	lastReadAt: string;
}

interface Attachment {
	id: string;
	url: string;
	originalFileName: string;
	mimeType: string;
	sizeBytes: number;
}

interface Message {
	id: string;
	chatId: string;
	authorId: string;
	body: string | null;
	createdAt: string;
	updatedAt: string;
	attachments?: Attachment[];
}

export type { 
	User, 
	Team, 
	TeamMember, 
	Role, 
	Board, 
	Task, 
	TaskColumn, 
	Priority, 
	Chat, 
	ChatDetails, 
	ChatParticipant, 
	Message, 
	Attachment 
};