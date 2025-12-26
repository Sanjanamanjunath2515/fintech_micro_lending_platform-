// Native fetch used (Node 18+)

const BASE_URL = 'http://localhost:3000/api';

async function main() {
    try {
        const timestamp = Date.now();
        const email = `applicant${timestamp}@test.com`;
        const password = 'password123';

        console.log(`Using email: ${email}`);

        // 1. Register
        console.log('1. Registering...');
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test Applicant', email, password, role: 'APPLICANT' })
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
        const token = regData.token;
        console.log('   Registration successful.');

        // 2. Get Credit Score (New Endpoint)
        console.log('2. Fetching Credit Score...');
        const scoreRes = await fetch(`${BASE_URL}/auth/my-credit-score`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const scoreData = await scoreRes.json();
        console.log(`   Score Data: ${JSON.stringify(scoreData)}`);
        if (scoreData.creditScore !== 300) console.warn('   WARNING: Expected default score 300');

        // 3. Apply for Valid Loan
        // Income: 120000/yr (10k/mo). 40% = 48000 max loan.
        // EMI limit: 30% of 10k = 3000.
        // Try Loan: 10000 for 12 months.
        console.log('3. Applying for Valid Loan...');
        const validLoanRes = await fetch(`${BASE_URL}/loans/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                amount: 10000,
                tenureMonths: 12,
                employmentType: 'SALARIED',
                annualIncome: 120000,
                monthlyExpenses: 5000
            })
        });
        const validLoanData = await validLoanRes.json();
        if (!validLoanRes.ok) throw new Error(`Valid loan application failed: ${JSON.stringify(validLoanData)}`);
        console.log('   Loan applied successfully.');

        // 4. Check My Loans
        console.log('4. Checking My Loans...');
        const myLoansRes = await fetch(`${BASE_URL}/loans/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const myLoansData = await myLoansRes.json();
        console.log(`   My Loans: ${myLoansData.length} active`);
        if (myLoansData.length !== 1) console.warn('   WARNING: Expected 1 active loan');

        // 5. Apply for Duplicate Loan (Should Fail)
        console.log('5. Testing Duplicate Loan Check...');
        const dupLoanRes = await fetch(`${BASE_URL}/loans/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                amount: 5000,
                tenureMonths: 6,
                employmentType: 'SALARIED',
                annualIncome: 120000,
                monthlyExpenses: 5000
            })
        });
        const dupData = await dupLoanRes.json();
        if (dupLoanRes.ok) console.error('   ERROR: Duplicate loan should have failed!');
        else console.log(`   Success: Rejected with "${dupData.message}"`);

        // Need new user for income validation failure test since active loan blocks everything
        // 6. Test Income Validation (Loan > 40% Income)
        console.log('6. Testing Income Validation...');
        const email2 = `applicant${timestamp}_2@test.com`;
        const reg2Res = await fetch(`${BASE_URL}/auth/register`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ name: 'Test Applicant 2', email: email2, password, role: 'APPLICANT' })
        });
        const token2 = (await reg2Res.json()).token;

        // Income 100k. Max loan 40k. Request 50k.
        const failIncomeRes = await fetch(`${BASE_URL}/loans/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` },
            body: JSON.stringify({
                amount: 50000,
                tenureMonths: 24,
                employmentType: 'SALARIED',
                annualIncome: 100000,
                monthlyExpenses: 2000
            })
        });
        const failIncomeData = await failIncomeRes.json();
        if (failIncomeRes.ok) console.error('   ERROR: Income validation failed to block loan!');
        else console.log(`   Success: Rejected with "${failIncomeData.message}"`);

    } catch (e) {
        console.error('VERIFICATION FAILED:', e);
    }
}

main();
