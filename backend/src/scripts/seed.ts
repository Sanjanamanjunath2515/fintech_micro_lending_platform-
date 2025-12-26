import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Clean up
    try {
        await prisma.repayment.deleteMany();
        await prisma.loan.deleteMany();
        await prisma.auditLog.deleteMany();
        await prisma.profile.deleteMany();
        await prisma.user.deleteMany();
    } catch (e) {
        // Ignore delete errors on fresh db
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // --- Users ---
    const admin = await prisma.user.create({
        data: { name: 'Admin User', email: 'admin@fintech.com', password, role: 'ADMIN' }
    });
    const officer = await prisma.user.create({
        data: { name: 'Loan Officer', email: 'officer@fintech.com', password, role: 'LOAN_OFFICER' }
    });
    const analyst = await prisma.user.create({
        data: { name: 'Risk Analyst', email: 'analyst@fintech.com', password, role: 'RISK_ANALYST' }
    });

    // Applicants
    const alice = await prisma.user.create({
        data: { name: 'Alice Applicant', email: 'alice@test.com', password, role: 'APPLICANT' }
    });
    const bob = await prisma.user.create({
        data: { name: 'Bob Applicant', email: 'bob@test.com', password, role: 'APPLICANT' }
    });
    const charlie = await prisma.user.create({
        data: { name: 'Charlie Applicant', email: 'charlie@test.com', password, role: 'APPLICANT' }
    });
    const david = await prisma.user.create({
        data: { name: 'David Default', email: 'david@test.com', password, role: 'APPLICANT' }
    });

    // --- Profiles (Credit Scores) ---
    await prisma.profile.create({ data: { userId: alice.id, employmentType: 'Salaried', annualIncome: 60000, monthlyExpenses: 2000, creditScore: 750 } });
    await prisma.profile.create({ data: { userId: bob.id, employmentType: 'Self-Employed', annualIncome: 80000, monthlyExpenses: 3000, creditScore: 680 } });
    await prisma.profile.create({ data: { userId: charlie.id, employmentType: 'Salaried', annualIncome: 40000, monthlyExpenses: 2500, creditScore: 550 } });
    await prisma.profile.create({ data: { userId: david.id, employmentType: 'Unemployed', annualIncome: 0, monthlyExpenses: 1000, creditScore: 300 } });


    // --- Loans ---
    // 1. Alice: Active Loan
    const loan1 = await prisma.loan.create({
        data: {
            userId: alice.id,
            amount: 5000,
            tenureMonths: 12,
            status: 'ACTIVE',
            interestRate: 10,
            monthlyEmi: 439.58,
            remainingAmount: 4500,
            startDate: new Date(),
        }
    });

    // 2. Bob: Approved (Not yet Disbursed/Active in this logic, or just treated as Approved)
    await prisma.loan.create({
        data: {
            userId: bob.id,
            amount: 15000,
            tenureMonths: 24,
            status: 'APPROVED',
            interestRate: 12,
            monthlyEmi: 706.10,
            remainingAmount: 15000,
            startDate: new Date(),
        }
    });

    // 3. Charlie: Rejected (Low Score)
    await prisma.loan.create({
        data: {
            userId: charlie.id,
            amount: 10000,
            tenureMonths: 12,
            status: 'REJECTED',
            interestRate: 15,
            monthlyEmi: 900,
        }
    });

    // 4. David: Defaulted
    await prisma.loan.create({
        data: {
            userId: david.id,
            amount: 2000,
            tenureMonths: 6,
            status: 'DEFAULTED',
            interestRate: 20,
            monthlyEmi: 350,
            remainingAmount: 1200,
            missedEmis: 3,
            startDate: new Date(new Date().setMonth(new Date().getMonth() - 4))
        }
    });

    // 5. Alice: New Application
    await prisma.loan.create({
        data: {
            userId: alice.id,
            amount: 2000,
            tenureMonths: 6,
            status: 'APPLIED',
            interestRate: 10,
            monthlyEmi: 343,
        }
    });

    // --- Audit Logs ---
    await prisma.auditLog.create({
        data: {
            userId: officer.id,
            action: 'LOAN_APPROVED',
            details: `Approved loan for ${bob.name}`,
            loanId: loan1.id // Just linking to a loan for demo
        }
    });

    await prisma.auditLog.create({
        data: {
            userId: officer.id,
            action: 'LOAN_REJECTED',
            details: `Rejected loan for ${charlie.name} - Low Credit Score`,
        }
    });

    await prisma.auditLog.create({
        data: {
            userId: admin.id,
            action: 'USER_ROLE_UPDATE',
            details: `Promoted ${officer.name} to LOAN_OFFICER`,
        }
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
