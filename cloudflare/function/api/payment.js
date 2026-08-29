export async function onRequestGet(context) {
    try {
        const { env } = context;

        const payments = await env.DB
            .prepare(
                `SELECT
                    payments.id,
                    payments.user_id,
                    users.name,
                    users.meter_number,
                    payments.amount,
                    payments.payment_method,
                    payments.status,
                    payments.created_at
                 FROM payments
                 JOIN users ON users.id = payments.user_id
                 ORDER BY payments.id DESC`
            )
            .all();

        return Response.json({
            success: true,
            payments: payments.results
        });

    } catch (error) {
        return Response.json(
            {
                success: false,
                message: error.message
            },
            { status: 500 }
        );
    }
}

export async function onRequestPost(context) {
    try {
        const { request, env } = context;

        const body = await request.json();

        const userId = Number(body.user_id);
        const amount = Number(body.amount);
        const paymentMethod = body.payment_method?.trim();

        if (!userId || !amount || amount <= 0 || !paymentMethod) {
            return Response.json(
                {
                    success: false,
                    message: "Data pembayaran tidak lengkap"
                },
                { status: 400 }
            );
        }

        const user = await env.DB
            .prepare(
                "SELECT id FROM users WHERE id = ?"
            )
            .bind(userId)
            .first();

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User tidak ditemukan"
                },
                { status: 404 }
            );
        }

        const result = await env.DB
            .prepare(
                `INSERT INTO payments
                 (user_id, amount, payment_method, status)
                 VALUES (?, ?, ?, 'pending')`
            )
            .bind(
                userId,
                amount,
                paymentMethod
            )
            .run();

        return Response.json({
            success: true,
            message: "Pembayaran berhasil dibuat",
            id: result.meta.last_row_id
        });

    } catch (error) {
        return Response.json(
            {
                success: false,
                message: error.message
            },
            { status: 500 }
        );
    }
}