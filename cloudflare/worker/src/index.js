const JSON_HEADERS = {
    "Content-Type": "application/json; charset=UTF-8",
    "Cache-Control": "no-store"
};

function json(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: JSON_HEADERS
        }
    );
}

function cors(response) {

    const headers =
        new Headers(response.headers);

    headers.set(
        "Access-Control-Allow-Origin",
        "*"
    );

    headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );

    return new Response(
        response.body,
        {
            status: response.status,
            headers
        }
    );
}

function randomBytes(length = 32) {
    const bytes =
        new Uint8Array(length);

    crypto.getRandomValues(bytes);

    return bytes;
}

function bytesToHex(bytes) {

    return Array.from(bytes)
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");
}

function hexToBytes(hex) {

    const bytes =
        new Uint8Array(
            hex.length / 2
        );

    for (
        let i = 0;
        i < bytes.length;
        i++
    ) {
        bytes[i] =
            parseInt(
                hex.substr(i * 2, 2),
                16
            );
    }

    return bytes;
}

async function sha256(text) {

    const data =
        new TextEncoder().encode(text);

    const hash =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    return bytesToHex(
        new Uint8Array(hash)
    );
}

async function hashPassword(password) {

    const salt =
        bytesToHex(
            randomBytes(16)
        );

    const key =
        await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            {
                name: "PBKDF2"
            },
            false,
            ["deriveBits"]
        );

    const bits =
        await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: hexToBytes(salt),
                iterations: 100000,
                hash: "SHA-256"
            },
            key,
            256
        );

    const hash =
        bytesToHex(
            new Uint8Array(bits)
        );

    return `${salt}:${hash}`;
}

async function verifyPassword(
    password,
    stored
) {

    if (!stored || !stored.includes(":")) {
        return false;
    }

    const [
        salt,
        originalHash
    ] = stored.split(":");

    const key =
        await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            {
                name: "PBKDF2"
            },
            false,
            ["deriveBits"]
        );

    const bits =
        await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: hexToBytes(salt),
                iterations: 100000,
                hash: "SHA-256"
            },
            key,
            256
        );

    const hash =
        bytesToHex(
            new Uint8Array(bits)
        );

    return hash === originalHash;
}

async function createToken() {

    return bytesToHex(
        randomBytes(32)
    );
}

async function createSession(
    db,
    userId
) {

    const token =
        await createToken();

    const tokenHash =
        await sha256(token);

    const expiresAt =
        Math.floor(
            Date.now() / 1000
        ) + 60 * 60 * 24 * 7;

    await db.prepare(
        `
        INSERT INTO sessions
        (token_hash, user_id, expires_at)
        VALUES (?, ?, ?)
        `
    )
    .bind(
        tokenHash,
        userId,
        expiresAt
    )
    .run();

    return token;
}

async function getUserFromRequest(
    request,
    env
) {

    const authorization =
        request.headers.get(
            "Authorization"
        );

    if (
        !authorization ||
        !authorization.startsWith("Bearer ")
    ) {
        return null;
    }

    const token =
        authorization
            .slice(7)
            .trim();

    if (!token) {
        return null;
    }

    const tokenHash =
        await sha256(token);

    const now =
        Math.floor(
            Date.now() / 1000
        );

    const result =
        await env.DB.prepare(
            `
            SELECT
                users.id,
                users.username,
                users.name,
                users.role
            FROM sessions
            JOIN users
                ON users.id = sessions.user_id
            WHERE sessions.token_hash = ?
              AND sessions.expires_at > ?
            LIMIT 1
            `
        )
        .bind(
            tokenHash,
            now
        )
        .first();

    return result || null;
}

async function handleUserLogin(
    request,
    env,
    adminOnly = false
) {

    let body;

    try {
        body = await request.json();
    } catch {
        return json(
            {
                error:
                    "Data login tidak valid."
            },
            400
        );
    }

    const username =
        String(body.username || "").trim();

    const password =
        String(body.password || "");

    if (!username || !password) {
        return json(
            {
                error:
                    "Username dan password wajib diisi."
            },
            400
        );
    }

    const user =
        await env.DB.prepare(
            `
            SELECT
                id,
                username,
                password_hash,
                name,
                role
            FROM users
            WHERE username = ?
            LIMIT 1
            `
        )
        .bind(username)
        .first();

    if (!user) {
        return json(
            {
                error:
                    "Username atau password salah."
            },
            401
        );
    }

    if (
        adminOnly &&
        user.role !== "admin"
    ) {
        return json(
            {
                error:
                    "Akun ini bukan admin."
            },
            403
        );
    }

    if (
        !adminOnly &&
        user.role !== "user"
    ) {
        return json(
            {
                error:
                    "Gunakan login admin."
            },
            403
        );
    }

    const valid =
        await verifyPassword(
            password,
            user.password_hash
        );

    if (!valid) {
        return json(
            {
                error:
                    "Username atau password salah."
            },
            401
        );
    }

    const token =
        await createSession(
            env.DB,
            user.id
        );

    let customer = null;

    if (user.role === "user") {

        customer =
            await env.DB.prepare(
                `
                SELECT
                    customer_id,
                    meter_number,
                    address
                FROM customers
                WHERE user_id = ?
                LIMIT 1
                `
            )
            .bind(user.id)
            .first();
    }

    return json({
        success: true,

        token,

        user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            customerId:
                customer?.customer_id || null,
            meterNumber:
                customer?.meter_number || null,
            address:
                customer?.address || null
        }
    });
}

