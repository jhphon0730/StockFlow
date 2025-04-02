export interface User {
	ID: string
	CreatedAt: string
	UpdateAt: string
	DeleteAt: string
	name: string
	email: string
	role: string
	password: string
}

export interface SignUpUserDTO {
  name: string
  email: string
  password: string
}

export interface SignInUserDTO {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

