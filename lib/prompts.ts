import { UserInput } from '@/types';

export const getMasterPrompt = (input: UserInput, currentYear: number) => `
You are a student loan financial calculator. Given the following student information, 
perform ALL calculations and return a complete financial analysis.

INPUT DATA:
- Target College: ${input.college}
- Major: ${input.major}
- Student's Current State: ${input.state}
- Student's Current Age: ${input.age}
- In-State Student: ${input.isInStateStudent ? 'YES' : 'NO'}

REQUIRED CALCULATIONS:

1. COLLEGE DATA RESEARCH:
   - Find the state where ${input.college} is located
   - Get current in-state tuition per year
   - Get current out-of-state tuition per year
   - Calculate total 4-year cost

2. DETERMINE APPLICABLE TUITION:
   - User indicated: In-State Student = ${input.isInStateStudent ? 'YES' : 'NO'}
   - If YES → use in-state tuition rate
   - If NO → use out-of-state tuition rate
   - Total Loan Amount = 4 years × applicable tuition rate
   - Note: Out-of-state tuition is typically 2-3x higher than in-state

3. GRADUATION YEAR:
   - Assume student starts college at age 18
   - Calculate: Current Year(${currentYear}) + (22 - current age) = Graduation Year

4. SALARY RESEARCH:
   - Find average starting salary for ${input.major} graduates
   - In the state where ${input.college} is located
   - Projected for year ${currentYear + (22 - input.age)}

5. TAX CALCULATIONS (for the college's state):
   - Federal tax rate (use 0.22 for simplicity)
   - State income tax rate (as a decimal)
   - FICA tax rate (use 0.0765)
   - Calculate monthly take-home pay

6. LOAN CALCULATIONS:
   - Use 5.5% annual interest rate (federal average)
   - Standard 10-year repayment plan
   - Calculate monthly payment using amortization formula
   - Calculate total amount paid over loan term
   - Calculate total interest paid
   - Calculate age when loan is paid off

7. INCOME-DRIVEN REPAYMENT (IDR) CALCULATIONS:
   - Use REPAYE plan (Revised Pay As You Earn) as the IDR example
   - Base monthly payment on 10% of discretionary income
   - Discretionary Income = (Annual Salary) - (150% of Federal Poverty Line for family of 2, approximately $24,000)
   - If discretionary income is negative, payment = $0 for that period
   - Calculate monthly IDR payment based on: 10% × discretionary income / 12
   - Use same 5.5% interest rate
   - IDR plans typically have 20-25 year forgiveness period (use 25 years for REPAYE)
   - Calculate total paid over 25 years with potential balance forgiveness
   - Calculate payoff age

CRITICAL: Return ONLY valid JSON in this exact format (no markdown, no explanation):

{
  "graduationYear": number,
  "collegeState": "XX",
  "isInState": ${input.isInStateStudent ? 'true' : 'false'},
  "tuitionPerYear": number,
  "totalLoanAmount": number,
  "averageSalary": number,
  "takeHomeMonthly": number,
  "monthlyLoanPayment": number,
  "totalAmountPaid": number,
  "totalInterestPaid": number,
  "payoffAge": number,
  "loanTermYears": number,
  "taxBreakdown": {
    "federal": number,
    "state": number,
    "fica": number
  },
  "idrPlan": {
    "planName": "REPAYE",
    "monthlyPayment": number,
    "totalAmountPaid": number,
    "totalInterestPaid": number,
    "payoffYears": number,
    "payoffAge": number,
    "forgivenessPeriod": 25,
    "balanceAtForgiveness": number
  },
  "metadata": {
    "collegeName": "string",
    "major": "string",
    "confidence": "high|medium|low",
    "assumptions": "string describing any assumptions made"
  }
}

Be realistic with all numbers. Use actual current tuition rates and salary data.
Ensure tuition reflects in-state (${input.isInStateStudent ? 'lower' : 'higher'}) rates as indicated by user selection.
`;