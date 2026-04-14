import { createApp } from 'vue'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

import store from './store/index'
import router from './router/index'
import App from '@/App.vue'
import './styles/style.css'
import './styles/scrollbar-dark.css'
import { definePreset } from '@primeuix/themes';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			refetchOnReconnect: true,
			staleTime: 5 * 60 * 1000,
		},
	},
});

const ZincPreset = definePreset(Aura, {
	semantic: {
		primary: {
			50: '#fafafa',   // zinc-50 - почти белый
			100: '#f4f4f5',  // zinc-100
			200: '#e4e4e7',  // zinc-200
			300: '#d4d4d8',  // zinc-300
			400: '#a1a1aa',  // zinc-400 - тёмно-серый (без синего!)
			500: '#71717a',  // zinc-500 - очень тёмный
			600: '#52525b',  // zinc-600 - почти чёрный
			700: '#3f3f46',  // zinc-700 - чёрный с серым
			800: '#27272a',  // zinc-800 - глубокий чёрный
			900: '#18181b',  // zinc-900 - почти чистый чёрный
			950: '#09090b'   // zinc-950 - чёрный
		}
	},
	components: {
		card: {
			colorScheme: {
				dark: {
					root: {
						background: '{primary.800}',
						color: '{primary.0}',
					},
					subtitle: {
						color: '{primary.400}'
					}
				}
			}
		},
		button: {
			colorScheme: {
				dark: {
					root: {
						primary: {
							background: '{primary.200}',
						}
					},
				}
			}
		},
		divider: {
			colorScheme: {
				dark: {
					root: {
						borderColor: '{primary.300}',
					}
				}
			}
		}
	}
});

createApp(App)
	.use(VueQueryPlugin, { queryClient })
	.use(PrimeVue, {
		theme: {
			preset: ZincPreset,
		},
	})
	.use(ToastService)
	.use(ConfirmationService)
	.use(store)
	.use(router)
	.mount('#app')