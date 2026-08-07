<template>
	<div class="flex flex-col gap-3">
		<div
			:id="inputId"
			role="button"
			tabindex="0"
			class="relative flex cursor-pointer items-center gap-5 rounded-xl border border-dashed p-4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
            :class="{ 
                'border-zinc-300 bg-zinc-800/70': isDragging, 
                'border-zinc-600 bg-zinc-800/30 hover:border-zinc-500 hover:bg-zinc-800/50': !isDragging 
            }"
			@click="openFilePicker"
			@keydown.enter.prevent="openFilePicker"
			@keydown.space.prevent="openFilePicker"
			@dragenter.prevent="isDragging = true"
			@dragover.prevent="isDragging = true"
			@dragleave.prevent="onDragLeave"
			@drop.prevent="onDrop"
		>
			<Button
				v-if="modelValue"
				type="button"
				icon="pi pi-refresh"
				aria-label="Reset"
				size="small"
				text
				rounded
				severity="secondary"
				class="absolute! top-3 right-3"
				@click.stop="clear"
			/>
			<div class="relative size-24 shrink-0 overflow-hidden rounded-full transition-all">
				<img
					v-if="displayUrl"
					:src="displayUrl"
					alt="Avatar preview"
					class="size-full object-cover"
				/>
				<div
					v-else
					class="flex size-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900"
				>
					<i class="pi pi-user text-3xl text-zinc-600" />
				</div>
			</div>
			<input
				ref="fileInputRef"
				type="file"
				class="hidden"
				accept="image/png,image/jpeg,image/webp,image/gif"
				@change="onFileChange"
			/>
			<div class="flex min-w-0 flex-1 flex-col gap-2">
				<div class="flex items-start gap-2">
					<div class="min-w-0">
						<p class="font-medium text-zinc-200">
                            Drag and drop or click to upload
						</p>
                        <p class="text-sm text-zinc-500">
                            JPG, PNG, WEBP or GIF · up to 5MB
                        </p>
					</div>
				</div>
				<small v-if="errorMessage" class="text-red-400" @click.stop>
					{{ errorMessage }}
				</small>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, useId, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
]);

const props = withDefaults(
	defineProps<{
		modelValue: File | null;
		currentUrl?: string | null;
		label?: string;
	}>(),
	{
		currentUrl: null,
		label: 'Avatar',
	},
);

const emit = defineEmits<{
	'update:modelValue': [file: File | null];
}>();

const toast = useToast();
const inputId = useId();
const fileInputRef = ref<HTMLInputElement | null>(null);
const objectUrl = ref<string | null>(null);
const errorMessage = ref('');
const isDragging = ref(false);

const displayUrl = computed(() => objectUrl.value ?? props.currentUrl ?? null);

watch(() => props.modelValue, (file) => {
		if (objectUrl.value) {
			URL.revokeObjectURL(objectUrl.value);
			objectUrl.value = null;
		}
		if (file) {
			objectUrl.value = URL.createObjectURL(file);
		}
	},
	{ immediate: true },
);

onUnmounted(() => {
	if (objectUrl.value) {
		URL.revokeObjectURL(objectUrl.value);
	}
});

function openFilePicker() {
	fileInputRef.value?.click();
}

function onDragLeave(event: DragEvent) {
	const currentTarget = event.currentTarget as HTMLElement | null;
	const related = event.relatedTarget as Node | null;
    
	if (!currentTarget?.contains(related)) {
		isDragging.value = false;
	}
}

function onDrop(event: DragEvent) {
	isDragging.value = false;
	const file = event.dataTransfer?.files?.[0];
    
	if (file) {
		validateAndSetFile(file);
	}
}

function clear() {
	errorMessage.value = '';
	emit('update:modelValue', null);
    
	if (fileInputRef.value) {
		fileInputRef.value.value = '';
	}
}

function onFileChange(event: Event) {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0];
    
	if (!file) {
		emit('update:modelValue', null);
		return;
	}
    
	validateAndSetFile(file);
}

function validateAndSetFile(file: File) {
	errorMessage.value = '';

	if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
		const message = 'Avatar must be JPG, PNG, WEBP or GIF';
		errorMessage.value = message;
        
		toast.add({
			severity: 'error',
			summary: 'Invalid file format',
			detail: message,
			life: 3000,
		});
        
		if (fileInputRef.value) {
            fileInputRef.value.value = ''
        };
        
		emit('update:modelValue', null);
		return;
	}

	if (file.size > MAX_AVATAR_BYTES) {
		const message = 'Avatar must be smaller than 5MB';
		errorMessage.value = message;
        
		toast.add({
			severity: 'error',
			summary: 'File is too large',
			detail: message,
			life: 3000,
		});
        
		if (fileInputRef.value) {
            fileInputRef.value.value = ''
        };
        
		emit('update:modelValue', null);
		return;
	}

	emit('update:modelValue', file);
}

defineExpose({ clear });
</script>
