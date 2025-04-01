package utils

import (
	"encoding/json"
)

func JsonEncode(data interface{}) ([]byte, error) {
	return json.Marshal(data)
}

func JsonDecode(jsonData []byte, data interface{}) error {
	return json.Unmarshal(jsonData, data)
}
