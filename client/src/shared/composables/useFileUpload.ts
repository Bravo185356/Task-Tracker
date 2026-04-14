import { onUnmounted, ref } from "vue";

export function useFileUpload() {
	const fileInputRef = ref<HTMLInputElement | null>(null);
	const selectedFiles = ref<File[]>([]);
	const previewUrls = ref<string[]>([]);

	const handleFileSelect = (event: Event) => {
		const input = event.target as HTMLInputElement;
		
		if (!input.files) {
			return;
		};
		
		Array.from(input.files).forEach((file) => {
			selectedFiles.value.push(file);
			previewUrls.value.push(file.type.startsWith('image/') ? URL.createObjectURL(file) : '');
		});
		
		input.value = '';
	};
	
	const removeFile = (idx: number) => {
		if (previewUrls.value[idx]) {
			URL.revokeObjectURL(previewUrls.value[idx]);
		};
		
		previewUrls.value.splice(idx, 1);
		selectedFiles.value.splice(idx, 1);
	};
	
	const clearFiles = () => {
		previewUrls.value.forEach((url) => { if (url) URL.revokeObjectURL(url); });
		previewUrls.value = [];
		selectedFiles.value = [];
	};
	
	onUnmounted(() => {
		clearFiles();
	});
	
	return {
		fileInputRef,
		selectedFiles,
		previewUrls,
		handleFileSelect,
		removeFile,
		clearFiles,
	};
}