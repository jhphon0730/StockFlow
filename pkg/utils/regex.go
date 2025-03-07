package utils

import (
	"regexp"
)

// 최소 3자, 최대 20자 (알파벳, 숫자, 밑줄 허용)
var UsernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]{3,20}$`)

// 최소 8자, 최대 32자 (알파벳, 숫자, 특수문자 허용)
var PasswordRegex = regexp.MustCompile(`^.{8,32}$`)

// 최소 5자, 최대 50자 (기본적인 이메일 형식만 검증)
var EmailRegex = regexp.MustCompile(`^.{5,50}$`)

// 정규식 검증 함수
func IsValidName(username string) bool {
	return UsernameRegex.MatchString(username)
}

func IsValidPassword(password string) bool {
	return PasswordRegex.MatchString(password)
}

func IsValidEmail(email string) bool {
	return EmailRegex.MatchString(email)
}
