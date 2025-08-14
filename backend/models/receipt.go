package models

import (
	"time"
	"database/sql/driver"
	"encoding/json"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type WarrantyInfo struct {
	HasWarranty    bool   `json:"has_warranty"`
	WarrantyPeriod string `json:"warranty_period,omitempty"`
	ExpiryDate     string `json:"expiry_date,omitempty"`
	IsExpiring     bool   `json:"is_expiring,omitempty"`
}

func (w WarrantyInfo) Value() (driver.Value, error) {
	return json.Marshal(w)
}

func (w *WarrantyInfo) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, w)
}

type ReceiptItem struct {
	Name      string  `json:"name"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
	Category  string  `json:"category"`
	EcoImpact int     `json:"eco_impact"`
}

type Receipt struct {
	ID           uuid.UUID     `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID       uuid.UUID     `json:"user_id" gorm:"type:uuid;not null"`
	Filename     string        `json:"filename" gorm:"not null"`
	OriginalName string        `json:"original_name" gorm:"not null"`
	ParsedText   string        `json:"parsed_text"`
	Amount       float64       `json:"amount"`
	Currency     string        `json:"currency" gorm:"default:USD"`
	Vendor       string        `json:"vendor"`
	Category     string        `json:"category"`
	Items        []ReceiptItem `json:"items" gorm:"type:jsonb"`
	WarrantyInfo WarrantyInfo  `json:"warranty_info" gorm:"type:jsonb"`
	EcoScore     float64       `json:"eco_score"`
	UploadDate   time.Time     `json:"upload_date"`
	CreatedAt    time.Time     `json:"created_at"`
	User         User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

func (r *Receipt) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	if r.UploadDate.IsZero() {
		r.UploadDate = time.Now()
	}
	return nil
}