async function handleMe(
    request,
    env
) {

    const user =
        await getUserFromRequest(
            request,
            env
        );

    if (!user) {
        return json(
            {
                error:
                    "Session tidak valid."
            },
            401
        );
    }

    let customer = null;

    if (user.role === "user") {

        customer =
            await env.DB.prepare(
                `
                SELECT
                    customer_id,
                    meter_number,
                    address
                FROM customers
                WHERE user_id = ?
                LIMIT 1
                `
            )
            .bind(user.id)
            .first();
    }

    return json({
        user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            customerId:
                customer?.customer_id || null,
            meterNumber:
                customer?.meter_number || null,
            address:
                customer?.address || null
        }
    });
}

async function handleLogout(
    request,
    env
) {

    const authorization =
        request.headers.get(
            "Authorization"
        );

    if (
        authorization &&
        authorization.startsWith("Bearer ")
    ) {

        const token =
            authorization.slice(7).trim();

        const tokenHash =
            await sha256(token);

        await env.DB.prepare(
            `
            DELETE FROM sessions
            WHERE token_hash = ?
            `
        )
        .bind(tokenHash)
        .run();
    }

    return json({
        success: true
    });
}

async function handleUserBills(
    request,
    env
) {

    const user =
        await getUserFromRequest(
            request,
            env
        );

    if (!user || user.role !== "user") {
        return json(
            {
                error:
                    "Akses ditolak."
            },
            403
        );
    }

    const bills =
        await env.DB.prepare(
            `
            SELECT
                bills.id,
                bills.period,
                bills.kwh,
                bills.total,
                bills.status
            FROM bills
            JOIN customers
                ON customers.id =
                   bills.customer_id
            WHERE customers.user_id = ?
            ORDER BY bills.id DESC
            `
        )
        .bind(user.id)
        .all();

    return json({
        bills:
            bills.results || []
    });
}

async function handleUserPayments(
    request,
    env
) {

    const user =
        await getUserFromRequest(
            request,
            env
        );

    if (!user || user.role !== "user") {
        return json(
            {
                error:
                    "Akses ditolak."
            },
            403
        );
    }

    const payments =
        await env.DB.prepare(
            `
            SELECT
                payments.id,
                payments.amount,
                payments.payment_method,
                payments.payment_date,
                payments.status,
                bills.period
            FROM payments
            JOIN bills
                ON bills.id = payments.bill_id
            JOIN customers
                ON customers.id =
                   bills.customer_id
            WHERE customers.user_id = ?
            ORDER BY payments.id DESC
            `
        )
        .bind(user.id)
        .all();

    return json({
        payments:
            payments.results || []
    });
}

async function handlePayment(
    request,
    env
) {

    const user =
        await getUserFromRequest(
            request,
            env
        );

    if (!user || user.role !== "user") {
        return json(
            {
                error:
                    "Akses ditolak."
            },
            403
        );
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return json(
            {
                error:
                    "Data pembayaran tidak valid."
            },
            400
        );
    }

    const billId =
        Number(body.billId);

    const paymentMethod =
        String(
            body.paymentMethod || ""
        ).trim();

    if (
        !billId ||
        !paymentMethod
    ) {
        return json(
            {
                error:
                    "Data pembayaran belum lengkap."
            },
            400
        );
    }

    const bill =
        await env.DB.prepare(
            `
            SELECT
                bills.id,
                bills.total,
                bills.status
            FROM bills
            JOIN customers
                ON customers.id =
                   bills.customer_id
            WHERE bills.id = ?
              AND customers.user_id = ?
            LIMIT 1
            `
        )
        .bind(
            billId,
            user.id
        )
        .first();

    if (!bill) {
        return json(
            {
                error:
                    "Tagihan tidak ditemukan."
            },
            404
        );
    }

    if (bill.status === "Lunas") {
        return json(
            {
                error:
                    "Tagihan sudah lunas."
            },
            400
        );
    }

    await env.DB.prepare(
        `
        INSERT INTO payments
        (
            bill_id,
            amount,
            payment_method,
            status
        )
        VALUES (?, ?, ?, 'Berhasil')
        `
    )
    .bind(
        bill.id,
        bill.total,
        paymentMethod
    )
    .run();

    await env.DB.prepare(
        `
        UPDATE bills
        SET status = 'Lunas'
        WHERE id = ?
        `
    )
    .bind(bill.id)
    .run();

    return json({
        success: true,
        message:
            "Pembayaran berhasil."
    });
}

