import { PrismaClient } from '@prisma/client';

async function main() {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: "file:./dev.db"
        });
        await prisma.$connect();
        console.log("Connected successfully");
        const users = await prisma.user.findMany();
        console.log(users);
    } catch (e) {
        console.error(e);
    }
}

main();
