export async function onRequestPost(context) {
    try {
        const { request, env } = context;

        const body = await request.json();

        const username = body.username?.trim();
        const password = body.password;

        if (!username || !password) {
            return Response.json(
                {
                    success: false,
                    message: "Username dan password wajib diisi"
                },
                { status: 400 }
            );
        }

        const admin = await env.DB
            .prepare(
                "SELECT id, username FROM admins WHERE username = ? AND password = ?"
            )
            .bind(username, password)
            .first();

        if (admin) {
            return Response.json({
                success: true,
                role: "admin",
                user: {
                    id: admin.id,
                    username: admin.username
                }
            });
        }

        const user = await env.DB
            .prepare(
                `SELECT id, username, name, meter_number, balance
                 FROM users
                 WHERE username = ? AND password = ?`
            )
            .bind(username, password)
            .first();

        if (user) {
            return Response.json({
                success: true,
                role: "user",
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    meter_number: user.meter_number,
                    balance: user.balance
                }
            });
        }

        return Response.json(
            {
                success: false,
                message: "Username atau password salah"
            },
            { status: 401 }
        );

    } catch (error) {
        return Response.json(
            {
                success: false,
                message: "Terjadi kesalahan server",
                error: error.message
            },
            { status: 500 }
        );
    }
}