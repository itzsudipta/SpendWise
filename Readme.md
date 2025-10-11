# SpendWise

**SpendWise** is a modern backend application under development for tracking expenses and managing budgets.  
It is built with **FastAPI** and **PostgreSQL**, designed to provide a robust backend API for financial management.  
This backend project helps users monitor their spending habits, categorize expenses, and receive insights for better financial control.

## 🛠️ Tech Stack

| Category | Technology | Description |
|----------|------------|-------------|
| **Python Backend** | FastAPI | Modern, fast web framework for building APIs |
| | PostgreSQL | Robust relational database management system |
| | SQLAlchemy | Python SQL toolkit and Object-Relational Mapping (ORM) |
| | Pydantic | Data validation using Python type annotations |
| **Node.js Backend** | Node.js | JavaScript runtime environment |
| | Express.js | Fast, minimalist web framework for Node.js |
| | JavaScript ES6+ | Modern JavaScript features and syntax |
| **Database & Storage** | PostgreSQL | Primary database for data persistence |
| | SQL | Structured Query Language for database operations |

## Database Setup

To set up the database for this project, follow these steps:

1. **Install PostgreSQL**: Download and install PostgreSQL on your local system from the [official PostgreSQL website](https://www.postgresql.org/download/)

2. **Configure PostgreSQL**:
   - Set up PostgreSQL with proper credentials (username and password)
   - Use the default port number **5432** for PostgreSQL
   - Create a new database for the SpendWise project

3. **Configure Project Backend**:
   - Update your backend configuration files with the PostgreSQL connection details
   - Ensure both Python (FastAPI) and Node.js (Express.js) backends are configured to connect to your PostgreSQL instance
   - Test the database connection before proceeding with development

## 📊 Current Status

🚧 **In Development**

### Python Backend (FastAPI)
- ⏳ **FastAPI Endpoints**: Currently under development
- ⏳ **PostgreSQL Integration**: Backend API connection with PostgreSQL in progress

### Node.js Backend (Express.js)
- ✅ **Node.js & Express.js Setup**: API setup with database connection successfully established
- ✅ **User Routes**: user_data table routes successfully initialized and API endpoints working smoothly
- ✅ **Expense Routes**: Full CRUD operations for expense table implemented with specialized queries
- ✅ **Budget Routes**: Complete budget management with spending analysis and tracking
- ✅ **Category Routes**: Category management with expense reassignment and dependency checking
- ✅ **All Schema Routes**: All database schema routes successfully implemented and functional

### Database (PostgreSQL)
- ✅ **Database Schema**: Successfully initialized and ready
- ✅ **Database Connection**: Established for Node.js backend implementations
- ✅ **User Table Operations**: Full CRUD operations for user_data table implemented and functional
- ✅ **Expense Table Operations**: Complete expense tracking with category and user relationships
- ✅ **Budget Table Operations**: Budget management with monthly tracking and spending summaries
- ✅ **Category Table Operations**: Category management with expense counting and analytics

### API Endpoints
- ✅ **User Management**: Create, read, update, delete users
- ✅ **Expense Tracking**: Track expenses with categories, dates, and descriptions
- ✅ **Budget Planning**: Set monthly budgets and monitor spending
- ✅ **Category Organization**: Manage expense categories with reassignment capabilities
- ✅ **Analytics Queries**: Get spending summaries, category statistics, and budget insights

## 🤖 Machine Learning Integration

**⚡ Machine learning features are in the planning phase and will be integrated in future updates.**

---

**⚡ Stay tuned for further updates and step-by-step developments.**