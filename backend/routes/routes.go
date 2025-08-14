package routes

import (
	"github.com/gin-gonic/gin"
	"invisible-receipts-backend/controllers"
	"invisible-receipts-backend/middleware"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	
	// Public routes
	api.POST("/register", controllers.Register)
	api.POST("/login", controllers.Login)
	
	// Protected routes
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/upload", controllers.UploadReceipt)
		protected.GET("/receipts", controllers.GetReceipts)
		protected.DELETE("/receipts/:id", controllers.DeleteReceipt)
		protected.GET("/receipts/export", controllers.ExportReceipts)
	}
}