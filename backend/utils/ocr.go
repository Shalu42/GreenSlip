package utils

import (
	"fmt"
	"invisible-receipts-backend/models"
	"regexp"
	"strconv"
	"strings"

	"github.com/otiai10/gosseract/v2"
)

type ParsedReceiptData struct {
	Amount       float64              `json:"amount"`
	Currency     string               `json:"currency"`
	Vendor       string               `json:"vendor"`
	Category     string               `json:"category"`
	Items        []models.ReceiptItem `json:"items"`
	WarrantyInfo models.WarrantyInfo  `json:"warranty_info"`
	EcoScore     float64              `json:"eco_score"`
}

func ProcessOCR(filepath string) (string, error) {
	client := gosseract.NewClient()
	defer client.Close()

	client.SetImage(filepath)
	text, err := client.Text()
	if err != nil {
		return "", fmt.Errorf("OCR processing failed: %v", err)
	}

	return text, nil
}

func ParseReceiptText(text string) ParsedReceiptData {
	data := ParsedReceiptData{
		Currency:     "USD",
		Category:     "General",
		WarrantyInfo: models.WarrantyInfo{HasWarranty: false},
		EcoScore:     5.0, // Default eco score
	}

	lines := strings.Split(text, "\n")

	// Extract vendor (usually first meaningful line)
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if len(line) > 3 && !containsOnlyNumbers(line) {
			data.Vendor = line
			break
		}
	}

	// Extract total amount
	totalRegex := regexp.MustCompile(`(?i)total.*?(\d+\.\d{2})`)
	if matches := totalRegex.FindStringSubmatch(text); len(matches) > 1 {
		if amount, err := strconv.ParseFloat(matches[1], 64); err == nil {
			data.Amount = amount
		}
	}

	// Extract items (simplified)
	itemRegex := regexp.MustCompile(`([A-Za-z\s]+)\s+(\d+\.\d{2})`)
	matches := itemRegex.FindAllStringSubmatch(text, -1)

	for _, match := range matches {
		if len(match) >= 3 {
			price, _ := strconv.ParseFloat(match[2], 64)
			item := models.ReceiptItem{
				Name:      strings.TrimSpace(match[1]),
				Quantity:  1,
				Price:     price,
				Category:  categorizeItem(match[1]),
				EcoImpact: calculateItemEcoImpact(match[1]),
			}
			data.Items = append(data.Items, item)
		}
	}

	// Check for warranty information
	warrantyRegex := regexp.MustCompile(`(?i)warranty.*?(\d+)\s*(year|month)`)
	if matches := warrantyRegex.FindStringSubmatch(text); len(matches) > 0 {
		data.WarrantyInfo.HasWarranty = true
		data.WarrantyInfo.WarrantyPeriod = matches[0]
	}

	// Calculate eco score based on items and vendor
	data.EcoScore = calculateEcoScore(data.Items, data.Vendor)
	data.Category = categorizeReceipt(data.Vendor, data.Items)

	return data
}

func containsOnlyNumbers(s string) bool {
	for _, r := range s {
		if !((r >= '0' && r <= '9') || r == '.' || r == ' ') {
			return false
		}
	}
	return true
}

func categorizeItem(itemName string) string {
	itemName = strings.ToLower(itemName)

	if strings.Contains(itemName, "organic") || strings.Contains(itemName, "fresh") {
		return "Organic"
	} else if strings.Contains(itemName, "electronic") || strings.Contains(itemName, "phone") {
		return "Electronics"
	} else if strings.Contains(itemName, "food") || strings.Contains(itemName, "snack") {
		return "Food"
	}

	return "General"
}

func calculateItemEcoImpact(itemName string) int {
	itemName = strings.ToLower(itemName)

	if strings.Contains(itemName, "organic") {
		return 9
	} else if strings.Contains(itemName, "recycl") {
		return 8
	} else if strings.Contains(itemName, "electronic") {
		return 3
	}

	return 5 // Default score
}

func calculateEcoScore(items []models.ReceiptItem, vendor string) float64 {
	if len(items) == 0 {
		return 5.0
	}

	totalScore := 0.0
	for _, item := range items {
		totalScore += float64(item.EcoImpact)
	}

	averageScore := totalScore / float64(len(items))

	// Bonus for eco-friendly vendors
	vendor = strings.ToLower(vendor)
	if strings.Contains(vendor, "whole foods") || strings.Contains(vendor, "organic") {
		averageScore += 1.0
	}

	if averageScore > 10.0 {
		averageScore = 10.0
	}

	return averageScore
}

func categorizeReceipt(vendor string, items []models.ReceiptItem) string {
	vendor = strings.ToLower(vendor)

	if strings.Contains(vendor, "grocery") || strings.Contains(vendor, "market") {
		return "Groceries"
	} else if strings.Contains(vendor, "restaurant") || strings.Contains(vendor, "cafe") {
		return "Restaurant"
	} else if strings.Contains(vendor, "electronics") || strings.Contains(vendor, "best buy") {
		return "Electronics"
	}

	return "General"
}

func ConvertToCSV(receipts []models.Receipt) string {
	csv := "ID,Date,Vendor,Amount,Currency,Category,Eco Score\n"

	for _, receipt := range receipts {
		csv += fmt.Sprintf("%s,%s,%s,%.2f,%s,%s,%.1f\n",
			receipt.ID.String(),
			receipt.UploadDate.Format("2006-01-02"),
			receipt.Vendor,
			receipt.Amount,
			receipt.Currency,
			receipt.Category,
			receipt.EcoScore,
		)
	}

	return csv
}
