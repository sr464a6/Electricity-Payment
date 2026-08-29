* {
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    margin: 0;
    min-height: 100vh;
    font-family: Arial, Helvetica, sans-serif;
    background: #f5f7fb;
    color: #212529;
}

.container {
    width: 100%;
    max-width: 1150px;
    margin: auto;
    padding: 0 20px;
}

.navbar {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: #fff;
    border-bottom: 1px solid #e9ecef;
    box-shadow: 0 3px 15px rgba(0,0,0,.05);
}

.navbar-content {
    min-height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.brand {
    color: #0d6efd;
    text-decoration: none;
    font-size: 21px;
    font-weight: 700;
}

.navbar-menu {
    display: flex;
    align-items: center;
    gap: 6px;
}

.nav-link {
    padding: 9px 13px;
    color: #6c757d;
    text-decoration: none;
    border-radius: 8px;
    font-size: 14px;
}

.nav-link:hover,
.nav-link.active {
    background: #e7f1ff;
    color: #0d6efd;
}

.logout-button {
    border: none;
    padding: 9px 15px;
    margin-left: 8px;
    border-radius: 8px;
    background: #dc3545;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
}

.menu-button {
    display: none;
    border: none;
    background: transparent;
    font-size: 27px;
    cursor: pointer;
}

main {
    min-height: calc(100vh - 130px);
    padding: 35px 0 50px;
}

.welcome-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30px;
    margin-bottom: 25px;
    border-radius: 18px;
    background: linear-gradient(135deg,#0d6efd,#084298);
    color: #fff;
    box-shadow: 0 10px 25px rgba(13,110,253,.18);
}

.welcome-small {
    margin: 0 0 5px;
    font-size: 14px;
}

.welcome-section h1 {
    margin: 0 0 8px;
    font-size: 30px;
}

.welcome-description {
    margin: 0;
}

.user-avatar {
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255,255,255,.2);
    font-size: 35px;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 20px;
    margin-bottom: 25px;
}

.summary-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 22px;
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 15px;
    box-shadow: 0 5px 18px rgba(0,0,0,.04);
}

.summary-icon {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-size: 25px;
}

.summary-icon.blue {
    background: #e7f1ff;
}

.summary-icon.orange {
    background: #fff3cd;
}

.summary-icon.green {
    background: #d1e7dd;
}

.summary-card p {
    margin: 0 0 5px;
    color: #6c757d;
    font-size: 13px;
}

.summary-card h3 {
    margin: 0;
    font-size: 18px;
}

.content-section {
    margin-bottom: 25px;
    padding: 25px;
    background: #fff;
    border: 1px solid #e9ecef;
    border-radius: 15px;
    box-shadow: 0 5px 18px rgba(0,0,0,.04);
}

.section-header {
    margin-bottom: 20px;
}

.section-header h2 {
    margin: 0 0 5px;
    font-size: 21px;
}

.section-header p {
    margin: 0;
    color: #6c757d;
    font-size: 14px;
}

.table-wrapper {
    width: 100%;
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    min-width: 650px;
}

thead {
    background: #f8f9fa;
}

th,
td {
    padding: 14px;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
    font-size: 14px;
}

th {
    color: #495057;
}

td {
    color: #495057;
}

.badge {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.badge.unpaid {
    background: #f8d7da;
    color: #842029;
}

.badge.paid {
    background: #d1e7dd;
    color: #0f5132;
}

.small-button {
    padding: 7px 13px;
    border: none;
    border-radius: 7px;
    background: #0d6efd;
    color: #fff;
    cursor: pointer;
}

.profile-card {
    display: flex;
    gap: 25px;
}

.profile-avatar {
    width: 85px;
    height: 85px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #e7f1ff;
    font-size: 40px;
}

.profile-information {
    flex: 1;
}

.profile-row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 13px 0;
    border-bottom: 1px solid #e9ecef;
}

.profile-row span {
    color: #6c757d;
    font-size: 14px;
}

.profile-row strong {
    text-align: right;
    font-size: 14px;
}

.notification {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 2000;
    max-width: 350px;
    padding: 14px 18px;
    border-radius: 10px;
    background: #212529;
    color: #fff;
    transform: translateY(120px);
    opacity: 0;
    transition: .3s;
}

.notification.show {
    transform: translateY(0);
    opacity: 1;
}

footer {
    padding: 20px 0;
    background: #fff;
    border-top: 1px solid #e9ecef;
    text-align: center;
}

footer p {
    margin: 0;
    color: #6c757d;
    font-size: 13px;
}

.auth-page {
    min-height: 100vh;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg,#eef6ff,#f8fbff);
}

.auth-box {
    width: 100%;
    max-width: 430px;
    padding: 40px 35px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 12px 35px rgba(0,0,0,.10);
}

.auth-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 40px;
}

.user-bg {
    background: #e8f7ee;
}

.admin-bg {
    background: #e7f1ff;
}

.auth-box h1 {
    text-align: center;
    margin-bottom: 8px;
}

.user-color {
    color: #198754;
}

.admin-color {
    color: #0d6efd;
}

.auth-subtitle {
    margin-bottom: 30px;
    text-align: center;
    color: #6c757d;
}

.form-group {
    margin-bottom: 18px;
}

.form-group label {
    display: block;
    margin-bottom: 7px;
    font-weight: 600;
}

.form-group input {
    width: 100%;
    height: 48px;
    padding: 0 14px;
    border: 1px solid #ced4da;
    border-radius: 10px;
    outline: none;
    font-size: 15px;
}

.form-group input:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 3px rgba(13,110,253,.12);
}

.auth-button {
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 10px;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
}

.auth-button:disabled {
    opacity: .7;
    cursor: wait;
}

.user-button {
    background: #198754;
}

.admin-button {
    background: #0d6efd;
}

.back-link {
    display: block;
    margin-top: 20px;
    text-align: center;
    color: #6c757d;
    text-decoration: none;
}

.error-message {
    display: none;
    margin-bottom: 20px;
    padding: 12px;
    border-radius: 8px;
    background: #f8d7da;
    color: #842029;
    font-size: 14px;
}

.warning-box {
    margin-top: 20px;
    padding: 12px;
    border-radius: 8px;
    background: #fff3cd;
    color: #664d03;
    font-size: 13px;
    text-align: center;
}

@media (max-width:850px) {
    .navbar-menu {
        display: none;
        position: absolute;
        top: 68px;
        left: 0;
        right: 0;
        padding: 15px 20px;
        flex-direction: column;
        background: #fff;
        border-bottom: 1px solid #e9ecef;
    }

    .navbar-menu.show {
        display: flex;
    }

    .menu-button {
        display: block;
    }

    .nav-link {
        width: 100%;
    }

    .logout-button {
        width: 100%;
        margin: 5px 0 0;
    }

    .summary-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width:600px) {
    .container {
        padding: 0 15px;
    }

    .welcome-section {
        padding: 22px;
    }

    .welcome-section h1 {
        font-size: 24px;
    }

    .content-section {
        padding: 18px;
    }

    .profile-card {
        flex-direction: column;
    }

    .profile-row {
        flex-direction: column;
        gap: 4px;
    }

    .profile-row strong {
        text-align: left;
    }

    .auth-box {
        padding: 30px 22px;
    }
}