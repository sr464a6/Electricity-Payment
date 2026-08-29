const API_BASE = "/api";

function getToken() {
    return localStorage.getItem("electricity_token");
}

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(Number(value) || 0);
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

function notify(message) {

    const box =
        document.getElementById(
            "adminNotification"
        );

    box.textContent = message;
    box.classList.add("show");

    clearTimeout(window.notifyTimer);

    window.notifyTimer = setTimeout(() => {
        box.classList.remove("show");
    }, 3000);
}

async function apiFetch(url, options = {}) {

    const token = getToken();

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
    };

    const response =
        await fetch(url, {
            ...options,
            headers
        });

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Request gagal."
        );
    }

    return data;
}

async function loadAdminProfile() {

    try {

        const data =
            await apiFetch(
                `${API_BASE}/me`
            );

        if (
            !data.user ||
            data.user.role !== "admin"
        ) {
            throw new Error(
                "Akses admin ditolak."
            );
        }

        document.getElementById(
            "adminName"
        ).textContent =
            data.user.name ||
            data.user.username ||
            "Admin";

    } catch (error) {

        localStorage.removeItem(
            "electricity_token"
        );

        localStorage.removeItem(
            "electricity_user"
        );

        window.location.href =
            "admin-login.html";
    }
}

async function loadCustomers() {

    const table =
        document.getElementById(
            "customerTable"
        );

    try {

        const data =
            await apiFetch(
                `${API_BASE}/admin/customers`
            );

        const customers =
            data.customers || [];

        table.innerHTML = "";

        document.getElementById(
            "totalCustomers"
        ).textContent =
            customers.length;

        if (!customers.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="5">
                        Belum ada pelanggan.
                    </td>
                </tr>
            `;

            return;
        }

        customers.forEach(customer => {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>
                    ${customer.id}
                </td>

                <td>
                    ${escapeHtml(customer.name)}
                </td>

                <td>
                    ${escapeHtml(customer.customer_id)}
                </td>

                <td>
                    ${escapeHtml(
                        customer.meter_number || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        customer.address || "-"
                    )}
                </td>
            `;

            table.appendChild(row);
        });

    } catch (error) {

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;
    }
}

async function loadBills() {

    const table =
        document.getElementById(
            "adminBillTable"
        );

    try {

        const data =
            await apiFetch(
                `${API_BASE}/admin/bills`
            );

        const bills =
            data.bills || [];

        table.innerHTML = "";

        document.getElementById(
            "totalBills"
        ).textContent =
            bills.length;

        const paid =
            bills.filter(
                bill => bill.status === "Lunas"
            ).length;

        const unpaid =
            bills.length - paid;

        document.getElementById(
            "paidBills"
        ).textContent =
            paid;

        document.getElementById(
            "unpaidBills"
        ).textContent =
            unpaid;

        if (!bills.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="6">
                        Belum ada tagihan.
                    </td>
                </tr>
            `;

            return;
        }

        bills.forEach(bill => {

            const isPaid =
                bill.status === "Lunas";

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${bill.id}</td>

                <td>
                    ${escapeHtml(
                        bill.customer_name
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        bill.period
                    )}
                </td>

                <td>
                    ${Number(bill.kwh || 0)} kWh
                </td>

                <td>
                    ${formatRupiah(
                        bill.total
                    )}
                </td>

                <td>
                    <span class="admin-badge ${
                        isPaid
                        ? "paid"
                        : "unpaid"
                    }">
                        ${escapeHtml(
                            bill.status
                        )}
                    </span>
                </td>
            `;

            table.appendChild(row);
        });

    } catch (error) {

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;
    }
}

async function logout() {

    const token = getToken();

    try {

        if (token) {
            await fetch(
                `${API_BASE}/logout`,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );
        }

    } catch (error) {}

    localStorage.removeItem(
        "electricity_token"
    );

    localStorage.removeItem(
        "electricity_user"
    );

    window.location.href =
        "index.html";
}

function setupMenu() {

    const button =
        document.getElementById(
            "adminMenuButton"
        );

    const menu =
        document.getElementById(
            "adminNavMenu"
        );

    button.addEventListener(
        "click",
        () => {
            menu.classList.toggle("show");
        }
    );
}

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        document.getElementById(
            "adminLogout"
        ).addEventListener(
            "click",
            logout
        );

        document.getElementById(
            "refreshCustomers"
        ).addEventListener(
            "click",
            loadCustomers
        );

        document.getElementById(
            "refreshBills"
        ).addEventListener(
            "click",
            loadBills
        );

        setupMenu();

        await loadAdminProfile();
        await loadCustomers();
        await loadBills();
    }
);