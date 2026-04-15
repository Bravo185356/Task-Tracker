import type { Message } from '@/shared/types/entities';
import { ref, watch, nextTick, onUnmounted, type Ref } from 'vue';

export function useChatScroll(messages: Ref<Message[]>, isLoading: Ref<boolean>) {
	const messagesScrollEl = ref<HTMLDivElement | null>(null);
	const autoScroll = ref(true);
	const newMessagesCount = ref(0);
	let resizeObserver: ResizeObserver | null = null;

	const isNearBottom = () => {
		const el = messagesScrollEl.value;
		
		if (!el) {
			return true;
		};
		
		return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
	};

	const scrollToBottom = () => {
		const el = messagesScrollEl.value;
		
		if (!el) {
			return;
		};
		
		el.scrollTop = el.scrollHeight;
	};

	const handleScrollToBottom = () => {
		if (autoScroll.value) {
			scrollToBottom();
		};
	};

	const handleScrollEvent = () => {
		autoScroll.value = isNearBottom();
		if (autoScroll.value) {
			newMessagesCount.value = 0;
		};
	};

	const scrollToBottomAndReset = () => {
		newMessagesCount.value = 0;
		autoScroll.value = true;
		scrollToBottom();
	};

	const resetResizeObserver = () => {
		resizeObserver?.disconnect();
		resizeObserver = null;
	};

	const attachResizeObserver = () => {
		resetResizeObserver();
		const el = messagesScrollEl.value;
		
		if (!el) {
			return;
		};
		
		resizeObserver = new ResizeObserver(handleScrollToBottom);
		resizeObserver.observe(el.firstElementChild as Element);
	};

	watch(isLoading, async (loading) => {
		if (loading) {
			resetResizeObserver();
			newMessagesCount.value = 0;
			return;
		}
		autoScroll.value = true;
		await nextTick();
		scrollToBottom();
		attachResizeObserver();
	});

	watch(messages, (next, prev) => {
		const newCount = next.length - prev.length;
		
		if (newCount > 0 && !autoScroll.value && prev.length > 0) {
			newMessagesCount.value += newCount;
		}
		
		handleScrollToBottom();
	}, { deep: true, flush: 'post' });

	onUnmounted(resetResizeObserver);

	return {
		messagesScrollEl,
		newMessagesCount,
		handleScrollEvent,
		handleScrollToBottom,
		scrollToBottomAndReset,
	};
}
