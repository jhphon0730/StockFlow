package database

import (
	"github.com/jhphon0730/StockFlow/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"sync"
)

var (
	db_instance *gorm.DB
	once        sync.Once
)

func InitDatabase() error {
	var err error
	cfg := config.GetConfig()
	dsn := "host=" + cfg.Postgres.DB_HOST + " user=" + cfg.Postgres.DB_USER + " password=" + cfg.Postgres.DB_PASSWORD + " dbname=" + cfg.Postgres.DB_NAME + " port=" + cfg.Postgres.DB_PORT + " sslmode=" + cfg.Postgres.SSL_MODE + " TimeZone=" + cfg.Postgres.TIMEZONE
	db_instance, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}
	return nil
}

func GetDB() *gorm.DB {
	once.Do(func() {
		if db_instance == nil {
			InitDatabase()
		}
	})
	return db_instance
}

func CloseDB() {
	if db_instance != nil {
		db, _ := db_instance.DB()
		db.Close()
	}
}

func Migration() error {
	DB := GetDB()
	return DB.AutoMigrate()
}
