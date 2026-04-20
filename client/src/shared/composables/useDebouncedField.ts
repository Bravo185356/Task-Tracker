interface UseDebouncedFieldOptions {
	delay?: number;
	onUpdate: (value: string) => void;
}

export function useDebouncedField(options: UseDebouncedFieldOptions) {
	const { delay = 600, onUpdate } = options;	
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	const setValue = (newValue: string) => {
		if (debounceTimer) { 
			clearTimeout(debounceTimer)
		};
		
		debounceTimer = setTimeout(() => {
			onUpdate(newValue);
		}, delay);
	};

	return { setValue };
}