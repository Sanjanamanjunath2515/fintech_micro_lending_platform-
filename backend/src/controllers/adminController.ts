import { Request, Response } from 'express';
import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                profile: {
                    select: {
                        creditScore: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    try {
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'APPLICANT'
            },
            select: { id: true, name: true, email: true, role: true }
        });

        // Initialize empty profile for the user
        await prisma.profile.create({
            data: {
                userId: user.id,
                employmentType: 'Unemployed', // Default
                annualIncome: 0,
                monthlyExpenses: 0,
                creditScore: 300 // Default
            }
        });

        await prisma.auditLog.create({
            data: {
                userId: (req as any).user.id,
                action: 'USER_CREATED',
                details: `Created user ${user.name} (${user.email}) as ${user.role}`
            }
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating user' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, role, status, password } = req.body;

    try {
        const dataToUpdate: any = { name, email, role, status };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            dataToUpdate.password = await bcrypt.hash(password, salt);
        }

        const user = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
            select: { id: true, name: true, email: true, role: true }
        });

        await prisma.auditLog.create({
            data: {
                userId: (req as any).user.id,
                action: 'USER_UPDATED',
                details: `Updated user ${user.name} (${user.email})`
            }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Delete related data first or rely on cascade if configured (Prisma doesn't cascade by default unless configured in DB)
        // We'll attempt to delete. If foreign keys fail, we might need a transaction to delete profile/loans etc.
        // For now, assuming basic deletion.

        // Manual cleanup to be safe
        await prisma.auditLog.deleteMany({ where: { userId: id } });
        await prisma.profile.deleteMany({ where: { userId: id } });
        // Loans might be tricky if we want to keep history. But requirement is "Delete users".
        // Let's check schemas... Loan.userId references User.id.
        const user = await prisma.user.delete({ where: { id } });

        await prisma.auditLog.create({
            data: {
                userId: (req as any).user.id,
                action: 'USER_DELETED',
                details: `Deleted user ${user.name} (${user.email})`
            }
        });

        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, name: true, role: true }
        });

        await prisma.auditLog.create({
            data: {
                userId: (req as any).user.id,
                action: 'USER_ROLE_UPDATE',
                details: `Updated user ${user.name} role to ${role}`
            }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating role' });
    }
};

export const overrideLoanStatus = async (req: Request, res: Response) => {
    const { loanId } = req.params;
    const { status } = req.body; // Approved / Rejected / Flagged

    try {
        const loan = await prisma.loan.findUnique({ where: { id: loanId } });
        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        const oldStatus = loan.status;

        const updatedLoan = await prisma.loan.update({
            where: { id: loanId },
            data: { status }
        });

        await prisma.auditLog.create({
            data: {
                userId: (req as any).user.id,
                loanId: loanId,
                action: 'LOAN_STATUS_OVERRIDE',
                oldStatus,
                newStatus: status,
                details: `Admin overrode loan status to ${status}`
            }
        });

        res.json(updatedLoan);

    } catch (error) {
        res.status(500).json({ message: 'Server error overriding loan' });
    }
};

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const logs = await prisma.auditLog.findMany({
            include: {
                user: { select: { name: true, email: true, role: true } }
            },
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching audit logs' });
    }
};