async function handleAdminCustomers(
    request,
    env
) {

    const user =
        await getUserFromRequest(
            request,
            env
        );

    if (!user || user.role !== "admin") {
        return json(
            {
                error:
                    "Akses admin diperlukan."
            },
            403
        );
    }

    const customers =
        await env.DB.prepare(
            `
            SELECT
                customers.id,
                customers.customer_id,
                customers.meter_number,
                customers.address,
                users.name,
                users.username
            FROM customers
            JOIN users
                ON users.id =
                   customers.user_id
            ORDER BY customers.id DESC
            `
        )
        .all();

    return json({
        customers:
            customers.results || []
    });
}

async function handleAdminBills(
    request,
    env
) {

    const user =
        await getUserFromRequest(
            request,
            env
        );

    if (!user || user.role !== "admin") {
        return json(
            {
                error:
                    "Akses admin diperlukan."
            },
            403
        );
    }

    const bills =
        await env.DB.prepare(
            `
            SELECT
                bills.id,
                bills.period,
                bills.kwh,
                bills.total,
                bills.status,
                users.name AS customer_name,
                customers.customer_id
            FROM bills
            JOIN customers
                ON customers.id =
                   bills.customer_id
            JOIN users
                ON users.id =
                   customers.user_id
            ORDER BY bills.id DESC
            `
        )
        .all();

    return json({
        bills:
            bills.results || []
    });
}

async function handleSetup(
    request,
    env
) {

    const setupKey =
        env.SETUP_KEY;

    if (!setupKey) {
        return json(
            {
                error:
                    "SETUP_KEY belum dikonfigurasi."
            },
            500
        );
    }

    const authorization =
        request.headers.get(
            "Authorization"
        );

    if (
        authorization !==
        `Bearer ${setupKey}`
    ) {
        return json(
            {
                error:
                    "Setup key salah."
            },
            403
        );
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return json(
            {
                error:
                    "JSON tidak valid."
            },
            400
        );
    }

    const username =
        String(body.username || "")
            .trim();

    const password =
        String(body.password || "");

    const name =
        String(body.name || "")
            .trim();

    const role =
        body.role === "admin"
            ? "admin"
            : "user";

    if (
        !username ||
        !password ||
        !name
    ) {
        return json(
            {
                error:
                    "username, password, dan name wajib diisi."
            },
            400
        );
    }

    const passwordHash =
        await hashPassword(password);

    try {

        const result =
            await env.DB.prepare(
                `
                INSERT INTO users
                (
                    username,
                    password_hash,
                    name,
                    role
                )
                VALUES (?, ?, ?, ?)
                `
            )
            .bind(
                username,
                passwordHash,
                name,
                role
            )
            .run();

        return json({
            success: true,
            userId:
                result.meta.last_row_id,
            username,
            name,
            role
        });

    } catch (error) {

        return json(
            {
                error:
                    "Username sudah digunakan."
            },
            409
        );
    }
}

async function router(
    request,
    env
) {

    const url =
        new URL(request.url);

    const path =
        url.pathname;

    const method =
        request.method;

    if (method === "OPTIONS") {
        return new Response(null, {
            status: 204
        });
    }

    if (
        method === "GET" &&
        path === "/api/health"
    ) {
        return json({
            success: true,
            app:
                env.APP_NAME ||
                "Electricity Payment",
            database: "D1",
            status: "online"
        });
    }

    if (
        method === "POST" &&
        path === "/api/login"
    ) {
        return handleUserLogin(
            request,
            env,
            false
        );
    }

    if (
        method === "POST" &&
        path === "/api/admin/login"
    ) {
        return handleUserLogin(
            request,
            env,
            true
        );
    }

    if (
        method === "GET" &&
        path === "/api/me"
    ) {
        return handleMe(
            request,
            env
        );
    }

    if (
        method === "POST" &&
        path === "/api/logout"
    ) {
        return handleLogout(
            request,
            env
        );
    }

    if (
        method === "GET" &&
        path === "/api/user/bills"
    ) {
        return handleUserBills(
            request,
            env
        );
    }

    if (
        method === "GET" &&
        path === "/api/user/payments"
    ) {
        return handleUserPayments(
            request,
            env
        );
    }

    if (
        method === "POST" &&
        path === "/api/payment"
    ) {
        return handlePayment(
            request,
            env
        );
    }

    if (
        method === "GET" &&
        path === "/api/admin/customers"
    ) {
        return handleAdminCustomers(
            request,
            env
        );
    }

    if (
        method === "GET" &&
        path === "/api/admin/bills"
    ) {
        return handleAdminBills(
            request,
            env
        );
    }

    if (
        method === "POST" &&
        path === "/api/setup"
    ) {
        return handleSetup(
            request,
            env
        );
    }

    return json(
        {
            error: "Endpoint tidak ditemukan."
        },
        404
    );
}

export default {

    async fetch(
        request,
        env
    ) {

        try {

            const response =
                await router(
                    request,
                    env
                );

            return cors(response);

        } catch (error) {

            console.error(error);

            return cors(
                json(
                    {
                        error:
                            "Internal server error."
                    },
                    500
                )
            );
        }
    }
};