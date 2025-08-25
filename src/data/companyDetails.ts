import { companies } from './companies'
import type { BalanceBreakdown, CompanySummary, Retentions, Transaction, Customer } from '../components/Company/CompanyPanel'

function pickCompany(id: string): CompanySummary | undefined {
  const c = companies.find(c => c.id === id)
  if (!c) return undefined
  return { id: c.id, name: c.name, email: c.email, reference: c.reference, lastLoadDate: c.lastLoadDate }
}

function seedBalances(salesBalance: number): BalanceBreakdown {
  // Create a plausible breakdown
  const invoices = Math.max(0, salesBalance * 0.85)
  const creditNotes = -Math.round((salesBalance * 0.02) * 100) / 100
  const openCash = Math.round((salesBalance * 0.1) * 100) / 100
  const notifiedSalesLedgerBalance = Math.round((salesBalance * 0.8) * 100) / 100
  return {
    salesLedgerBalance: Math.round(salesBalance * 100) / 100,
    notifiedSalesLedgerBalance,
    invoices: Math.round(invoices * 100) / 100,
    creditNotes,
    openCash,
  }
}

function seedRetentions(total: number): Retentions {
  // Distribute arbitrary portions
  const ageing = total * 0.25
  const manual = total * 0.1
  const concentration = total * 0.15
  const funding = total * 0.1
  const contra = total * 0.1
  const approved = total - (ageing + manual + concentration + funding + contra)
  return {
    ageing: Math.max(0, Math.round(ageing)),
    manual: Math.max(0, Math.round(manual)),
    concentration: Math.max(0, Math.round(concentration)),
    funding: Math.max(0, Math.round(funding)),
    contra: Math.max(0, Math.round(contra)),
    approved: Math.max(0, Math.round(approved)),
  }
}

function randomDateWithin(daysFromNow: number) {
  const now = Date.now()
  const delta = Math.floor((Math.random() * 2 - 1) * daysFromNow) // +/- days
  const d = new Date(now + delta * 24 * 60 * 60 * 1000)
  return d.toISOString()
}

function seedTransactions(companyId: string, count = 12): Transaction[] {
  const arr: Transaction[] = []
  for (let i = 0; i < count; i++) {
    const open = i % 3 !== 0 // 2/3 open by default
    // randomly decide if this is a credit/payment (negative) or debit/invoice (positive)
    const isNegative = i % 5 === 0 // ~20% negatives for demo
    const baseAmt = Math.round((Math.random() * 5000 + 200) * 100) / 100
    const amt = isNegative ? -baseAmt : baseAmt
    const remaining = open && !isNegative ? Math.round((baseAmt * Math.random()) * 100) / 100 : 0
    // determine type
    let type: Transaction['type']
    if (isNegative) {
      const negTypes: Transaction['type'][] = ['Payment', 'Credit Note', 'Credit Adjustment']
      type = negTypes[i % negTypes.length]
    } else {
      type = i % 7 === 0 ? 'Debit Adjustment' : 'Invoice'
    }
    const notified = i % 2 === 0
    const documentDate = randomDateWithin(90)
    const entryDate = randomDateWithin(90)
    arr.push({
      id: `${companyId}-tx-${i+1}`,
      customerName: `Customer ${i+1}`,
      customerRef: `CUST-${1000 + i}`,
      amount: amt,
      remaining,
      document: `DOC-${companyId}-${2000 + i}`,
      dueDate: randomDateWithin(60),
      status: open ? 'open' : 'closed',
      type,
      notified,
      documentDate,
      entryDate,
    })
  }
  return arr
}

function seedCustomers(companyId: string, count = 8): Customer[] {
  const arr: Customer[] = []
  for (let i = 0; i < count; i++) {
    const outstanding = Math.round((Math.random() * 20000) * 100) / 100
    const notified = i % 2 === 0 // alternate for demo purposes
    arr.push({
      id: `${companyId}-cust-${i+1}`,
      name: `Customer ${i+1}`,
      reference: `CUS-${companyId}-${100 + i}`,
      outstanding,
      address: `${10 + i} High Street, Townsville`,
      notified,
    })
  }
  return arr
}

export function getCompanyDetails(id: string) {
  const comp = companies.find(c => c.id === id)
  const company = pickCompany(id)
  if (!comp || !company) return undefined
  const balances = seedBalances(comp.salesBalanceGBP)
  const retentions = seedRetentions(Math.abs(Math.round(comp.salesBalanceGBP)))
  const transactions = seedTransactions(id)
  const customers = seedCustomers(id)
  return { company, balances, retentions, transactions, customers }
}
