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

type Redis struct {
	REDIS_HOST string
	REDIS_PORT string
	REDIS_PASSWORD string
	REDIS_WAREHOUSE_DB string
	REDIS_PROUDCT_DB string
	REDIS_INVENTORY_DB string
	REDIS_TRANSACTION_DB string
}

type Config struct {
	BCRYPT_COST string
	JWT_SECRET  string
	Postgres    Postgres
	Redis       Redis
}

var (
	config_instance *Config
	once            sync.Once
)

func LoadConfig() (*Config, error) {
	wd, err := os.Getwd()
	if err != nil {
		log.Fatalln(err)
	}
	log.Println("Server Working directory:", wd)

	err = godotenv.Load(".env")
	if err != nil {
		return nil, err
	}

	config_instance = &Config{
		BCRYPT_COST: getEnv("BCRYPT_COST", "1"),
		JWT_SECRET:  getEnv("JWT_SECRET", "jwt"),
		Postgres: Postgres{
			DB_HOST:     getEnv("DB_HOST", "localhost"),
			DB_USER:     getEnv("DB_USER", "postgres"),
			DB_PASSWORD: getEnv("DB_PASSWORD", "postgres"),
			DB_NAME:     getEnv("DB_NAME", "postgres5"),
			DB_PORT:     getEnv("DB_PORT", "5432"),
			SSL_MODE:    getEnv("SSL_MODE", "disable"),
			TIMEZONE:    getEnv("TIMEZONE", "Asia/Shanghai"),
		},
		Redis: Redis{
			REDIS_HOST: getEnv("REDIS_HOST", "localhost"),
			REDIS_PORT: getEnv("REDIS_PORT", "6379"),
			REDIS_PASSWORD: getEnv("REDIS_PASSWORD", ""),
			REDIS_WAREHOUSE_DB: getEnv("REDIS_WAREHOUSE_DB", "0"),
			REDIS_PROUDCT_DB: getEnv("REDIS_PROUDCT_DB", "1"),
			REDIS_INVENTORY_DB: getEnv("REDIS_INVENTORY_DB", "2"),
			REDIS_TRANSACTION_DB: getEnv("REDIS_TRANSACTION_DB", "3"),
		},
	}

	return config_instance, nil
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
