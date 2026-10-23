import { connectDatabase } from './database.js'
import { createBackendServer } from './server.js'

const PORT = Number(process.env.PORT) || 3001
const POSTGRES_URL =
    process.env.POSTGRES_URL ??
    'postgresql://postgres:postgres@localhost:5432/space'
const NU31_ELECTRICITY_TOKEN = process.env.NU31_ELECTRICITY_TOKEN

if (!NU31_ELECTRICITY_TOKEN) {
    console.warn(
        'NU31_ELECTRICITY_TOKEN is not set, electricity pings will be rejected'
    )
}

async function main() {
    let pool
    try {
        pool = await connectDatabase(POSTGRES_URL)
    } catch (error) {
        console.error('Failed to connect to PostgreSQL:', error)
        process.exit(1)
    }

    const server = createBackendServer(pool, {
        electricityToken: NU31_ELECTRICITY_TOKEN,
    })

    server.listen(PORT, () => {
        console.info(`Backend listening on http://localhost:${PORT}`)
    })

    const shutdown = async () => {
        server.close()
        await pool.end()
        process.exit(0)
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
}

main()
