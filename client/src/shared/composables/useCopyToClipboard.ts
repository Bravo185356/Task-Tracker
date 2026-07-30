import { useToast } from 'primevue/usetoast';
import { copyToClipboard } from '@/shared/utilities/copyToClipboard';

export function useCopyToClipboard() {
	const toast = useToast();
    
	const copy = async (text: string) => {
		const ok = await copyToClipboard(text);
        
		if (ok) {
			toast.add({
				severity: 'success',
				summary: 'Copied',
				detail: 'Copied to clipboard',
				life: 3000,
			});
		} else {
			toast.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to copy to clipboard',
				life: 3000,
			});
		}
	};
	return { copy };
}
