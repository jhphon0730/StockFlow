# Dockerfile
FROM golang:1.23-alpine AS builder

WORKDIR /app

# 필요한 의존성 복사 및 설치
COPY go.mod go.sum ./
RUN go mod download

# 앱 소스 복사
COPY . .

# Go 앱 빌드
RUN go build -o stockflow main.go

# 실행용 이미지
FROM alpine:latest

WORKDIR /root/

COPY .env ./

# redis 클라이언트 필요시 설치 (선택사항)
RUN apk add --no-cache ca-certificates

# 빌드된 바이너리 복사
COPY --from=builder /app/stockflow .

# 정적 파일 복사
COPY --from=builder /app/front/dist ./front/dist

# 포트 오픈
EXPOSE 8080

# 실행 명령
CMD ["./stockflow"]

