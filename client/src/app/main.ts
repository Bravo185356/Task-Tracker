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
			50: '#fafafa',
			100: '#f4f4f5',
			200: '#e4e4e7',
			300: '#d4d4d8',
			400: '#a1a1aa',
			500: '#71717a',
			600: '#52525b',
			700: '#3f3f46',
			800: '#27272a',
			900: '#18181b',
			950: '#09090b'
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
						borderColor: '{primary.700}',
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
        pt: {
            card: {
                body: { class: '!p-4'}
            }
        }
	})
	.use(ToastService)
	.use(ConfirmationService)
	.use(store)
	.use(router)
	.mount('#app')