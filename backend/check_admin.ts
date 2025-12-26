
import { prisma } from './src/config/db';

async function check() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin@fintech.com' },
        });
        console.log('User found:', user);
        if (user) {
            console.log('Password hash exists:', !!user.password);
        } else {
            console.log('User admin@fintech.com DOES NOT EXIST.');
        }
    } catch (e) {
        console.error('Error querying database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
