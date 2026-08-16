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
* [Node.js](https://nodejs.org/) (v18 or higher)
* [XAMPP](https://www.apachefriends.org/) (for MySQL database)

---

### Step 1: Start XAMPP (Database Server)
1. Open your **XAMPP Control Panel**.
2. Click **Start** next to **Apache** and **MySQL** (make sure both indicators turn green).
*(Note: You do not need to create any database manually. The backend server will create it automatically!)*

---

### Step 2: Clone or Download the Project
1. Clone this repository or download it as a ZIP and extract it:
   ```bash
   git clone [https://github.com/Montasim2003/Point-Of-Sell-POS-System-.git](https://github.com/Montasim2003/Point-Of-Sell-POS-System-.git)
   cd Point-Of-Sell-POS-System-

Install frontend dependencies:
   npm install
Install backend server dependencies:
   npm install mysql2 cors dotenv express

Terminal 1 (Backend Server & Auto-Database Setup):
   npm run server
Terminal 2 (Frontend Client):
   npm run dev

Access the App
   http://localhost:3000
