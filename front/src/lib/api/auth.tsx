import { FetchWithOutAuth, Response } from "@/lib/api";

import { AuthResponse, SignInUserDTO, SignUpUserDTO } from '@/types/auth'

export const signIn = async (signInProps: SignInUserDTO): Promise<Response<AuthResponse>> => {
  const res = await FetchWithOutAuth('/users/signin', {
    method: 'POST',
    body: JSON.stringify({ ...signInProps }),
  })
  return {
    data: res.data,
    error: res.error,
  }
}

export const signUp = async (signUpProps: SignUpUserDTO): Promise<Response<null>> => {
	const res = await FetchWithOutAuth('/users/signup', {
		method: 'POST',
		body: JSON.stringify({ ...signUpProps }),
	})
	return {
		data: res.data,
		error: res.error,
	}
}

