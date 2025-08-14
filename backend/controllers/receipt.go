package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"invisible-receipts-backend/config"
	"invisible-receipts-backend/models"
	"invisible-receipts-backend/utils"
)

func UploadReceipt(c *gin.Context) {
	userID := c.GetString("user_id")

	file, header, err := c.Request.FormFile("receipt")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	// Validate file type
	allowedTypes := []string{".jpg", ".jpeg", ".png", ".pdf"}
	ext := strings.ToLower(filepath.Ext(header.Filename))
	isValid := false
	for _, allowedType := range allowedTypes {
		if ext == allowedType {
			isValid = true
			break
		}
	}

	if !isValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type"})
		return
	}

	// Generate unique filename
	filename := fmt.Sprintf("%s_%d%s", userID, time.Now().Unix(), ext)
	uploadPath := os.Getenv("UPLOAD_PATH")
	if uploadPath == "" {
		uploadPath = "./uploads"
	}
	filepath := filepath.Join(uploadPath, filename)

	// Save file
	if err := c.SaveUploadedFile(header, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Process OCR
	parsedText, err := utils.ProcessOCR(filepath)
	if err != nil {
		parsedText = "OCR processing failed"
	}

	// Parse receipt data (simplified implementation)
	receiptData := utils.ParseReceiptText(parsedText)

	// Create receipt record
	userUUID, _ := uuid.Parse(userID)
	receipt := models.Receipt{
		UserID:       userUUID,
		Filename:     filename,
		OriginalName: header.Filename,
		ParsedText:   parsedText,
		Amount:       receiptData.Amount,
		Currency:     receiptData.Currency,
		Vendor:       receiptData.Vendor,
		Category:     receiptData.Category,
		Items:        receiptData.Items,
		WarrantyInfo: receiptData.WarrantyInfo,
		EcoScore:     receiptData.EcoScore,
	}

	if err := config.DB.Create(&receipt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save receipt"})
		return
	}

	c.JSON(http.StatusCreated, receipt)
}

func GetReceipts(c *gin.Context) {
	userID := c.GetString("user_id")
	
	var receipts []models.Receipt
	if err := config.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&receipts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch receipts"})
		return
	}

	c.JSON(http.StatusOK, receipts)
}

func DeleteReceipt(c *gin.Context) {
	userID := c.GetString("user_id")
	receiptID := c.Param("id")

	var receipt models.Receipt
	if err := config.DB.Where("id = ? AND user_id = ?", receiptID, userID).First(&receipt).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Receipt not found"})
		return
	}

	// Delete file
	uploadPath := os.Getenv("UPLOAD_PATH")
	if uploadPath == "" {
		uploadPath = "./uploads"
	}
	filepath := filepath.Join(uploadPath, receipt.Filename)
	os.Remove(filepath)

	// Delete database record
	if err := config.DB.Delete(&receipt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete receipt"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Receipt deleted successfully"})
}

func ExportReceipts(c *gin.Context) {
	userID := c.GetString("user_id")
	format := c.Query("format") // csv or json
	
	var receipts []models.Receipt
	if err := config.DB.Where("user_id = ?", userID).Find(&receipts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch receipts"})
		return
	}

	if format == "csv" {
		c.Header("Content-Type", "text/csv")
		c.Header("Content-Disposition", "attachment; filename=receipts.csv")
		
		csvData := utils.ConvertToCSV(receipts)
		c.String(http.StatusOK, csvData)
	} else {
		c.Header("Content-Type", "application/json")
		c.Header("Content-Disposition", "attachment; filename=receipts.json")
		c.JSON(http.StatusOK, receipts)
	}
}