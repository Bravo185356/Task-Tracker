interface CreateChatRequest {
	type: 'DIRECT' | 'GROUP';
	otherUserId?: string;
}

interface CreateMessageRequest {
	chatId: string;
	message: string;
	files?: File[];
}

export type { CreateChatRequest, CreateMessageRequest };