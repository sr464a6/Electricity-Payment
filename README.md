<div align="center">

<!-- Animated Dynamic Glowing Header -->
<img src="https://capsule-render.vercel.app/api?type=venom&color=gradient&customColorList=6,11,23,28,35&height=220&section=header&text=⚡%20ELECTRICITY%20PAYMENT%20&fontSize=38&fontColor=ff9900&animation=scaleIn&fontAlignY=35" width="100%" />

<!-- Multi-Line Rainbow Typing SVG -->
<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=20&duration=3500&pause=1000&color=00F0FF&center=true&vCenter=true&width=800&lines=Web-Based+Electricity+Billing+and+Payment+System;Dual-Role+Access:+Admin+Portal+%26+Customer+Dashboard;Automated+Bill+Calculation+%26+Real-time+Feedback+Tracking" alt="Typing SVG" />
</a>

<br/><br/>

<!-- Floating Animated Tech Badges -->
[![PHP Native](https://img.shields.io/badge/PHP-Native-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![XAMPP](https://img.shields.io/badge/XAMPP-Server-FB7A24?style=for-the-badge&logo=xampp&logoColor=white)](https://www.apachefriends.org/)

<br/>

*A web-based application designed to manage electricity customers, bills, payments, and customer feedback.*

</div>

---

## ⚡ Electricity Payment

**Electricity Payment** is a web-based application designed to manage electricity customers, bills, payments, and customer feedback.

This application was developed using **Native PHP, MySQL, Bootstrap**, and **XAMPP**.

---

## ✨ Features

| Role / Module | Capabilities & Description |
| :--- | :--- |
| 👨‍💼 **Admin** | • Log in as an administrator<br>• View the total number of customers & electricity price per kWh<br>• View the number of unpaid bills<br>• Add, edit, and delete customer data<br>• Add electricity bills & update payment status<br>• View customer feedback & log out |
| 👤 **User / Customer** | • Log in using email and password<br>• View dashboard & total unpaid bills<br>• View electricity bill details & check payment status<br>• Submit feedback and suggestions<br>• View personal information & log out |

---

## 🛠️ Technologies

* **PHP Native**
* **MySQL**
* **Bootstrap 5**
* **HTML5**
* **CSS3**
* **JavaScript**
* **XAMPP / Apache**

---

## 📁 Project Structure

```text
electricity-payment/
│
├── admin.php
├── user.php
├── login.php
│
├── home.php
├── home_user.php
│
├── cust.php
├── tagihan.php
├── tagihan_user.php
│
├── feedback.php
├── feedback_user.php
├── me.php
│
├── logout.php
├── logout_user.php
│
├── connect.php
├── database.sql
│
├── style.css
│
├── bootstrap/
│   ├── css/
│   └── js/
│
└── README.md

```

---

## 💾 Database

The application uses a MySQL database named:

```text
listrik

```

### Main Tables

* **`admin`** — Stores administrator account information.
* **`konsumen`** — Stores customer account and personal information.
* **`tagihan`** — Stores electricity billing information (Customer email, electricity usage, billing period, bill amount, payment deadline, payment status).
* **`feedback`** — Stores feedback and suggestions submitted by customers.

### Database Relationship Structure

```text
listrik
│
├── admin
├── konsumen
├── tagihan
└── feedback

```

> **Payment Status Values (`pembayaran`):**
> * `Lunas`
> * `Belum Lunas`
> *(If an unpaid bill passes its deadline, the application can display `Terlambat`)*
> 
> 

---

## 🚀 Installation

### 1. Install XAMPP

Make sure XAMPP is installed on your computer. Start the following services from the XAMPP Control Panel:

* Apache → **Start**
* MySQL → **Start**

### 2. Place the Project in htdocs

Place the project folder inside:

```text
C:\xampp\htdocs\

```

The final project path should be:

```text
C:\xampp\htdocs\electricity-payment

```

### 3. Import the Database

Open phpMyAdmin:

```text
http://localhost/phpmyadmin

```

1. Create a database named **`listrik`**
2. Select the `listrik` database
3. Open the **Import** menu
4. Select `database.sql`
5. Click **Go**

### 4. Configure the Database Connection

Open `connect.php` and make sure the configuration matches your XAMPP setup:

```php
<?php

$host = "localhost";
$user = "root";
$pass = "";
$db   = "listrik";

$koneksi = new mysqli(
    $host,
    $user,
    $pass,
    $db
);

if ($koneksi->connect_error) {
    die(
        "Database connection failed: "
        . $koneksi->connect_error
    );
}

$koneksi->set_charset("utf8mb4");

?>

```

---

## ▶️ Running the Project

After Apache and MySQL are running, open your browser and visit:

```text
http://localhost/electricity-payment/

```

Or directly access the login page:

```text
http://localhost/electricity-payment/login.php

```

---

## 🔐 Test Accounts

### Admin Account

* **Username:** `admin`
* **Password:** `admin123`

### User Account

* **Email:** `budi@gmail.com`
* **Password:** `123456`

> These accounts are provided for application testing purposes.

---

## 🔄 Application Flow

```text
                   LOGIN
                     │
             ┌───────┴───────┐
             │               │
           ADMIN            USER
             │               │
             ▼               ▼
          home.php       home_user.php
             │               │
       ┌─────┼─────┐     ┌───┼───┐
       │     │     │     │   │   │
       ▼     ▼     ▼     ▼   ▼   ▼
    Customer Bills Feedback Bills Feedback Profile
       │     │     │
       └─────┴─────┘
             │
             ▼
          Database
           listrik

```

---

## 💳 Billing System

Administrators can create electricity bills based on:

* Customer
* Electricity usage in kWh
* Billing period
* Bill amount
* Payment deadline
* Payment status

> **Calculation Formula:**
> `Bill Amount = Electricity Usage × Price per kWh`

---

## 📩 Customer Feedback

Customers can submit feedback through `feedback_user.php`. Submitted feedback is stored in the database and can be viewed by administrators through `feedback.php`.

---

## 📱 Responsive Design

The application is designed to work across different screen sizes, including:

* 💻 Desktop
* 💻 Laptop
* 📱 Tablet
* 📱 Mobile

Bootstrap is used to support the responsive layout.

---

## 🔒 Logout

* Administrators use: `logout.php`
* Customers use: `logout_user.php`

The logout process destroys the current login session and redirects the user back to the login page.

---

## ⚠️ Security Note

> This project currently uses plain-text passwords for learning and testing purposes.
> For a production application, passwords should be securely stored using `password_hash()` and verified using `password_verify()`.

---

## 👩‍💻 Development

* **Project Name:** Electricity Payment
* **Project Folder:** `electricity-payment`
* **Database:** `listrik`

---

## 📄 License

This project was developed for educational purposes and for managing electricity payment and customer information.

---
