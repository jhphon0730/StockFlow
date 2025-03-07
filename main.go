package main

import (
	"log"

	"github.com/jhphon0730/StockFlow/internal/config"
	"github.com/jhphon0730/StockFlow/internal/database"
	"github.com/jhphon0730/StockFlow/internal/server"
)

func main() {
	// log 셋팅
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	if _, err := config.LoadConfig(); err != nil {
		log.Fatalln(err)
	}

	if err := database.InitDatabase(); err != nil {
		log.Fatalln(err)
		return
	}

	if err := database.Migration(); err != nil {
		log.Fatalln(err)
		return
	}

	s := server.NewServer()
	s.Init("8080")

	s.Run()
}
