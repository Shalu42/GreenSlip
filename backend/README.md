# Invisible Receipts - Go Backend

This is the Go backend for the Invisible Receipts application. It provides JWT authentication, file upload with OCR processing, and PostgreSQL database integration.

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- PostgreSQL 14+
- Tesseract OCR

### Installation

1. **Install Go dependencies:**
```bash
go mod init invisible-receipts-backend
go get github.com/gin-gonic/gin
go get github.com/golang-jwt/jwt/v5
go get gorm.io/gorm
go get gorm.io/driver/postgres
go get github.com/joho/godotenv
go get golang.org/x/crypto/bcrypt
go get github.com/otiai10/gosseract/v2
```

2. **Install Tesseract OCR:**
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

3. **Setup PostgreSQL:**
```sql
CREATE DATABASE invisible_receipts;
CREATE USER receipt_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE invisible_receipts TO receipt_user;
```

4. **Environment Variables:**
Create `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=receipt_user
DB_PASSWORD=your_password
DB_NAME=invisible_receipts
JWT_SECRET=your-super-secret-jwt-key
PORT=8080
UPLOAD_PATH=./uploads
```

5. **Run the server:**
```bash
go run main.go
```

## 📁 Project Structure

```
backend/
├── main.go                 # Application entry point
├── config/
│   └── database.go        # Database configuration
├── controllers/
│   ├── auth.go           # Authentication handlers
│   └── receipt.go        # Receipt handlers
├── middleware/
│   └── auth.go           # JWT middleware
├── models/
│   ├── user.go           # User model
│   └── receipt.go        # Receipt model
├── routes/
│   └── routes.go         # Route definitions
├── utils/
│   ├── jwt.go            # JWT utilities
│   ├── ocr.go            # OCR processing
│   └── validation.go     # Input validation
└── uploads/              # Uploaded files directory
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Receipts
- `POST /api/upload` - Upload and process receipt
- `GET /api/receipts` - Get user's receipts
- `DELETE /api/receipts/:id` - Delete receipt
- `GET /api/receipts/export` - Export receipts

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- File type validation
- Rate limiting (can be added with gin-limiter)

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Receipts Table
```sql
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    parsed_text TEXT,
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    vendor VARCHAR(255),
    category VARCHAR(100),
    eco_score DECIMAL(3,1),
    warranty_info JSONB,
    upload_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔍 OCR Processing

The backend uses Tesseract OCR to extract text from uploaded images and PDFs. The OCR processing includes:

- Text extraction from images (JPEG, PNG)
- PDF text extraction
- Data parsing for amounts, vendors, and items
- Eco-score calculation based on parsed content

## 🌱 Eco-Score Calculation

The eco-score is calculated based on:
- Product categories (organic = higher score)
- Vendor type (eco-friendly stores = bonus points)
- Packaging information (recyclable = bonus points)
- Carbon footprint estimates

## 📦 Deployment

### Docker Deployment
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates tesseract-ocr
WORKDIR /root/
COPY --from=builder /app/main .
COPY --from=builder /app/.env .
CMD ["./main"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=postgres
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: invisible_receipts
      POSTGRES_USER: receipt_user
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## 🧪 Testing

Run tests with:
```bash
go test ./...
```

## 📝 License

This project is licensed under the MIT License.