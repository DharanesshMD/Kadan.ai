import { UserInput } from '@/types';

export const getMasterPrompt = (input: UserInput, currentYear: number) => `
You are a student loan financial calculator. Given the following student information, 
perform ALL calculations and return a complete financial analysis.

INPUT DATA:
- Target College: ${input.college}
- Major: ${input.major}
- Student's Current State: ${input.state}
- Student's Current Age: ${input.age}

REQUIRED CALCULATIONS:

1. COLLEGE DATA RESEARCH:
   - Find the state where ${input.college} is located
   - Get current in-state tuition per year
   - Get current out-of-state tuition per year
   - Calculate total 4-year cost

2. DETERMINE APPLICABLE TUITION:
   - If student state matches college state → use in-state tuition
   - Otherwise → use out-of-state tuition
   - Total Loan Amount = 4 years × applicable tuition

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

CRITICAL: Return ONLY valid JSON in this exact format (no markdown, no explanation):

{
  "graduationYear": number,
  "collegeState": "XX",
  "isInState": boolean,
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
  "metadata": {
    "collegeName": "string",
    "major": "string",
    "confidence": "high|medium|low",
    "assumptions": "string describing any assumptions made"
  }
}

Be realistic with all numbers. Use actual current tuition rates and salary data.
`;