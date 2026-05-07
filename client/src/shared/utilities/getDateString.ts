export const getDateString = (date: string) => {
	const today = new Date().getDate();
	
	if(today === new Date(date).getDate()) {
		return new Date(date).toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
		});
	} else {
		return new Date(date).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'numeric',
			year: 'numeric',
		});
	}
};