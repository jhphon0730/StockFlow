package main

import "github.com/jhphon0730/StockFlow/internal/server"

func main() {
	s := server.NewServer()
	s.Init("8080")

	s.Run()
}
