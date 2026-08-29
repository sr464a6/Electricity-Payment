// ========================================
// ELECTRICITY PAYMENT
// APP.JS
// ========================================

const API = "/api";

// ========================================
// HELPER
// ========================================

function getElement(id) {
    return document.getElementById(id);
}

function formatRupiah(value) {
    const number = Number(value) || 0;

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("currentUser"));
    } catch {
        return null;
    }
}

function saveCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

function removeCurrentUser() {
    localStorage.removeItem("currentUser");
}

function isLoggedIn() {
    return !!getCurrentUser();
}

function redirect(url) {
    window.location.href = url;
}

// ========================================
// API REQUEST
// ========================================

async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Terjadi kesalahan pada server"
            );
        }

        return data;

    } catch (error) {
        console.error("API Error:", error);

        throw error;
    }
}

// ========================================
// LOGIN
// ========================================

async function login(username, password) {
    if (!username || !password) {
        return {
            success: false,
            message: "Username dan password wajib diisi"
        };
    }

    try {
        const result = await apiRequest("/login", {
            method: "POST",
            body: JSON.stringify({
                username,
                password
            })
        });

        if (result.success) {
            saveCurrentUser({
                ...result.user,
                role: result.role
            });
        }

        return result;

    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// ========================================
// LOGOUT
// ========================================

function logout() {
    removeCurrentUser();
    redirect("login.html");
}

// ========================================
// PROTECT PAGE
// ========================================

function requireLogin() {
    const user = getCurrentUser();

    if (!user) {
        redirect("login.html");
        return null;
    }

    return user;
}

function requireAdmin() {
    const user = requireLogin();

    if (!user) {
        return null;
    }

    if (user.role !== "admin") {
        alert("Halaman ini khusus untuk admin.");
        redirect("user.html");
        return null;
    }

    return user;
}

function requireUser() {
    const user = requireLogin();

    if (!user) {
        return null;
    }

    if (user.role !== "user") {
        alert("Halaman ini khusus untuk user.");
        redirect("admin.html");
        return null;
    }

    return user;
}

// ========================================
// GET USER
// ========================================

async function getUser(userId) {
    try {
        return await apiRequest(`/users?id=${userId}`);
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// ========================================
// GET ALL USERS
// ========================================

async function getUsers() {
    try {
        return await apiRequest("/users");
    } catch (error) {
        return {
            success: false,
            message: error.message,
            users: []
        };
    }
}

// ========================================
// CREATE USER
// ========================================

async function createUser(userData) {
    try {
        return await apiRequest("/users", {
            method: "POST",
            body: JSON.stringify(userData)
        });
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// ========================================
// GET PAYMENTS
// ========================================

async function getPayments() {
    try {
        return await apiRequest("/payments");
    } catch (error) {
        return {
            success: false,
            message: error.message,
            payments: []
        };
    }
}

// ========================================
// CREATE PAYMENT
// ========================================

async function createPayment(paymentData) {
    try {
        return await apiRequest("/payments", {
            method: "POST",
            body: JSON.stringify(paymentData)
        });
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// ========================================
// DASHBOARD USER
// ========================================

async function loadUserDashboard() {
    const user = requireUser();

    if (!user) {
        return;
    }

    const nameElement = getElement("userName");
    const meterElement = getElement("meterNumber");
    const balanceElement = getElement("balance");

    if (nameElement) {
        nameElement.textContent = user.name || user.username;
    }

    if (meterElement) {
        meterElement.textContent = user.meter_number || "-";
    }

    if (balanceElement) {
        balanceElement.textContent = formatRupiah(user.balance);
    }

    try {
        const result = await getUser(user.id);

        if (result.success && result.user) {
            const freshUser = {
                ...result.user,
                role: "user"
            };

            saveCurrentUser(freshUser);

            if (nameElement) {
                nameElement.textContent =
                    freshUser.name || freshUser.username;
            }

            if (meterElement) {
                meterElement.textContent =
                    freshUser.meter_number || "-";
            }

            if (balanceElement) {
                balanceElement.textContent =
                    formatRupiah(freshUser.balance);
            }
        }

    } catch (error) {
        console.error(error);
    }
}

// ========================================
// DASHBOARD ADMIN
// ========================================

async function loadAdminDashboard() {
    const admin = requireAdmin();

    if (!admin) {
        return;
    }

    const adminName = getElement("adminName");

    if (adminName) {
        adminName.textContent = admin.username;
    }

    const usersResult = await getUsers();
    const paymentsResult = await getPayments();

    const users = usersResult.users || [];
    const payments = paymentsResult.payments || [];

    const totalUsers = getElement("totalUsers");
    const totalPayments = getElement("totalPayments");
    const totalAmount = getElement("totalAmount");
    const pendingPayments = getElement("pendingPayments");

    if (totalUsers) {
        totalUsers.textContent = users.length;
    }

    if (totalPayments) {
        totalPayments.textContent = payments.length;
    }

    if (totalAmount) {
        const amount = payments.reduce(
            (total, payment) =>
                total + Number(payment.amount || 0),
            0
        );

        totalAmount.textContent = formatRupiah(amount);
    }

    if (pendingPayments) {
        const pending = payments.filter(
            payment => payment.status === "pending"
        );

        pendingPayments.textContent = pending.length;
    }
}

// ========================================
// RENDER USERS
// ========================================

async function renderUsers() {
    const tableBody = getElement("usersTableBody");

    if (!tableBody) {
        return;
    }

    const result = await getUsers();

    if (!result.success) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    ${result.message || "Gagal mengambil data"}
                </td>
            </tr>
        `;

        return;
    }

    const users = result.users || [];

    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Belum ada user.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${escapeHTML(user.name)}</td>
            <td>${escapeHTML(user.username)}</td>
            <td>${escapeHTML(user.meter_number)}</td>
            <td>${formatRupiah(user.balance)}</td>
            <td>
                <button
                    class="btn-delete"
                    onclick="deleteUser(${user.id})"
                >
                    Hapus
                </button>
            </td>
        </tr>
    `).join("");
}

// ========================================
// RENDER PAYMENTS
// ========================================

async function renderPayments() {
    const tableBody = getElement("paymentsTableBody");

    if (!tableBody) {
        return;
    }

    const result = await getPayments();

    if (!result.success) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    ${result.message || "Gagal mengambil data"}
                </td>
            </tr>
        `;

        return;
    }

    const payments = result.payments || [];

    if (payments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Belum ada transaksi.
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = payments.map(payment => `
        <tr>
            <td>${payment.id}</td>
            <td>${escapeHTML(payment.name || "-")}</td>
            <td>${escapeHTML(payment.meter_number || "-")}</td>
            <td>${formatRupiah(payment.amount)}</td>
            <td>${escapeHTML(payment.payment_method)}</td>
            <td>
                <span class="status ${payment.status}">
                    ${escapeHTML(payment.status)}
                </span>
            </td>
            <td>
                ${formatDate(payment.created_at)}
            </td>
        </tr>
    `).join("");
}

// ========================================
// DELETE USER
// ========================================

async function deleteUser(userId) {
    const confirmDelete = confirm(
        "Yakin ingin menghapus user ini?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const result = await apiRequest(
            `/users?id=${userId}`,
            {
                method: "DELETE"
            }
        );

        if (result.success) {
            alert("User berhasil dihapus");
            await renderUsers();
        } else {
            alert(result.message || "Gagal menghapus user");
        }

    } catch (error) {
        alert(error.message);
    }
}

// ========================================
// ADD USER FORM
// ========================================

function setupAddUserForm() {
    const form = getElement("addUserForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const username = getElement("newUsername")?.value.trim();
        const password = getElement("newPassword")?.value;
        const name = getElement("newName")?.value.trim();
        const meterNumber =
            getElement("newMeterNumber")?.value.trim();
        const balance =
            Number(getElement("newBalance")?.value || 0);

        if (!username || !password || !name || !meterNumber) {
            alert("Semua data wajib diisi.");
            return;
        }

        const result = await createUser({
            username,
            password,
            name,
            meter_number: meterNumber,
            balance
        });

        if (!result.success) {
            alert(result.message || "Gagal membuat user");
            return;
        }

        alert("User berhasil dibuat.");

        form.reset();

        await renderUsers();
        await loadAdminDashboard();
    });
}

// ========================================
// PAYMENT FORM
// ========================================

function setupPaymentForm() {
    const form = getElement("paymentForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const user = requireUser();

        if (!user) {
            return;
        }

        const amount =
            Number(getElement("paymentAmount")?.value || 0);

        const paymentMethod =
            getElement("paymentMethod")?.value;

        if (!amount || amount <= 0) {
            alert("Masukkan jumlah pembayaran.");
            return;
        }

        if (!paymentMethod) {
            alert("Pilih metode pembayaran.");
            return;
        }

        const result = await createPayment({
            user_id: user.id,
            amount,
            payment_method: paymentMethod
        });

        if (!result.success) {
            alert(
                result.message ||
                "Pembayaran gagal dibuat."
            );

            return;
        }

        alert(
            "Pembayaran berhasil dibuat dan menunggu konfirmasi admin."
        );

        form.reset();

        if (typeof loadUserDashboard === "function") {
            await loadUserDashboard();
        }
    });
}

// ========================================
// SEARCH USERS
// ========================================

function setupUserSearch() {
    const searchInput = getElement("userSearch");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("input", () => {
        const keyword =
            searchInput.value.toLowerCase().trim();

        const rows =
            document.querySelectorAll(
                "#usersTableBody tr"
            );

        rows.forEach(row => {
            const text =
                row.textContent.toLowerCase();

            row.style.display =
                text.includes(keyword)
                    ? ""
                    : "none";
        });
    });
}

// ========================================
// SEARCH PAYMENTS
// ========================================

function setupPaymentSearch() {
    const searchInput =
        getElement("paymentSearch");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("input", () => {
        const keyword =
            searchInput.value.toLowerCase().trim();

        const rows =
            document.querySelectorAll(
                "#paymentsTableBody tr"
            );

        rows.forEach(row => {
            const text =
                row.textContent.toLowerCase();

            row.style.display =
                text.includes(keyword)
                    ? ""
                    : "none";
        });
    });
}

// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateString) {
    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return new Intl.DateTimeFormat(
        "id-ID",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(date);
}

// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// ========================================
// DISPLAY USER INFO
// ========================================

function displayUserInfo() {
    const user = getCurrentUser();

    if (!user) {
        return;
    }

    const nameElements =
        document.querySelectorAll(
            "[data-user-name]"
        );

    nameElements.forEach(element => {
        element.textContent =
            user.name || user.username;
    });

    const usernameElements =
        document.querySelectorAll(
            "[data-user-username]"
        );

    usernameElements.forEach(element => {
        element.textContent =
            user.username || "-";
    });

    const meterElements =
        document.querySelectorAll(
            "[data-user-meter]"
        );

    meterElements.forEach(element => {
        element.textContent =
            user.meter_number || "-";
    });

    const balanceElements =
        document.querySelectorAll(
            "[data-user-balance]"
        );

    balanceElements.forEach(element => {
        element.textContent =
            formatRupiah(user.balance);
    });
}

// ========================================
// AUTO LOGOUT BUTTON
// ========================================

function setupLogoutButtons() {
    const buttons =
        document.querySelectorAll(
            "[data-logout]"
        );

    buttons.forEach(button => {
        button.addEventListener("click", event => {
            event.preventDefault();
            logout();
        });
    });
}

// ========================================
// PAGE DETECTION
// ========================================

async function initializeApp() {
    displayUserInfo();
    setupLogoutButtons();

    setupAddUserForm();
    setupPaymentForm();

    setupUserSearch();
    setupPaymentSearch();

    const page =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    if (page === "admin.html") {
        await loadAdminDashboard();
        await renderUsers();
        await renderPayments();
    }

    if (page === "user.html") {
        await loadUserDashboard();
    }
}

// ========================================
// START APP
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);

// ========================================
// GLOBAL EXPORT
// ========================================

window.ElectricityApp = {
    login,
    logout,
    getCurrentUser,
    getUsers,
    getUser,
    createUser,
    getPayments,
    createPayment,
    loadUserDashboard,
    loadAdminDashboard,
    renderUsers,
    renderPayments,
    formatRupiah,
    formatDate
};