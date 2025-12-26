export type Role = 'APPLICANT' | 'LOAN_OFFICER' | 'RISK_ANALYST' | 'ADMIN';
export type LoanStatus = 'APPLIED' | 'UNDER_REVIEW' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'CLOSED' | 'DEFAULTED';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: 'ACTIVE' | 'BLOCKED';
    token?: string;
    profile?: Profile;
}

export interface Profile {
    id: string;
    employmentType: string;
    annualIncome: number;
    monthlyExpenses: number;
    creditScore: number;
}

export interface Loan {
    id: string;
    amount: number;
    tenureMonths: number;
    status: LoanStatus;
    interestRate: number;
    monthlyEmi: number;
    remainingAmount: number;
    missedEmis: number;
    createdAt: string;
    user?: User;
}

export interface AnalyticsData {
    totalLoans: number;
    approvalRate: number;
    rejectionRate: number;
    defaultRate: number;
    avgCreditScore: number;
    totalOutstanding: number;
    breakdown: {
        active: number;
        approved: number;
        rejected: number;
        defaulted: number;
    }
}

export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    details: string;
    timestamp: string;
    user: {
        name: string;
        email: string;
        role: Role;
    };
}
