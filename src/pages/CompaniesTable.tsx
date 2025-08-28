
import { Card, CardBody, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Icon, Input, InputGroup, InputLeftElement, HStack, Box, Text, Flex, useDisclosure, Button, Link, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useClipboard, Stack, Checkbox, Select, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Badge, Divider, useToast, Tooltip } from '@chakra-ui/react'
import { TriangleDownIcon, TriangleUpIcon, SearchIcon, AddIcon, DownloadIcon } from '@chakra-ui/icons'
import ExportButton from '../components/Common/ExportButton'
import { useMemo, useState } from 'react'
import TablesTableRow, { CompanyRow } from '../components/Tables/TablesTableRow'
import { companies as seedCompanies } from '../data/companies'
import CompanyPanel from '../components/Company/CompanyPanel'
import { getCompanyDetails } from '../data/companyDetails'
import CreateCompanyDialog, { CreateCompanyPayload } from '../components/Company/CreateCompanyDialog'
import EditCompanyDialog, { CompanyConfig } from '../components/Company/EditCompanyDialog'

type SortKey = keyof Pick<CompanyRow,'name'|'reference'|'lastLoadDate'|'salesBalanceGBP'|'notifiedSalesBalanceGBP'|'purchaseBalanceGBP'|'status'>

function sortData(data: CompanyRow[], sortKey: SortKey, direction: 'asc' | 'desc') {
  const sorted = [...data].sort((a, b) => {
    let av: any = a[sortKey]
    let bv: any = b[sortKey]
    if (sortKey === 'lastLoadDate') {
      av = new Date(a.lastLoadDate).getTime()
      bv = new Date(b.lastLoadDate).getTime()
    }
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    if (av < bv) return direction === 'asc' ? -1 : 1
    if (av > bv) return direction === 'asc' ? 1 : -1
    return 0
  })
  return sorted
}

