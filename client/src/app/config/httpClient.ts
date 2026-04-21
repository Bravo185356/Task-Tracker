import { API_URL } from './api';

class HttpClient {
	private baseURL: string;
	private isRefreshing = false;
	private refreshSubscribers: Array<(token: string) => void> = [];

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	private async executeRequest<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;		
		const isFormData = options.body instanceof FormData;
		
		const headers: Record<string, string> = {
			...(isFormData ? {} : { 'Content-Type': 'application/json' }),
			...options.headers as Record<string, string>,
		};

		const response = await fetch(url, { 
			...options, 
			headers,
			credentials: 'include',
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ 
				message: 'Unknown error' 
			})) as { message: string, status?: number };
			
			const err = new Error(error.message || `HTTP Error: ${response.status}`) as Error & { status: number };
			err.status = response.status;
			throw err;
		}

		return response.json();
	}

	private async handleRefreshToken(): Promise<void> {
		try {
			const response = await fetch(`${this.baseURL}/auth/refresh`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});

			if (!response.ok) {
				throw new Error('Refresh failed');
			}
		} catch (error) {
			window.dispatchEvent(new CustomEvent('auth:logout'));
			throw error;
		}
	}

	async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		try {
			return await this.executeRequest<T>(endpoint, options);
		} catch (error: unknown) {
			const httpError = error as Error & { status?: number };
			
			if (httpError.status === 401 && !endpoint.includes('/auth/refresh')) {
				return this.handleUnauthorized<T>(endpoint, options);
			}
			
			throw error;
		}
	}

	private async handleUnauthorized<T>(
		endpoint: string,
		options: RequestInit
	): Promise<T> {
		if (!this.isRefreshing) {
			this.isRefreshing = true;

			try {
				await this.handleRefreshToken();
				
				this.refreshSubscribers.forEach(callback => callback('refreshed'));
				this.refreshSubscribers = [];

				return await this.executeRequest<T>(endpoint, options);
			} catch (refreshError) {
				this.refreshSubscribers = [];
				throw refreshError;
			} finally {
				this.isRefreshing = false;
			}
		} else {
			return new Promise((resolve, reject) => {
				this.refreshSubscribers.push((status: string) => {
					if (status === 'refreshed') {
						this.executeRequest<T>(endpoint, options)
							.then(resolve)
							.catch(reject);
					} else {
						reject(new Error('Token refresh failed'));
					}
				});
			});
		}
	}

	post<T>(endpoint: string, data: unknown): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	postForm<T>(endpoint: string, data: FormData): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: data,
		});
	}

	get<T>(endpoint: string, params?: Record<string, string | null>): Promise<T> {
		if (params) {
			const queriesArray = Object.entries(params).filter(([, value]) => value != null && value !== '');
			const queryString = new URLSearchParams(queriesArray as [string, string][]).toString();

			if (queryString) {
				endpoint = `${endpoint}?${queryString}`
			};
		}
		
		return this.request<T>(endpoint, { method: 'GET' });
	}

	patch<T>(endpoint: string, data: unknown): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PATCH',
			body: JSON.stringify(data),
		});
	}

	put<T>(endpoint: string, data: unknown): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	delete<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, { method: 'DELETE' });
	}
}

export const httpClient = new HttpClient(API_URL);