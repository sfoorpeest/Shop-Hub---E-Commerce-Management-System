# Shop Hub Backend - Setup Guide

## Project Structure

```
backend/
├── app/
│   ├── api/              # API endpoints
│   │   └── v1/
│   │       ├── auth.py   # Authentication endpoints
│   │       └── products.py # Product endpoints
│   ├── core/             # Core configuration
│   │   ├── config.py     # Settings/Config
│   │   ├── security.py   # Security utilities (JWT, Password hashing)
│   ├── db/               # Database
│   │   ├── base.py       # SQLAlchemy base model
│   │   └── session.py    # Database session
│   ├── models/           # Database models
│   │   └── models.py     # User, Product, Order, OrderItem models
│   ├── schemas/          # Pydantic schemas
│   │   └── schemas.py    # Request/Response schemas
│   ├── crud/             # Database operations
│   │   └── crud.py       # CRUD functions for models
│   └── main.py           # FastAPI application
├── .env                  # Environment variables
├── requirements.txt      # Python dependencies
├── init_db.py           # Database initialization script
└── README.md            # This file
```

## Installation

### 1. Create Virtual Environment

```bash
# Using venv
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Edit `.env` file with your settings:

```
PROJECT_NAME=ShopHub E-Commerce
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/shop_hub_db
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 4. Initialize Database

```bash
python init_db.py
```

## Running the Application

### Development Mode

```bash
.\venv\Scripts\uvicorn.exe app.main:app --reload

.\venv\Scripts\Activate.ps1

uvicorn app.main:app --reload
```

Server will run on: `http://localhost:8000`

### API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

### Products
- `GET /api/v1/products/` - Get all products
- `GET /api/v1/products/{id}` - Get product by ID
- `POST /api/v1/products/` - Create product
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product

## Configuration Details

### Settings (app/core/config.py)
- **PROJECT_NAME**: Application name
- **SECRET_KEY**: JWT secret key (use strong key in production)
- **DATABASE_URL**: PostgreSQL connection string
- **ACCESS_TOKEN_EXPIRE_MINUTES**: JWT token expiration time
- **BACKEND_CORS_ORIGINS**: Allowed CORS origins

### Database Models
- **User**: User accounts with authentication
- **Product**: E-commerce products
- **Order**: Customer orders
- **OrderItem**: Items in orders

### Security Features
- **JWT Authentication**: Token-based authentication
- **Password Hashing**: Using bcrypt algorithm
- **CORS Middleware**: Cross-origin request handling
- **Database Connection Pooling**: Connection reuse for performance

## Database Migrations

For future schema changes, you can use Alembic:

```bash
# Install Alembic
pip install alembic

# Initialize migrations
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Your migration name"

# Apply migration
alembic upgrade head
```

## Environment Variables Description

| Variable | Description | Example |
|----------|-------------|---------|
| `PROJECT_NAME` | Application name | ShopHub E-Commerce |
| `SECRET_KEY` | JWT signing key | your-secret-key-12345 |
| `DATABASE_URL` | PostgreSQL connection | postgresql://user:pass@localhost:5432/db |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token validity in minutes | 60 |
| `ALGORITHM` | JWT algorithm | HS256 |
| `DEBUG` | Debug mode | True/False |

## Development Tips

1. **Hot Reload**: The `--reload` flag watches for changes and auto-restarts the server
2. **Database**: First run `python init_db.py` to create tables
3. **Testing**: Add test files with `_test.py` suffix
4. **CRUD Operations**: All database operations are in `app/crud/crud.py`

## TODO Items

- [ ] Implement user authentication in endpoints
- [ ] Add database operations to CRUD endpoints
- [ ] Create tests for all endpoints
- [ ] Add input validation with Pydantic
- [ ] Implement pagination
- [ ] Add caching layer
- [ ] Set up logging
- [ ] Add email verification
- [ ] Implement payment integration

## Support

For issues or questions, please check the main README.md in the project root.
