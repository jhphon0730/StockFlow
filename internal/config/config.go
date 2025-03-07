package config

import (
	"log"
	"os"
	"sync"

	"github.com/joho/godotenv"
)

type Postgres struct {
	DB_HOST     string
	DB_USER     string
	DB_PASSWORD string
	DB_NAME     string
	DB_PORT     string
	SSL_MODE    string
	TIMEZONE    string
}

type Config struct {
	Postgres Postgres
}

var (
	config_instance *Config
	once            sync.Once
)

func LoadConfig() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		return nil, err
	}

	return &Config{
		Postgres: Postgres{
			DB_HOST:     getEnv("DB_HOST", "localhost"),
			DB_USER:     getEnv("DB_USER", "postgres"),
			DB_PASSWORD: getEnv("DB_PASSWORD", "postgres"),
			DB_NAME:     getEnv("DB_NAME", "postgres5"),
			DB_PORT:     getEnv("DB_PORT", "5432"),
			SSL_MODE:    getEnv("SSL_MODE", "disable"),
			TIMEZONE:    getEnv("TIMEZONE", "Asia/Shanghai"),
		},
	}, nil
}

func GetConfig() *Config {
	once.Do(func() {
		if _, err := LoadConfig(); err != nil {
			log.Fatalln(err)
		}
	})
	return config_instance
}

func getEnv(key string, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
