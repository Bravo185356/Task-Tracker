import { ref, watch } from 'vue';

interface UseDebouncedFieldOptions {
	delay?: number;
	onUpdate: (value: string) => void;
}

export function useDebouncedField(options: UseDebouncedFieldOptions) {
	const { delay = 600, onUpdate } = options;
	
	const value = ref('');
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let initialized = false;

	const setValue = (newValue: string) => {
		if (debounceTimer) { 
			clearTimeout(debounceTimer)
		};
		
		value.value = newValue;
		initialized = true;
	};

	const clearTimer = () => {
		if (debounceTimer) {
			clearTimeout(debounceTimer)
		};
	};

	watch(value, (newValue) => {
		if (!initialized) {
			return;
		};

		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			onUpdate(newValue);
		}, delay);
	});

	return {
		value,
		setValue,
		clearTimer,
	};
}