interface UpdateProfilePayload {
	username?: string;
	email?: string;
	password?: string;
	confirmPassword?: string;
	avatar?: File | null;
}

export { type UpdateProfilePayload };
