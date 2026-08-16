Markdown
# Smart POS Pro

A professional Point of Sale (POS) system built with React, Vite, Tailwind CSS, Node.js, and MySQL.

## Features

* Billing and Invoicing
* Inventory Management
* Profit & Loss Analytics
* PDF Invoice Generation
* Refund & Expense Tracking

---

## How to Run the Project Locally

Follow these simple steps to run the application on your computer:

### Prerequisites
Make sure you have the following installed:
* Node.js (v18 or higher)
* XAMPP (for MySQL database)

---

### Step 1: Start XAMPP (Database Server)
* Open your **XAMPP Control Panel**.
* Click **Start** next to **Apache** and **MySQL** (make sure both indicators turn green). 
*(Note: You do not need to create any database manually. The backend server will create it automatically!)*

---

### Step 2: Clone or Download the Project
Clone this repository or download it as a ZIP and extract it:
```bash
git clone https://github.com/Montasim2003/Point-Of-Sell-POS-System-.git
cd Point-Of-Sell-POS-System-
Step 3: Install Dependencies
Open your terminal inside the project folder and run the commands below.

Install frontend dependencies:

Bash
npm install
Install backend server dependencies:

Bash
npm install mysql2 cors dotenv express
Step 4: Run the Application
You need to run the backend and frontend in two separate terminal windows.

Terminal 1 (Backend Server & Auto-Database Setup):

Bash
npm run server
(You should see: Database "smart_pos" verified/created successfully., All database tables verified/created successfully!, and API Server running on port 3001)

Terminal 2 (Frontend Client):
Open a new terminal tab/window in the same project directory and run:

Bash
npm run dev
Step 5: Access the App
Open your web browser and navigate to:

Plaintext
http://localhost:3000
