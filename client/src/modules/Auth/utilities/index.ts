function checkEmail(email: string) {
	return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
}

export { checkEmail };