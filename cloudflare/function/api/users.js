export async function onRequestGet(context) {
    try {
        const { request, env } = context;

        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (id) {
            const user = await env.DB
                .prepare(
                    `SELECT id, username, name, meter_number, balance, created_at
                     FROM users
                     WHERE id = ?`
                )
                .bind(id)
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

            return Response.json({
                success: true,
                user
            });
        }

        const users = await env.DB
            .prepare(
                `SELECT id, username, name, meter_number, balance, created_at
                 FROM users
                 ORDER BY id DESC`
            )
            .all();

        return Response.json({
            success: true,
            users: users.results
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

        const username = body.username?.trim();
        const password = body.password;
        const name = body.name?.trim();
        const meterNumber = body.meter_number?.trim();
        const balance = Number(body.balance || 0);

        if (!username || !password || !name || !meterNumber) {
            return Response.json(
                {
                    success: false,
                    message: "Data user belum lengkap"
                },
                { status: 400 }
            );
        }

        const existing = await env.DB
            .prepare(
                `SELECT id
                 FROM users
                 WHERE username = ? OR meter_number = ?`
            )
            .bind(username, meterNumber)
            .first();

        if (existing) {
            return Response.json(
                {
                    success: false,
                    message: "Username atau nomor meter sudah digunakan"
                },
                { status: 409 }
            );
        }

        const result = await env.DB
            .prepare(
                `INSERT INTO users
                 (username, password, name, meter_number, balance)
                 VALUES (?, ?, ?, ?, ?)`
            )
            .bind(
                username,
                password,
                name,
                meterNumber,
                balance
            )
            .run();

        return Response.json({
            success: true,
            message: "User berhasil dibuat",
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