export default function CompaniesTable() {
  const toast = useToast()
  const [data, setData] = useState<CompanyRow[]>(
    (seedCompanies as unknown as any[]).map(company => ({
      ...company,
      notifiedSalesBalanceGBP: Math.round((company.salesBalanceGBP * 0.95) * 100) / 100
    }))
  )
  const [sortKey, setSortKey] = useState<SortKey>('lastLoadDate')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')
  const [localSearch, setLocalSearch] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const details = useMemo(() => selectedId ? getCompanyDetails(selectedId) : undefined, [selectedId])

  // Create company dialog controls
  const createDialog = useDisclosure()
  const registrationDialog = useDisclosure()
  const [registrationUrl, setRegistrationUrl] = useState<string | null>(null)
  const { hasCopied, onCopy } = useClipboard(registrationUrl || '')

  const searchTerm = localSearch.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!searchTerm) return data
    return data.filter(d => 
      d.name.toLowerCase().includes(searchTerm) ||
      d.reference.toLowerCase().includes(searchTerm)
    )
  }, [data, searchTerm])

  const sorted = useMemo(() => sortData(filtered, sortKey, sortDir), [filtered, sortKey, sortDir])

  // Company config map for Exports/Reports/Pools
  const [configMap, setConfigMap] = useState<Record<string, CompanyConfig>>({})
  const editDialog = useDisclosure()
  const [editTarget, setEditTarget] = useState<{ id: string; name: string; email: string } | null>(null)

  // Hover tooltip computation (deterministic, derived from row data)
  function toGBP(n: number) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n)
  }
  function addDays(dateISO: string, delta: number) {
    const d = new Date(dateISO)
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0,10)
    d.setDate(d.getDate() + delta)
    return d.toISOString().slice(0,10)
  }
  function seededVal(idNum: number, base: number, spread: number) {
    // simple deterministic pseudo-random-ish by id
    const t = (idNum * 9301 + 49297) % 233280
    const frac = t / 233280
    return Math.round((base + (frac - 0.5) * spread) * 100) / 100
  }
  function buildHoverTitle(row: CompanyRow): string {
    const idNum = Number(row.id) || 1
    const totalCustomers = 8 + (idNum % 6)
    const totalSuppliers = 5 + (idNum % 5)
    const totalActiveCustomers = Math.max(0, totalCustomers - (idNum % 3))

    // previous balances ~ -5% from current
    const prevSales = Math.max(0, Math.round(row.salesBalanceGBP * 0.95 * 100) / 100)
    const prevPurchase = Math.max(0, Math.round(row.purchaseBalanceGBP * 0.95 * 100) / 100)
    const prevLoad = addDays(row.lastLoadDate, -7)

    // derive invoice/open/credit/cash figures
    const openInvoicesAmount = Math.max(0, Math.round(row.salesBalanceGBP * 0.85 * 100) / 100)
    const openInvoicesCount = Math.max(1, Math.min(999, Math.round(openInvoicesAmount / 1200)))
    const creditNoteAmount = -Math.round(row.salesBalanceGBP * 0.02 * 100) / 100
    const creditNoteCount = Math.max(1, Math.round(totalCustomers * 0.1))
    const unallocatedCash = Math.round(row.salesBalanceGBP * 0.1 * 100) / 100

    // dates within ~ last 30 days from lastLoadDate
    const lastInvoiceDate = addDays(row.lastLoadDate, -((idNum % 15) + 1))
    const lastPaymentDate = addDays(row.lastLoadDate, -((idNum % 20) + 2))

    const lines = [
      `Total Customers: ${totalCustomers}`,
      `Total Suppliers: ${totalSuppliers}`,
      `Total Active Customers: ${totalActiveCustomers}`,
      `Previous Sales Ledger Balance: ${toGBP(prevSales)}`,
      `Previous Purchase Ledger Balance: ${toGBP(prevPurchase)}`,
      `Previous Load date: ${new Date(prevLoad).toLocaleDateString('en-GB')}`,
      `Total open invoices count: ${openInvoicesCount}`,
      `Total open invoices amount: ${toGBP(openInvoicesAmount)}`,
      `Total credit note amount: ${toGBP(creditNoteAmount)}`,
      `Total credit note count: ${creditNoteCount}`,
      `Total unallocated cash: ${toGBP(unallocatedCash)}`,
      `Last new invoice date: ${new Date(lastInvoiceDate).toLocaleDateString('en-GB')}`,
      `Last payment date: ${new Date(lastPaymentDate).toLocaleDateString('en-GB')}`,
    ]
    return lines.join('\n')
  }

  // Determine connector for cloud companies (deterministic by id)
  function getConnector(row: CompanyRow): 'native' | 'codat' | 'validis' {
    const idx = Number(row.id) % 3
    return idx === 0 ? 'native' : idx === 1 ? 'codat' : 'validis'
  }

  // Determine funding type for display (deterministic for demo)
  function getFunding(row: CompanyRow): 'Not funded' | 'Company' | 'Pool' {
    // Example rule: if both balances are zero => Not funded; otherwise alternate by id
    if ((row.salesBalanceGBP || 0) === 0 && (row.purchaseBalanceGBP || 0) === 0) return 'Not funded'
    const idx = Number(row.id) % 3
    if (idx === 0) return 'Company'
    if (idx === 1) return 'Pool'
    return 'Not funded'
  }

  // Determine if there has been a balance change during the last load
  function hasBalanceChanged(row: CompanyRow): boolean {
    // Make specific companies not show balance changes (IDs 3, 7, and 12)
    if (['3', '7', '12'].includes(row.id)) return false

    // If both balances are zero, there's no change
    if ((row.salesBalanceGBP || 0) === 0 && (row.purchaseBalanceGBP || 0) === 0) return false

    // For demo purposes, we'll use the logic from buildHoverTitle
    // where previous balances are calculated as 5% less than current
    const prevSales = Math.max(0, Math.round(row.salesBalanceGBP * 0.95 * 100) / 100)
    const prevPurchase = Math.max(0, Math.round(row.purchaseBalanceGBP * 0.95 * 100) / 100)

    // If current balances are different from previous balances, there's a change
    return prevSales !== row.salesBalanceGBP || prevPurchase !== row.purchaseBalanceGBP
  }

  // Compute load status for display
  function getLoadStatus(row: CompanyRow): 'loaded' | 'requested' | 'queued' | 'no load' {
    // If there is an override in the map (e.g., a refresh was requested), prefer it.
    if (loadStatusMap[row.id] === 'requested') return 'requested'
    // Minimal rule: if both balances are zero, it's a fresh company => no load; otherwise loaded.
    if ((row.salesBalanceGBP || 0) === 0 && (row.purchaseBalanceGBP || 0) === 0) return 'no load'
    return 'loaded'
  }

  // Refresh modal state
  const [refreshTarget, setRefreshTarget] = useState<{ id: string; name: string; connector: 'native' | 'codat' | 'validis' } | null>(null)
  const [sourceRefresh, setSourceRefresh] = useState(true)
  // Per-company load status overrides
  const [loadStatusMap, setLoadStatusMap] = useState<Record<string, 'requested' | 'queued'>>({})

  // Clear/Delete modal state
  const [clearTarget, setClearTarget] = useState<{ id: string; name: string; reference: string; lastLoadDate: string } | null>(null)
  const [isDelete, setIsDelete] = useState(false)
  const [snapshotDates, setSnapshotDates] = useState<string[]>([])
  const [selectedSnapshot, setSelectedSnapshot] = useState<string>('')
  const [confirmRefText, setConfirmRefText] = useState('')

  // Snapshot Drawer state
  type Snapshot = {
    loadDate: string
    salesBalance: number
    previousBalance: number
    newItemCount: number
    newInvoiceTotal: number
    newCreditTotal: number
    newPaymentTotal: number
    // additional fields for snapshot details
    invoiceTotal: number
    debitAdjTotal: number
    paymentTotal: number
    creditNoteTotal: number
    creditAdjTotal: number
    newItemAmount: number
    changedItemAmount: number
    closedItemAmount: number
    deletedItemAmount: number
  }
  const [snapshotTarget, setSnapshotTarget] = useState<{ id: string; name: string } | null>(null)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [series, setSeries] = useState<{ months: string[]; sales: number[]; purchase: number[] }>({ months: [], sales: [], purchase: [] })
  // Snapshot table filter/sort state
  const [snapFromDate, setSnapFromDate] = useState<string>('')
  const [snapToDate, setSnapToDate] = useState<string>('')
  type SnapSortKey = keyof Pick<Snapshot, 'loadDate' | 'salesBalance' | 'previousBalance' | 'newItemCount' | 'newInvoiceTotal' | 'newCreditTotal' | 'newPaymentTotal'>
  const [snapSortKey, setSnapSortKey] = useState<SnapSortKey>('loadDate')
  const [snapSortDir, setSnapSortDir] = useState<'asc' | 'desc'>('desc')

  function handleRefreshClick(id: string) {
    const row = data.find(d => d.id === id)
    if (!row || row.status !== 'cloud') return
    const connector = getConnector(row)
    setSourceRefresh(true)
    setRefreshTarget({ id, name: row.name, connector })
  }

  function confirmRefresh() {
    if (!refreshTarget) return
    // Mark status as requested and show a confirmation message
    setLoadStatusMap(prev => ({ ...prev, [refreshTarget.id]: 'requested' }))
    toast({
      title: 'Refresh requested',
      description: `A request to refresh data for ${refreshTarget.name} has been made.`,
      status: 'info',
      duration: 4000,
      isClosable: true,
    })
    setRefreshTarget(null)
  }

  function makeSnapshotDates(baseISO: string): string[] {
    // Create a small list of plausible snapshot dates: base date and 5 weekly intervals prior
    const dates: string[] = []
    const base = new Date(baseISO)
    if (isNaN(base.getTime())) {
      const today = new Date()
      baseISO = today.toISOString().slice(0, 10)
    }
    const start = new Date(baseISO)
    for (let i = 0; i < 6; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() - i * 7)
      dates.push(d.toISOString().slice(0, 10))
    }
    // Ensure uniqueness and sorted desc (latest first)
    return Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a))
  }

  function handleClearClick(id: string) {
    const row = data.find(d => d.id === id)
    if (!row) return
    const snaps = makeSnapshotDates(row.lastLoadDate)
    setSnapshotDates(snaps)
    setSelectedSnapshot(snaps[0] || row.lastLoadDate)
    setIsDelete(false)
    setConfirmRefText('')
    setClearTarget({ id: row.id, name: row.name, reference: row.reference, lastLoadDate: row.lastLoadDate })
  }

  function confirmClearOrDelete() {
    if (!clearTarget) return
    if (isDelete) {
      setData(prev => prev.filter(p => p.id !== clearTarget.id))
    } else {
      const snap = selectedSnapshot || clearTarget.lastLoadDate
      setData(prev => prev.map(r => r.id === clearTarget.id ? { ...r, lastLoadDate: snap, salesBalanceGBP: 0, notifiedSalesBalanceGBP: 0, purchaseBalanceGBP: 0 } : r))
    }
    setClearTarget(null)
  }

  // Seed 12-month series based on current balances
  function makeMonthlySeries(row: CompanyRow) {
    const months: string[] = []
    const sales: number[] = []
    const purchase: number[] = []
    const now = new Date()
    const baseSales = row.salesBalanceGBP
    const basePurch = row.purchaseBalanceGBP
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now)
      d.setMonth(d.getMonth() - i)
      months.push(d.toLocaleDateString('en-GB', { month: 'short' }))
      const sal = Math.max(0, Math.round((baseSales * (0.8 + (i % 5) * 0.02)) * 100) / 100)
      const pur = Math.max(0, Math.round((basePurch * (0.85 + (i % 4) * 0.02)) * 100) / 100)
      sales.push(sal)
      purchase.push(pur)
    }
    return { months, sales, purchase }
  }

  // Seed recent snapshots (weekly) with deltas
  function makeSnapshots(row: CompanyRow): Snapshot[] {
    const items: Snapshot[] = []
    const baseDate = new Date(row.lastLoadDate)
    let prev = Math.max(0, Math.round(row.salesBalanceGBP * 0.9 * 100) / 100)
    for (let i = 0; i < 8; i++) {
      const d = new Date(baseDate)
      d.setDate(d.getDate() - i * 7)
      const salesBal = Math.max(0, Math.round((prev * (1 + ((i % 3) - 1) * 0.03)) * 100) / 100)
      // derive demo totals
      const delta = salesBal - prev
      const absDelta = Math.abs(delta)
      const newInvoices = Math.round(delta * 0.6)
      const newCredits = Math.round(absDelta * 0.2)
      const newPayments = Math.round(absDelta * 0.3)
      const newItems = Math.max(1, Math.floor(absDelta / 1000))
      // transaction type totals (amounts)
      const invoiceTotal = Math.max(0, Math.round(salesBal * 0.85))
      const debitAdjTotal = Math.round(salesBal * 0.02)
      const paymentTotal = -Math.round(salesBal * 0.15)
      const creditNoteTotal = -Math.round(salesBal * 0.05)
      const creditAdjTotal = -Math.round(salesBal * 0.01)
      // lifecycle buckets (amounts)
      const newItemAmount = Math.round(absDelta * 0.6)
      const changedItemAmount = Math.round(absDelta * 0.25)
      const closedItemAmount = Math.round(absDelta * 0.1)
      const deletedItemAmount = Math.round(absDelta * 0.05)
      items.push({
        loadDate: d.toISOString(),
        salesBalance: salesBal,
        previousBalance: prev,
        newItemCount: newItems,
        newInvoiceTotal: newInvoices,
        newCreditTotal: newCredits,
        newPaymentTotal: newPayments,
        invoiceTotal,
        debitAdjTotal,
        paymentTotal,
        creditNoteTotal,
        creditAdjTotal,
        newItemAmount,
        changedItemAmount,
        closedItemAmount,
        deletedItemAmount,
      })
      prev = salesBal
    }
    // Sort descending by date
    return items.sort((a, b) => b.loadDate.localeCompare(a.loadDate))
  }

  // Build demo XML content for the Extract File view
  function buildExtractXML(s: Snapshot, companyName: string): string {
    const loaded = new Date(s.loadDate)
    const received = new Date(loaded.getTime() - 3 * 60 * 60 * 1000)
    const rx = received.toISOString()
    const lx = loaded.toISOString()
    const customers = Array.from({ length: 5 }).map((_, i) =>
      `    <customer id="CUST-${1000 + i}" name="Customer ${i + 1}" outstanding="${(Math.random()*20000).toFixed(2)}" />`
    ).join('\n')
    const suppliers = Array.from({ length: 3 }).map((_, i) =>
      `    <supplier id="SUP-${2000 + i}" name="Supplier ${i + 1}" outstanding="${(Math.random()*15000).toFixed(2)}" />`
    ).join('\n')
    const transactions = Array.from({ length: 8 }).map((_, i) => {
      const isCredit = i % 4 === 0
      const amt = (isCredit ? -1 : 1) * (Math.random()*5000 + 100)
      const type = isCredit ? 'Credit' : 'Invoice'
      return `    <transaction document="DOC-${3000 + i}" type="${type}" amount="${amt.toFixed(2)}" />`
    }).join('\n')
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<extract company="${companyName}">`,
      `  <meta dateReceived="${rx}" dateLoaded="${lx}" />`,
      '  <customers>',
      customers,
      '  </customers>',
      '  <suppliers>',
      suppliers,
      '  </suppliers>',
      '  <transactions>',
      transactions,
      '  </transactions>',
      '</extract>'
    ].join('\n')
  }

  // Seed snapshot exports list for Exports modal
  function makeSnapshotExports(s: Snapshot) {
    const produced = new Date(s.loadDate)
    function minusMinutes(d: Date, m: number) { const x = new Date(d); x.setMinutes(d.getMinutes()-m); return x }
    const candidates = ['Movements', 'Debtors', 'Debtors Pool', 'Movements Pool']
    return candidates.map((name, idx) => {
      const producedAt = new Date(produced.getTime() - idx * 2 * 60 * 1000)
      const startedAt = minusMinutes(producedAt, 5)
      const status = idx === 3 ? 'failure' as const : 'success' as const
      const folder = `/exports/${name.toLowerCase().replace(/\s+/g,'-')}/${producedAt.toISOString().slice(0,10)}`
      const apiEndpoint = `/api/exports/${name.toLowerCase().replace(/\s+/g,'-')}`
      const fileName = `${name.replace(/\s+/g,'_')}_${producedAt.toISOString().slice(0,10)}.csv`
      const fileContent = status === 'success' ? buildCsvForExport(name) : undefined
      return { name, startedAt: startedAt.toISOString(), producedAt: producedAt.toISOString(), folder, apiEndpoint, status, fileName, fileContent }
    })
  }

  function buildCsvForExport(name: string): string {
    if (name.includes('Debtors')) {
      const header = 'CustomerRef,CustomerName,Outstanding' 
      const rows = Array.from({ length: 5 }).map((_, i) => `CUST${100+i},Customer ${i+1},${(Math.random()*20000).toFixed(2)}`)
      return [header, ...rows].join('\n')
    }
    // Movements
    const header = 'Document,Type,Amount,Remaining'
    const rows = Array.from({ length: 6 }).map((_, i) => {
      const isCredit = i % 3 === 0
      const type = isCredit ? 'Credit' : 'Invoice'
      const amt = (isCredit ? -1 : 1) * (Math.random()*4000+100)
      const rem = Math.max(0, amt * (Math.random()*0.5))
      return `DOC${3000+i},${type},${amt.toFixed(2)},${rem.toFixed(2)}`
    })
    return [header, ...rows].join('\n')
  }

  function handleSnapshotClick(id: string) {
    const row = data.find(d => d.id === id)
    if (!row) return
    setSnapshotTarget({ id, name: row.name })
    const snaps = makeSnapshots(row)
    setSnapshots(snaps)
    setSeries(makeMonthlySeries(row))
    // Initialize default date window to last 90 days based on latest snapshot
    if (snaps.length) {
      const latest = new Date(snaps[0].loadDate)
      const from = new Date(latest)
      from.setDate(from.getDate() - 90)
      setSnapFromDate(from.toISOString().slice(0,10))
      setSnapToDate(latest.toISOString().slice(0,10))
    } else {
      setSnapFromDate('')
      setSnapToDate('')
    }
  }

  function onSnapSortClick(key: SnapSortKey) {
    if (key === snapSortKey) setSnapSortDir(snapSortDir === 'asc' ? 'desc' : 'asc')
    else { setSnapSortKey(key); setSnapSortDir('asc') }
  }

  const filteredSnapshots = useMemo(() => {
    const from = snapFromDate ? new Date(snapFromDate) : null
    const to = snapToDate ? new Date(snapToDate) : null
    return snapshots.filter(s => {
      const d = new Date(s.loadDate)
      if (from && d < from) return false
      if (to) {
        // include the whole day for 'to'
        const end = new Date(to)
        end.setHours(23,59,59,999)
        if (d > end) return false
      }
      return true
    })
  }, [snapshots, snapFromDate, snapToDate])

  const sortedFilteredSnapshots = useMemo(() => {
    const arr = [...filteredSnapshots]
    arr.sort((a, b) => {
      let av: any = a[snapSortKey]
      let bv: any = b[snapSortKey]
      if (snapSortKey === 'loadDate') {
        av = new Date(a.loadDate).getTime()
        bv = new Date(b.loadDate).getTime()
      }
      if (av < bv) return snapSortDir === 'asc' ? -1 : 1
      if (av > bv) return snapSortDir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [filteredSnapshots, snapSortKey, snapSortDir])

  // Snapshot details modal
  const [selectedSnapshotDetail, setSelectedSnapshotDetail] = useState<Snapshot | null>(null)
  function openSnapshotDetail(s: Snapshot) {
    setSelectedSnapshotDetail(s)
  }
  function closeSnapshotDetail() {
    setSelectedSnapshotDetail(null)
  }

  // Transactions modal state and functions
  type SnapshotTransaction = {
    id: string
    customerName: string
    customerRef: string
    amount: number
    remaining: number
    document: string
    dueDate: string // ISO
    status: 'open'
    notified: boolean
    type: 'Invoice' | 'Debit Adjustment' | 'Payment' | 'Credit Note' | 'Credit Adjustment'
    documentDate: string // ISO
    entryDate: string // ISO
    changeStatus?: 'NEW' | 'CHANGED' | 'CLOSED'
    accountType?: 'sales' | 'purchase'
  }
  const [transactionsSnapshot, setTransactionsSnapshot] = useState<Snapshot | null>(null)
  const [snapshotTransactions, setSnapshotTransactions] = useState<SnapshotTransaction[]>([])

  // Change transactions modal state
  const [changeTransactionsOpen, setChangeTransactionsOpen] = useState(false)
  const [changeTransactions, setChangeTransactions] = useState<SnapshotTransaction[]>([])

  function generateTransactionsForSnapshot(s: Snapshot): SnapshotTransaction[] {
    // Generate demo transactions based on the snapshot's newItemCount
    const transactions: SnapshotTransaction[] = []
    const loadDate = new Date(s.loadDate)

    // For change transactions, we'll determine account type and change status

    // Determine the distribution of transaction types based on snapshot data
    const totalNewItems = s.newItemCount
    const invoiceCount = Math.max(1, Math.round(totalNewItems * 0.6)) // 60% invoices
    const creditCount = Math.max(0, Math.round(totalNewItems * 0.2)) // 20% credit notes
    const paymentCount = Math.max(0, Math.round(totalNewItems * 0.1)) // 10% payments
    const debitAdjCount = Math.max(0, Math.round(totalNewItems * 0.05)) // 5% debit adjustments
    const creditAdjCount = Math.max(0, Math.round(totalNewItems * 0.05)) // 5% credit adjustments

    // Generate invoices
    for (let i = 0; i < invoiceCount; i++) {
      const amount = Math.round((s.newInvoiceTotal / invoiceCount) * (0.8 + Math.random() * 0.4))
      const dueDate = new Date(loadDate)
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 15) // Due in 15-45 days
      const documentDate = new Date(loadDate)
      documentDate.setDate(documentDate.getDate() - Math.floor(Math.random() * 5)) // Document date 0-5 days before load

      transactions.push({
        id: `TX-INV-${i + 1}`,
        customerName: `Customer ${i + 1}`,
        customerRef: `CUST-${1000 + i}`,
        amount,
        remaining: amount,
        document: `INV-${10000 + i}`,
        dueDate: dueDate.toISOString(),
        status: 'open',
        notified: Math.random() > 0.3, // 70% are notified
        type: 'Invoice',
        documentDate: documentDate.toISOString(),
        entryDate: loadDate.toISOString(),
        changeStatus: Math.random() > 0.7 ? 'NEW' : Math.random() > 0.5 ? 'CHANGED' : 'CLOSED',
        accountType: 'sales'
      })
    }

    // Generate credit notes
    for (let i = 0; i < creditCount; i++) {
      const amount = -Math.round((s.newCreditTotal / creditCount) * (0.8 + Math.random() * 0.4))
      const dueDate = new Date(loadDate)
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30)) // Due in 0-30 days
      const documentDate = new Date(loadDate)
      documentDate.setDate(documentDate.getDate() - Math.floor(Math.random() * 5)) // Document date 0-5 days before load

      transactions.push({
        id: `TX-CN-${i + 1}`,
        customerName: `Customer ${Math.floor(Math.random() * invoiceCount) + 1}`, // Link to an existing customer
        customerRef: `CUST-${1000 + Math.floor(Math.random() * invoiceCount)}`,
        amount,
        remaining: amount,
        document: `CN-${20000 + i}`,
        dueDate: dueDate.toISOString(),
        status: 'open',
        notified: Math.random() > 0.3, // 70% are notified
        type: 'Credit Note',
        documentDate: documentDate.toISOString(),
        entryDate: loadDate.toISOString(),
        changeStatus: Math.random() > 0.7 ? 'NEW' : Math.random() > 0.5 ? 'CHANGED' : 'CLOSED',
        accountType: 'sales'
      })
    }

    // Generate payments
    for (let i = 0; i < paymentCount; i++) {
      const amount = -Math.round((s.newPaymentTotal / paymentCount) * (0.8 + Math.random() * 0.4))
      const documentDate = new Date(loadDate)
      documentDate.setDate(documentDate.getDate() - Math.floor(Math.random() * 5)) // Document date 0-5 days before load

      transactions.push({
        id: `TX-PAY-${i + 1}`,
        customerName: `Customer ${Math.floor(Math.random() * invoiceCount) + 1}`, // Link to an existing customer
        customerRef: `CUST-${1000 + Math.floor(Math.random() * invoiceCount)}`,
        amount,
        remaining: amount,
        document: `PAY-${30000 + i}`,
        dueDate: loadDate.toISOString(), // Due immediately
        status: 'open',
        notified: Math.random() > 0.3, // 70% are notified
        type: 'Payment',
        documentDate: documentDate.toISOString(),
        entryDate: loadDate.toISOString(),
        changeStatus: Math.random() > 0.7 ? 'NEW' : Math.random() > 0.5 ? 'CHANGED' : 'CLOSED',
        accountType: Math.random() > 0.5 ? 'sales' : 'purchase'
      })
    }

    // Generate debit adjustments
    for (let i = 0; i < debitAdjCount; i++) {
      const amount = Math.round(1000 * (0.8 + Math.random() * 0.4))
      const dueDate = new Date(loadDate)
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 15) // Due in 15-45 days
      const documentDate = new Date(loadDate)
      documentDate.setDate(documentDate.getDate() - Math.floor(Math.random() * 5)) // Document date 0-5 days before load

      transactions.push({
        id: `TX-DA-${i + 1}`,
        customerName: `Customer ${Math.floor(Math.random() * invoiceCount) + 1}`, // Link to an existing customer
        customerRef: `CUST-${1000 + Math.floor(Math.random() * invoiceCount)}`,
        amount,
        remaining: amount,
        document: `DA-${40000 + i}`,
        dueDate: dueDate.toISOString(),
        status: 'open',
        notified: Math.random() > 0.3, // 70% are notified
        type: 'Debit Adjustment',
        documentDate: documentDate.toISOString(),
        entryDate: loadDate.toISOString(),
        changeStatus: Math.random() > 0.7 ? 'NEW' : Math.random() > 0.5 ? 'CHANGED' : 'CLOSED',
        accountType: 'sales'
      })
    }

    // Generate credit adjustments
    for (let i = 0; i < creditAdjCount; i++) {
      const amount = -Math.round(500 * (0.8 + Math.random() * 0.4))
      const dueDate = new Date(loadDate)
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30)) // Due in 0-30 days
      const documentDate = new Date(loadDate)
      documentDate.setDate(documentDate.getDate() - Math.floor(Math.random() * 5)) // Document date 0-5 days before load

      transactions.push({
        id: `TX-CA-${i + 1}`,
        customerName: `Customer ${Math.floor(Math.random() * invoiceCount) + 1}`, // Link to an existing customer
        customerRef: `CUST-${1000 + Math.floor(Math.random() * invoiceCount)}`,
        amount,
        remaining: amount,
        document: `CA-${50000 + i}`,
        dueDate: dueDate.toISOString(),
        status: 'open',
        notified: Math.random() > 0.3, // 70% are notified
        type: 'Credit Adjustment',
        documentDate: documentDate.toISOString(),
        entryDate: loadDate.toISOString(),
        changeStatus: Math.random() > 0.7 ? 'NEW' : Math.random() > 0.5 ? 'CHANGED' : 'CLOSED',
        accountType: 'sales'
      })
    }

    return transactions
  }

  function openTransactionsModal(s: Snapshot) {
    if (s.newItemCount > 0) {
      setTransactionsSnapshot(s)
      setSnapshotTransactions(generateTransactionsForSnapshot(s))
    }
  }

  function closeTransactionsModal() {
    setTransactionsSnapshot(null)
    setSnapshotTransactions([])
  }

  // Function to handle the change click event
  function handleChangeClick(id: string) {
    const row = data.find(d => d.id === id)
    if (!row || !hasBalanceChanged(row)) return

    // Get the latest snapshot for this company
    const snaps = makeSnapshots(row)
    if (snaps.length === 0) return

    const latestSnapshot = snaps[0]

    // Generate transactions for this snapshot
    const transactions = generateTransactionsForSnapshot(latestSnapshot)

    // Set the transactions and open the modal
    setChangeTransactions(transactions)
    setChangeTransactionsOpen(true)
  }

  // Function to handle the funding click event
  function handleFundingClick(id: string) {
    const row = data.find(d => d.id === id)
    if (!row) return

    const funding = getFunding(row)
    if (funding !== 'Pool' && funding !== 'Company') return

    // Get the latest snapshot for this company
    const snaps = makeSnapshots(row)
    if (snaps.length === 0) return

    const latestSnapshot = snaps[0]

    // Set the snapshot target for the exports modal
    setSnapshotTarget({ id, name: row.name })

    // Open the exports modal for the latest snapshot
    openExportsModal(latestSnapshot)
  }

  // Function to close the change transactions modal
  function closeChangeTransactionsModal() {
    setChangeTransactionsOpen(false)
    setChangeTransactions([])
  }

  // Function to handle transaction row click in the change transactions modal
  function handleTransactionRowClick(tx: SnapshotTransaction) {
    // Create a mock snapshot with minimal required data
    const mockSnapshot: Snapshot = {
      loadDate: tx.entryDate,
      salesBalance: 0,
      previousBalance: 0,
      newItemCount: 1,
      newInvoiceTotal: 0,
      newCreditTotal: 0,
      newPaymentTotal: 0,
      invoiceTotal: 0,
      debitAdjTotal: 0,
      paymentTotal: 0,
      creditNoteTotal: 0,
      creditAdjTotal: 0,
      newItemAmount: 0,
      changedItemAmount: 0,
      closedItemAmount: 0,
      deletedItemAmount: 0
    }

    // Set the transactions snapshot and transactions
    setTransactionsSnapshot(mockSnapshot)
    setSnapshotTransactions([tx])

    // Close the change transactions modal
    closeChangeTransactionsModal()
  }

  // Extract modal state and helpers
  const [extractSnapshot, setExtractSnapshot] = useState<Snapshot | null>(null)
  const [extractXML, setExtractXML] = useState<string>('')
  function openExtractModal(s: Snapshot) {
    setExtractSnapshot(s)
    setExtractXML(buildExtractXML(s, snapshotTarget?.name || 'Company'))
  }
  function closeExtractModal() {
    setExtractSnapshot(null)
    setExtractXML('')
  }

  // Exports modal state and helpers
  type SnapshotExport = { name: string; startedAt: string; producedAt: string; folder: string; apiEndpoint: string; status: 'success' | 'failure'; fileName: string; fileContent?: string }
  const [exportsSnapshot, setExportsSnapshot] = useState<Snapshot | null>(null)
  const [exportsList, setExportsList] = useState<SnapshotExport[]>([])
  function openExportsModal(s: Snapshot) {
    setExportsSnapshot(s)
    setExportsList(makeSnapshotExports(s))
  }
  function closeExportsModal() {
    setExportsSnapshot(null)
    setExportsList([])
  }

  // Export file viewer
  const [viewFile, setViewFile] = useState<{ name: string; content: string } | null>(null)
  function openViewFile(name: string, content?: string) {
    if (!content) return
    setViewFile({ name, content })
  }
  function closeViewFile() {
    setViewFile(null)
  }

  function onSortClick(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function handleCreateSubmit(payload: CreateCompanyPayload) {
    const nextId = String(
      Math.max(0, ...data.map(d => Number(d.id) || 0)) + 1
    )
    const todayISO = new Date().toISOString().slice(0, 10)
    const newRow: CompanyRow = {
      id: nextId,
      name: payload.name,
      email: payload.email,
      reference: payload.reference,
      lastLoadDate: todayISO,
      salesBalanceGBP: 0,
      notifiedSalesBalanceGBP: 0,
      purchaseBalanceGBP: 0,
      status: 'cloud',
    }
    setData(prev => [...prev, newRow])

    if (payload.createRegistration) {
      const url = `https://onboarding.openaccounting.example/register/${nextId}?currency=${payload.currencyCode}` + (payload.externalReference ? `&ext=${encodeURIComponent(payload.externalReference)}` : '')
      setRegistrationUrl(url)
      registrationDialog.onOpen()
    }
  }

  function SortHeader({ label, k }: { label: string, k: SortKey }) {
    const active = k === sortKey
    const dir = active ? sortDir : undefined
    return (
      <Th cursor="pointer" onClick={() => onSortClick(k)} userSelect="none">
        <HStack spacing={1}>
          <Box>{label}</Box>
          {active && (dir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
        </HStack>
      </Th>
    )
  }

  return (
    <>
    <Card>
      <CardBody>
        <Flex align="center" mb={4} gap={4}>
          <Box flex="1">
            <Text fontWeight="semibold">Companies ({sorted.length})</Text>
            <Button 
              size="sm" 
              variant="ghost" 
              colorScheme="gray" 
              onClick={createDialog.onOpen} 
              leftIcon={<AddIcon />} 
              mt={2}
            >
              Create new company
            </Button>
          </Box>
          <Box flex="2" textAlign="right">
            <HStack spacing={4} justifyContent="flex-end">
              <ExportButton 
                data={sorted}
                filename="companies.csv"
                headers={[
                  { key: 'name', label: 'Company' },
                  { key: 'reference', label: 'Reference' },
                  { key: 'lastLoadDate', label: 'Last Load Date' },
                  { key: 'salesBalanceGBP', label: 'Sales Balance' },
                  { key: 'notifiedSalesBalanceGBP', label: 'Notified Sales Balance' },
                  { key: 'purchaseBalanceGBP', label: 'Purchase Balance' },
                  { key: 'status', label: 'Status' }
                ]}
              />
              <InputGroup maxW="320px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={SearchIcon} />
                </InputLeftElement>
                <Input placeholder="Search by name or reference…" value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
              </InputGroup>
            </HStack>
          </Box>
        </Flex>
        <TableContainer overflowX="auto">
          <Table size="md" variant="simple" minW="1000px">
            <Thead>
              <Tr>
                <SortHeader label="Company" k="name" />
                <SortHeader label="Reference" k="reference" />
                <SortHeader label="Last Load Date" k="lastLoadDate" />
                <SortHeader label="Sales Balance" k="salesBalanceGBP" />
                <SortHeader label="Notified Sales Balance" k="notifiedSalesBalanceGBP" />
                <SortHeader label="Purchase Balance" k="purchaseBalanceGBP" />
                <Tooltip label="How is the Company funded (export behaviour)">
                  <Th>FUNDING</Th>
                </Tooltip>
                <SortHeader label="CONNECTOR" k="status" />
                <Tooltip label="Status of data load">
                  <Th>Status</Th>
                </Tooltip>
                <Tooltip label="Indicates if there was a sales or purchase balance change in last load">
                  <Th>CHANGE</Th>
                </Tooltip>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sorted.map(row => (
                <TablesTableRow
                  key={row.id}
                  {...row}
                  connector={row.status === 'cloud' ? getConnector(row) : undefined}
                  loadStatus={getLoadStatus(row)}
                  hoverTitle={buildHoverTitle(row)}
                  funding={getFunding(row)}
                  hasBalanceChanged={hasBalanceChanged(row)}
                  onEdit={(id) => {
                    const row = data.find(d => d.id === id)
                    if (!row) return
                    setEditTarget({ id, name: row.name, email: row.email })
                    editDialog.onOpen()
                  }}
                  onClear={(id) => handleClearClick(id)}
                  onSelect={(id) => { setSelectedId(id); onOpen(); }}
                  onRefresh={(id) => handleRefreshClick(id)}
                  onSnapshot={(id) => handleSnapshotClick(id)}
                  onChangeClick={(id) => handleChangeClick(id)}
                  onFundingClick={(id) => handleFundingClick(id)}
                />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
    </Card>

    {/* Edit company dialog */}
    {editTarget && (
      <EditCompanyDialog
        isOpen={editDialog.isOpen}
        onClose={() => { editDialog.onClose(); setEditTarget(null) }}
        initialName={editTarget.name}
        initialEmail={editTarget.email}
        initialConfig={configMap[editTarget.id] || { exports: [], reports: [], pools: [] }}
        onSubmit={({ name, email, config }) => {
          // Update table data (name/email)
          setData(prev => prev.map(r => r.id === editTarget.id ? { ...r, name, email } : r))
          // Save config in map
          setConfigMap(prev => ({ ...prev, [editTarget.id]: config }))
          toast({ title: 'Company updated', description: `${name} was updated successfully.`, status: 'success', duration: 3000, isClosable: true })
        }}
      />
    )}

    <CreateCompanyDialog
      isOpen={createDialog.isOpen}
      onClose={createDialog.onClose}
      onSubmit={handleCreateSubmit}
    />

    <Modal isOpen={registrationDialog.isOpen && !!registrationUrl} onClose={() => { setRegistrationUrl(null); registrationDialog.onClose() }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Registration created</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={3}>A registration link was created for this company. You can click it or copy to share:</Text>
          {registrationUrl && (
            <Stack spacing={2}>
              <Link color="blue.500" href={registrationUrl} isExternal>{registrationUrl}</Link>
              <Input value={registrationUrl} isReadOnly />
              <Button onClick={onCopy} size="sm">{hasCopied ? 'Copied' : 'Copy'}</Button>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => { setRegistrationUrl(null); registrationDialog.onClose() }}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Clear/Delete confirmation modal */}
    <Modal isOpen={!!clearTarget} onClose={() => setClearTarget(null)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isDelete ? 'Delete company' : 'Clear company data'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {clearTarget && (
            <Stack spacing={4}>
              <Text>Are you sure you want to {isDelete ? 'delete' : 'clear'} data for <Text as="span" fontWeight="semibold">{clearTarget.name}</Text>?</Text>
              <Checkbox isChecked={isDelete} onChange={(e) => setIsDelete(e.target.checked)}>
                Delete company (instead of clear)
              </Checkbox>
              {!isDelete && (
                <Stack spacing={1}>
                  <Text fontSize="sm" color="gray.600">Clear back to snapshot date</Text>
                  <Select value={selectedSnapshot} onChange={(e) => setSelectedSnapshot(e.target.value)}>
                    {snapshotDates.map(d => (
                      <option key={d} value={d}>{new Date(d).toLocaleDateString('en-GB')}</option>
                    ))}
                  </Select>
                </Stack>
              )}
              <Stack spacing={1}>
                <Text fontSize="sm" color="gray.600">Type the company reference to confirm</Text>
                <Input placeholder={clearTarget.reference} value={confirmRefText} onChange={(e) => setConfirmRefText(e.target.value)} />
                {confirmRefText && confirmRefText !== clearTarget.reference && (
                  <Text fontSize="xs" color="red.500">Reference does not match</Text>
                )}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={() => setClearTarget(null)}>Cancel</Button>
          <Button colorScheme={isDelete ? 'red' : 'blue'} onClick={confirmClearOrDelete} isDisabled={!clearTarget || confirmRefText !== clearTarget.reference}>
            {isDelete ? 'Delete' : 'Clear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Snapshot Drawer */}
    <Drawer isOpen={!!snapshotTarget} placement="right" onClose={() => setSnapshotTarget(null)} size="xl">
      <DrawerOverlay />
      <DrawerContent w={{ base: '100%', md: '85vw', lg: '80vw' }} maxW="none">
        <DrawerHeader borderBottomWidth="1px">
          <HStack justify="space-between">
            <Text fontWeight="semibold">Snapshots — {snapshotTarget?.name || ''}</Text>
            <Button onClick={() => setSnapshotTarget(null)} variant="outline">Close</Button>
          </HStack>
        </DrawerHeader>
        <DrawerBody>
          <Stack spacing={6} py={2}>
            <Card>
              <CardBody>
                <Stack spacing={3}>
                  <HStack justify="space-between" align="center">
                    <Text fontWeight="semibold">Snapshot History</Text>
                    <HStack spacing={3}>
                      <ExportButton 
                        data={sortedFilteredSnapshots}
                        filename={`snapshots_${snapshotTarget?.name.replace(/\s+/g, '_').toLowerCase() || 'company'}.csv`}
                        headers={[
                          { key: 'loadDate', label: 'Load Date' },
                          { key: 'salesBalance', label: 'Sales Ledger Balance' },
                          { key: 'previousBalance', label: 'Previous Balance' },
                          { key: 'newItemCount', label: 'New Item Count' },
                          { key: 'newInvoiceTotal', label: 'New Invoice Total' },
                          { key: 'newCreditTotal', label: 'New Credit Note Total' },
                          { key: 'newPaymentTotal', label: 'New Payment Total' }
                        ]}
                        size="sm"
                      />
                      <Input type="date" size="sm" value={snapFromDate} onChange={(e) => setSnapFromDate(e.target.value)} />
                      <Input type="date" size="sm" value={snapToDate} onChange={(e) => setSnapToDate(e.target.value)} />
                      <Button size="sm" onClick={() => { setSnapFromDate(''); setSnapToDate('') }}>Clear</Button>
                    </HStack>
                  </HStack>
                  <TableContainer>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th cursor="pointer" onClick={() => onSnapSortClick('loadDate')} userSelect="none">
                            <HStack spacing={1}>
                              <Box>Load date</Box>
                              {snapSortKey === 'loadDate' && (snapSortDir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
                            </HStack>
                          </Th>
                          <Th isNumeric cursor="pointer" onClick={() => onSnapSortClick('salesBalance')} userSelect="none">
                            <HStack spacing={1} justify="flex-end">
                              <Box>Sales ledger balance</Box>
                              {snapSortKey === 'salesBalance' && (snapSortDir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
                            </HStack>
                          </Th>
                          <Th isNumeric cursor="pointer" onClick={() => onSnapSortClick('previousBalance')} userSelect="none">
                            <HStack spacing={1} justify="flex-end">
                              <Box>Previous balance</Box>
                              {snapSortKey === 'previousBalance' && (snapSortDir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
                            </HStack>
                          </Th>
                          <Th isNumeric cursor="pointer" onClick={() => onSnapSortClick('newItemCount')} userSelect="none">
                            <HStack spacing={1} justify="flex-end">
                              <Box>New item count</Box>
                              {snapSortKey === 'newItemCount' && (snapSortDir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
                            </HStack>
                          </Th>
                          <Th isNumeric cursor="pointer" onClick={() => onSnapSortClick('newInvoiceTotal')} userSelect="none">
                            <HStack spacing={1} justify="flex-end">
                              <Box>New invoice total</Box>
                              {snapSortKey === 'newInvoiceTotal' && (snapSortDir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
                            </HStack>
                          </Th>
                          <Th isNumeric cursor="pointer" onClick={() => onSnapSortClick('newCreditTotal')} userSelect="none">
                            <HStack spacing={1} justify="flex-end">
                              <Box>New credit note total</Box>
                              {snapSortKey === 'newCreditTotal' && (snapSortDir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
                            </HStack>
                          </Th>
                          <Th isNumeric cursor="pointer" onClick={() => onSnapSortClick('newPaymentTotal')} userSelect="none">
                            <HStack spacing={1} justify="flex-end">
                              <Box>New payment total</Box>
                              {snapSortKey === 'newPaymentTotal' && (snapSortDir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
                            </HStack>
                          </Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {sortedFilteredSnapshots.map(s => (
                          <Tr key={s.loadDate} _hover={{ bg: 'gray.50' }} cursor="pointer" onClick={() => openSnapshotDetail(s)}>
                            <Td>{new Date(s.loadDate).toLocaleDateString('en-GB')}</Td>
                            <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(s.salesBalance)}</Td>
                            <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(s.previousBalance)}</Td>
                            <Td isNumeric>{s.newItemCount}</Td>
                            <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(s.newInvoiceTotal)}</Td>
                            <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(s.newCreditTotal)}</Td>
                            <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(s.newPaymentTotal)}</Td>
                            <Td>
                              <HStack spacing={2}>
                                <Button size="xs" onClick={(e) => { e.stopPropagation(); openExtractModal(s) }}>Extract File</Button>
                                <Button size="xs" variant="outline" onClick={(e) => { e.stopPropagation(); openExportsModal(s) }}>Exports</Button>
                                <Button 
                                  size="xs" 
                                  colorScheme="blue" 
                                  isDisabled={s.newItemCount <= 0}
                                  onClick={(e) => { e.stopPropagation(); openTransactionsModal(s) }}
                                >
                                  Transactions
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Stack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stack spacing={3}>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">12-month balance movement</Text>
                    <HStack>
                      <Badge colorScheme="blue">Sales</Badge>
                      <Badge colorScheme="green">Purchase</Badge>
                    </HStack>
                  </HStack>
                  {/* Simple responsive SVG line chart */}
                  <Box w="100%" h="220px">
                    {(() => {
                      const w = 800, h = 200, pad = 32
                      const months = series.months
                      const sales = series.sales
                      const purchase = series.purchase
                      const all = [...sales, ...purchase]
                      const minV = Math.min(...all, 0)
                      const maxV = Math.max(...all, 1)
                      const x = (i: number) => pad + (i * (w - 2 * pad)) / Math.max(1, months.length - 1)
                      const y = (v: number) => h - pad - ((v - minV) * (h - 2 * pad)) / Math.max(1, (maxV - minV) || 1)
                      const toPath = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')
                      return (
                        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
                          {/* axes */}
                          <line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad} stroke="#CBD5E0" />
                          <line x1={pad} y1={pad} x2={pad} y2={h-pad} stroke="#CBD5E0" />
                          {/* sales */}
                          <path d={toPath(sales)} fill="none" stroke="#3182CE" strokeWidth="2" />
                          {/* purchase */}
                          <path d={toPath(purchase)} fill="none" stroke="#38A169" strokeWidth="2" />
                        </svg>
                      )
                    })()}
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>

    {/* Snapshot details modal */}
    <Modal isOpen={!!selectedSnapshotDetail} onClose={closeSnapshotDetail} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Snapshot details — {snapshotTarget?.name || ''}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedSnapshotDetail && (
            <Stack spacing={4}>
              <Text fontSize="sm" color="gray.600">Load date: {new Date(selectedSnapshotDetail.loadDate).toLocaleDateString('en-GB')}</Text>
              <TableContainer>
                <Table size="sm">
                  <Tbody>
                    <Tr>
                      <Td>Sales ledger balance</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(selectedSnapshotDetail.salesBalance)}</Td>
                    </Tr>
                    <Tr>
                      <Td>Previous balance</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(selectedSnapshotDetail.previousBalance)}</Td>
                    </Tr>
                    <Tr>
                      <Td>New items (count)</Td>
                      <Td isNumeric>{selectedSnapshotDetail.newItemCount}</Td>
                    </Tr>
                    <Tr>
                      <Td>New items (amount)</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(selectedSnapshotDetail.newItemAmount)}</Td>
                    </Tr>
                    <Tr>
                      <Td>Changed items (amount)</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(selectedSnapshotDetail.changedItemAmount)}</Td>
                    </Tr>
                    <Tr>
                      <Td>Closed items (amount)</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(selectedSnapshotDetail.closedItemAmount)}</Td>
                    </Tr>
                    <Tr>
                      <Td>Deleted items (amount)</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(selectedSnapshotDetail.deletedItemAmount)}</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
              <Divider />
              <Text fontWeight="semibold">Totals by Transaction Type</Text>
              <TableContainer>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Type</Th>
                      <Th isNumeric>Amount</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>Invoice</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(selectedSnapshotDetail.invoiceTotal)}</Td>
                    </Tr>
                    <Tr>
                      <Td>Debit Adjustment</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(selectedSnapshotDetail.debitAdjTotal)}</Td>
                    </Tr>
                    <Tr>
                      <Td>Payment</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(selectedSnapshotDetail.paymentTotal)}</Td>
                    </Tr>
                    <Tr>
                      <Td>Credit Note</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(selectedSnapshotDetail.creditNoteTotal)}</Td>
                    </Tr>
                    <Tr>
                      <Td>Credit Adjustment</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(selectedSnapshotDetail.creditAdjTotal)}</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
              <Divider />
              <Text fontWeight="semibold">New Items Totals</Text>
              <TableContainer>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Category</Th>
                      <Th isNumeric>Total</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>New invoice total</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(selectedSnapshotDetail.newInvoiceTotal)}</Td>
                    </Tr>
                    <Tr>
                      <Td>New credit note total</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(selectedSnapshotDetail.newCreditTotal)}</Td>
                    </Tr>
                    <Tr>
                      <Td>New payment total</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(selectedSnapshotDetail.newPaymentTotal)}</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={closeSnapshotDetail}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Extract File modal */}
    <Modal isOpen={!!extractSnapshot} onClose={closeExtractModal} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw">
        <ModalHeader>Extract File — {snapshotTarget?.name || ''}</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH="70vh" overflowY="auto">
          {extractSnapshot && (
            <Stack spacing={3}>
              <HStack spacing={4}>
                <Badge colorScheme="purple">Date received: {new Date(new Date(extractSnapshot.loadDate).getTime() - 3*60*60*1000).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</Badge>
                <Badge colorScheme="green">Date loaded: {new Date(extractSnapshot.loadDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</Badge>
              </HStack>
              <Box borderWidth="1px" borderRadius="md" p={3} bg="gray.50" maxH="65vh" overflow="auto">
                <Box as="pre" fontSize="sm" fontFamily="mono" whiteSpace="pre">{extractXML}</Box>
              </Box>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={closeExtractModal}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Snapshot Exports modal */}
    <Modal isOpen={!!exportsSnapshot} onClose={closeExportsModal} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw">
        <ModalHeader>Exports — {snapshotTarget?.name || ''}</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH="70vh" overflowY="hidden">
          <Box maxH="68vh" overflowY="auto">
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Export</Th>
                    <Th>Started</Th>
                    <Th>Produced</Th>
                    <Th>Folder</Th>
                    <Th>API Endpoint</Th>
                    <Th>Status</Th>
                    <Th>File</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {exportsList.map((ex, idx) => (
                    <Tr key={ex.name+idx}>
                      <Td>{ex.name}</Td>
                      <Td>{new Date(ex.startedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</Td>
                      <Td>{new Date(ex.producedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</Td>
                      <Td>{ex.folder}</Td>
                      <Td>{ex.apiEndpoint}</Td>
                      <Td>
                        <Badge colorScheme={ex.status==='success'?'green':'red'} textTransform="capitalize">{ex.status}</Badge>
                      </Td>
                      <Td>
                        <Button size="xs" variant="outline" onClick={() => openViewFile(ex.fileName, ex.fileContent)} isDisabled={!ex.fileContent}>View file</Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button onClick={closeExportsModal}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* View Export File modal */}
    <Modal isOpen={!!viewFile} onClose={closeViewFile} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw">
        <ModalHeader>Export File — {viewFile?.name || ''}</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH="70vh" overflowY="auto">
          {viewFile && (
            <Box borderWidth="1px" borderRadius="md" p={3} bg="gray.50" maxH="65vh" overflow="auto">
              <Box as="pre" fontSize="sm" fontFamily="mono" whiteSpace="pre">{viewFile.content}</Box>
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={closeViewFile}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Transactions modal */}
    <Modal isOpen={!!transactionsSnapshot} onClose={closeTransactionsModal} size="xl">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          {snapshotTransactions.length === 1 && snapshotTransactions[0].changeStatus 
            ? `Transaction Details — ${snapshotTransactions[0].changeStatus}` 
            : `New Transactions — ${snapshotTarget?.name || ''}`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" maxH="calc(90vh - 130px)">
          {transactionsSnapshot && (
            <Stack spacing={4}>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  Load date: {new Date(transactionsSnapshot.loadDate).toLocaleDateString('en-GB')} | 
                  New items: {transactionsSnapshot.newItemCount}
                </Text>
                <ExportButton 
                  data={snapshotTransactions}
                  filename={`transactions_${snapshotTarget?.name.replace(/\s+/g, '_').toLowerCase() || 'company'}_${new Date(transactionsSnapshot.loadDate).toISOString().slice(0,10)}.csv`}
                  headers={[
                    { key: 'customerName', label: 'Customer' },
                    { key: 'customerRef', label: 'Customer Reference' },
                    { key: 'type', label: 'Type' },
                    { key: 'document', label: 'Document' },
                    { key: 'documentDate', label: 'Document Date' },
                    { key: 'entryDate', label: 'Entry Date' },
                    { key: 'amount', label: 'Amount' },
                    { key: 'remaining', label: 'Remaining' },
                    { key: 'dueDate', label: 'Due Date' },
                    { key: 'notified', label: 'Notified' }
                  ]}
                  size="sm"
                />
              </HStack>

              <TableContainer>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Customer</Th>
                      <Th>Type</Th>
                      <Th>Document</Th>
                      <Th>Document Date</Th>
                      <Th>Entry Date</Th>
                      <Th isNumeric>Amount</Th>
                      <Th isNumeric>Remaining</Th>
                      <Th>Due Date</Th>
                      <Th>Notified</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {snapshotTransactions.map(tx => (
                      <Tr key={tx.id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <Text fontWeight="medium">{tx.customerName}</Text>
                          <Text fontSize="xs" color="gray.500">{tx.customerRef}</Text>
                        </Td>
                        <Td>{tx.type}</Td>
                        <Td>{tx.document}</Td>
                        <Td>{new Date(tx.documentDate).toLocaleDateString('en-GB')}</Td>
                        <Td>{new Date(tx.entryDate).toLocaleDateString('en-GB')}</Td>
                        <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(tx.amount)}</Td>
                        <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(tx.remaining)}</Td>
                        <Td>{new Date(tx.dueDate).toLocaleDateString('en-GB')}</Td>
                        <Td>{tx.notified ? 'Yes' : 'No'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              <Box p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontStyle="italic">
                  These are the new transactions that were added in this snapshot. Click on a row to see more details.
                </Text>
              </Box>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={closeTransactionsModal}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

     {/* Cloud data refresh modal */}
     <Modal isOpen={!!refreshTarget} onClose={() => setRefreshTarget(null)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Refresh cloud data</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {refreshTarget && (
            <Stack spacing={3}>
              <Text>Would you like to refresh the cloud data for <Text as="span" fontWeight="semibold">{refreshTarget.name}</Text>?</Text>
              <Text>
                Connector: {
                  refreshTarget.connector === 'native' ? (
                    <Link href="https://lendscape.com/" color="blue.500" isExternal>Native Cloud (Lendscape)</Link>
                  ) : refreshTarget.connector === 'codat' ? (
                    <Link href="https://codat.io/" color="blue.500" isExternal>Codat</Link>
                  ) : (
                    <Link href="https://www.validis.com/" color="blue.500" isExternal>Validis</Link>
                  )
                }
              </Text>
              {(refreshTarget.connector === 'codat' || refreshTarget.connector === 'validis') && (
                <Checkbox isChecked={sourceRefresh} onChange={(e) => setSourceRefresh(e.target.checked)}>
                  Source Data refresh
                </Checkbox>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={() => setRefreshTarget(null)}>Cancel</Button>
          <Button colorScheme="blue" onClick={confirmRefresh}>Refresh</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {details && (
      <CompanyPanel
        isOpen={isOpen}
        onClose={() => { onClose(); setSelectedId(null) }}
        company={details.company}
        balances={details.balances}
        retentions={details.retentions}
        ageing={details.ageing}
        salesTransactions={details.salesTransactions}
        purchaseTransactions={details.purchaseTransactions}
        customers={details.customers}
        suppliers={details.suppliers}
        funding={(data.find(d => d.id === selectedId) ? getFunding(data.find(d => d.id === selectedId) as CompanyRow) : undefined)}
      />
    )}
    {/* Change Transactions Modal */}
    <Modal isOpen={changeTransactionsOpen} onClose={closeChangeTransactionsModal} size="full">
      <ModalOverlay />
      <ModalContent maxH="90vh" maxW="90vw">
        <ModalHeader>Transactions with Changes</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" maxH="calc(90vh - 130px)">
          <Stack spacing={4}>
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">
                Showing transactions that were added, changed, or closed
              </Text>
              <ExportButton 
                data={changeTransactions}
                filename={`change_transactions.csv`}
                headers={[
                  { key: 'customerName', label: 'Customer' },
                  { key: 'customerRef', label: 'Customer Reference' },
                  { key: 'type', label: 'Type' },
                  { key: 'document', label: 'Document' },
                  { key: 'documentDate', label: 'Document Date' },
                  { key: 'entryDate', label: 'Entry Date' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'remaining', label: 'Remaining' },
                  { key: 'dueDate', label: 'Due Date' },
                  { key: 'notified', label: 'Notified' },
                  { key: 'changeStatus', label: 'Status' },
                  { key: 'accountType', label: 'Account Type' }
                ]}
                size="sm"
              />
            </HStack>

            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Customer</Th>
                    <Th>Type</Th>
                    <Th>Document</Th>
                    <Th>Document Date</Th>
                    <Th>Entry Date</Th>
                    <Th isNumeric>Amount</Th>
                    <Th isNumeric>Remaining</Th>
                    <Th>Due Date</Th>
                    <Th>Notified</Th>
                    <Th>Status</Th>
                    <Th>Account Type</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {changeTransactions.map(tx => (
                    <Tr 
                      key={tx.id} 
                      _hover={{ bg: 'gray.50' }} 
                      cursor="pointer"
                      onClick={() => handleTransactionRowClick(tx)}
                    >
                      <Td>
                        <Text fontWeight="medium">{tx.customerName}</Text>
                        <Text fontSize="xs" color="gray.500">{tx.customerRef}</Text>
                      </Td>
                      <Td>{tx.type}</Td>
                      <Td>{tx.document}</Td>
                      <Td>{new Date(tx.documentDate).toLocaleDateString('en-GB')}</Td>
                      <Td>{new Date(tx.entryDate).toLocaleDateString('en-GB')}</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(tx.amount)}</Td>
                      <Td isNumeric>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(tx.remaining)}</Td>
                      <Td>{new Date(tx.dueDate).toLocaleDateString('en-GB')}</Td>
                      <Td>{tx.notified ? 'Yes' : 'No'}</Td>
                      <Td>
                        <Badge 
                          colorScheme={
                            tx.changeStatus === 'NEW' ? 'green' : 
                            tx.changeStatus === 'CHANGED' ? 'blue' : 
                            'red'
                          }
                        >
                          {tx.changeStatus}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={tx.accountType === 'sales' ? 'purple' : 'orange'}
                        >
                          {tx.accountType}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontStyle="italic">
                These are the transactions that were added, changed, or closed as part of the load.
              </Text>
            </Box>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={closeChangeTransactionsModal}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  )
}
