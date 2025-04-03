import { getCookie } from "@/lib/cookies"
import { logout } from "@/lib/api/auth"

const VITE_API_URL = import.meta.env.VITE_API_URL

export interface Response<T> {
	data: T
	error: string | null
}

export const getJWT = async (): Promise<string> => {
	const token = getCookie("token")
	if (!token) {
		throw new Error("No token found")
	}
	return token
}

export interface fetchOptions {
	headers?: Record<string, string>
	method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
	body?: string | FormData
	cache?: "no-cache" | "default" | "reload" | "force-cache" | "only-if-cached"
}

const defaultHeaders = {
	"Content-Type": "application/json",
}

// JWT 없이 요청
export const FetchWithOutAuth = async (url: string, options: fetchOptions = {}) => {
	const mergeOptions = {
		...options,
		headers: {
			...defaultHeaders,
			...options.headers,
		},
	}
	const res = await fetch(`${VITE_API_URL}${url}`, mergeOptions)

	// 응답이 JSON이 아닌 경우 처리
	if (!res.ok) {
		throw new Error(`HTTP Error: ${res.status}`)
	}

	return await res.json()
}

// JWT 포함 요청
export const FetchWithAuth = async (url: string, options: fetchOptions = {}) => {
	try {
		const token = await getJWT()
		const mergeOptions = {
			...options,
			headers: {
				...defaultHeaders,
				Authorization: `Bearer ${token}`,
				...options.headers,
			},
		}

		const res = await fetch(`${VITE_API_URL}${url}`, mergeOptions)

		// 토큰 만료 (401 Unauthorized) 처리
		if (res.status === 401) {
			handleTokenExpiration()
			throw new Error("Your session has expired. Please log in again.")
		}

		// 응답이 JSON이 아닌 경우 처리
		if (!res.ok) {
			throw new Error(`HTTP Error: ${res.status}`)
		}

		return await res.json()
	} catch (error) {
		console.error("FetchWithAuth Error:", error)
		throw error // 에러를 다시 던져서 호출한 쪽에서 핸들링할 수 있도록 함
	}
}

// JWT + FormData 요청 (파일 업로드 등)
export const FetchWithAuthFormData = async (url: string, options: fetchOptions = {}) => {
	try {
		const token = await getJWT()
		const mergeOptions = {
			...options,
			headers: {
				Authorization: `Bearer ${token}`,
				...options.headers, // Content-Type 제거 (자동 설정됨)
			},
		}

		const res = await fetch(`${VITE_API_URL}${url}`, mergeOptions)

		// 토큰 만료 (401 Unauthorized) 처리
		if (res.status === 401) {
			handleTokenExpiration()
			throw new Error("Your session has expired. Please log in again.")
		}

		// 응답이 JSON이 아닌 경우 처리
		if (!res.ok) {
			throw new Error(`HTTP Error: ${res.status}`)
		}

		return await res.json()
	} catch (error) {
		console.error("FetchWithAuthFormData Error:", error)
		throw error
	}
}

// 토큰 만료 시 로그아웃 + 리디렉션
const handleTokenExpiration = () => {
	logout()

	const currentPath = window.location.pathname
	if (currentPath !== "/login") {
		sessionStorage.setItem("redirectAfterLogin", currentPath)
	}

	// SPA 환경에서는 replace가 더 자연스럽게 동작
	window.location.replace("/login?expired=true")
}
