package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/jhphon0730/StockFlow/internal/config"
	"github.com/jhphon0730/StockFlow/internal/database"
	"github.com/jhphon0730/StockFlow/internal/server"
	"github.com/jhphon0730/StockFlow/pkg/utils"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())

	// 로그 설정
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// 설정 로드
	if _, err := config.LoadConfig(); err != nil {
		log.Fatalln("Config Load Error:", err)
	}

	// 데이터베이스 초기화
	if err := database.InitDatabase(); err != nil {
		log.Fatalln("Database Init Error:", err)
	}

	// Bcrypt 초기화
	if err := utils.InitBcrypt(); err != nil {
		log.Fatalln("Bcrypt Init Error:", err)
	}

	// 마이그레이션 실행
	if err := database.Migration(); err != nil {
		log.Fatalln("Database Migration Error:", err)
	}

	s := server.NewServer()
	s.Init("8080")

	// OS 종료 신호 감지
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	// 서버 실행
	go func() {
		if err := s.Run(); err != nil {
			log.Fatalf("Server error: %v\n", err)
		}
	}()

	// 종료 신호 대기
	<-c

	s.Shutdown(ctx)
	cancel()

	log.Println("Server shutdown completed")
}
