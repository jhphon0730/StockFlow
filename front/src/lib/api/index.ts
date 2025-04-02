import { getCookie } from '@/lib/cookies'

const VITE_API_URL = import.meta.env.VITE_API_URL

export interface Response<T> {
	data: T,
	error: string | null
}

export const getJWT = async (): Promise<string> => {
	const token = getCookie('jwt')
	if (!token) {
		throw new Error("No token found")
	}

	return token
}

export interface fetchOptions {
	headers?: {[key: string]: any};
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: string | FormData;
	cache?: 'no-cache' | 'default' | 'reload' | 'force-cache' | 'only-if-cached';
	revalidate?: number;
	dynamic?: string;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
}

// NO JWT 
export const FetchWithOutAuth = async (url: string, options: fetchOptions = {}) => {
  const mergeOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  }
  const res = await fetch(`${VITE_API_URL}${url}`, mergeOptions)
  return await res.json()
}

// JWT
export const FetchWithAuth = async (url: string, options: fetchOptions = {}) => {
  const token = await getJWT()
  const mergeOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  }
  const res = await fetch(`${VITE_API_URL}${url}`, mergeOptions)
  return await res.json()
}

// JWT & FormData
export const FetchWithAuthFormData = async (url: string, options: fetchOptions = {}) => {
  const token = await getJWT()
  const mergeOptions = {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  }
  const res = await fetch(`${VITE_API_URL}${url}`, mergeOptions)
  return await res.json()
}
