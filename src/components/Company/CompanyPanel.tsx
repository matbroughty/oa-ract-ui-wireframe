import { useMemo, useState, useEffect } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  SimpleGrid,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react'
import { TriangleDownIcon, TriangleUpIcon, SearchIcon, TimeIcon, DownloadIcon, CalendarIcon, ExternalLinkIcon } from '@chakra-ui/icons'

export type CompanySummary = {
  id: string
  name: string
  email: string
  reference: string
  lastLoadDate: string // ISO
}

export type BalanceBreakdown = {
  salesLedgerBalance: number
  notifiedSalesLedgerBalance: number
  invoices: number
  creditNotes: number
  openCash: number
}

export type Retentions = {
  ageing: number
  manual: number
  concentration: number
  funding: number
  contra: number
  approved: number
}

export type Ageing = {
  notDue: number
  d30: number
  d60: number
  d90: number
  over: number
}

export type Transaction = {
  id: string
  customerName: string
  customerRef: string
  amount: number
  remaining: number
  document: string
  dueDate: string // ISO
  status: 'open' | 'closed'
  notified?: boolean
  type?: 'Invoice' | 'Debit Adjustment' | 'Payment' | 'Credit Note' | 'Credit Adjustment'
  documentDate?: string // ISO
  entryDate?: string // ISO
}

export type Customer = {
  id: string
  name: string
  reference: string
  outstanding: number
  address?: string
  notified?: boolean
  debtorPoolRef?: string
  enrichment?: Record<string, string>
  website?: string
  contact?: string
  createdDate?: string // ISO
  changedDate?: string // ISO
  changeDetails?: Record<string, string> // field name -> new value
  limits?: {
    funding?: { currency: string, amount: number }
    concentration?: number // percentage
    dilution?: number // percentage
  }
  isExport?: boolean
  exportDelayDays?: number
  contraLinked?: boolean
  contraLinkedId?: string
}

function formatGBP(value: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)
}

function daysPastDue(dueDateISO: string) {
  const due = new Date(dueDateISO)
  const today = new Date()
  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

function BarChart({ data }: { data: Retentions }) {
  const entries = Object.entries(data) as [keyof Retentions, number][]
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1
  return (
    <VStack align="stretch" spacing={2}>
      {entries.map(([k, v]) => {
        const pct = Math.round((v / total) * 100)
        return (
          <HStack key={k} spacing={3}>
            <Box w="120px" textTransform="capitalize" fontSize="sm" color="gray.600">{k}</Box>
            <Box flex="1">
              <Box bg="gray.200" h="6" borderRadius="md" overflow="hidden">
                <Box bg="blue.500" h="100%" width={`${pct}%`} />
              </Box>
            </Box>
            <Text w="60px" textAlign="right" fontWeight="semibold">{pct}%</Text>
          </HStack>
        )
      })}
    </VStack>
  )
}

function AgeingBarChart({ ageing }: { ageing: Ageing }) {
  const items = [
    { key: 'notDue' as const, label: 'Not Due', value: ageing.notDue },
    { key: 'd30' as const, label: '30 days', value: ageing.d30 },
    { key: 'd60' as const, label: '60 days', value: ageing.d60 },
    { key: 'd90' as const, label: '90 days', value: ageing.d90 },
    { key: 'over' as const, label: 'Over', value: ageing.over },
  ]
  const max = Math.max(1, ...items.map(i => i.value))
  function fmtGBP(n: number) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n)
  }
  return (
    <VStack align="stretch" spacing={2}>
      {items.map(({ key, label, value }) => {
        const pct = Math.max(1, Math.round((value / max) * 100))
        return (
          <HStack key={key} spacing={3}>
            <Box w="120px" fontSize="sm" color="gray.600">{label}</Box>
            <Box flex="1">
              <Box bg="gray.200" h="6" borderRadius="md" overflow="hidden">
                <Box bg="teal.500" h="100%" width={`${pct}%`} />
              </Box>
            </Box>
            <Text w="120px" textAlign="right" fontWeight="semibold">{fmtGBP(value)}</Text>
          </HStack>
        )
      })}
    </VStack>
  )
}

function TopCustomersChart({ customers, onSelect }: { customers: Customer[]; onSelect: (c: Customer) => void }) {
  const top = [...customers].sort((a, b) => (b.outstanding || 0) - (a.outstanding || 0)).slice(0, 10)
  const max = Math.max(1, ...top.map(c => c.outstanding || 0))
  return (
    <VStack align="stretch" spacing={2}>
      {top.map((c) => {
        const pct = Math.max(1, Math.round(((c.outstanding || 0) / max) * 100))
        return (
          <HStack key={c.id} spacing={3} cursor="pointer" _hover={{ opacity: 0.9 }} onClick={() => onSelect(c)}>
            <Box w="220px">
              <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{c.name}</Text>
              <Text fontSize="xs" color="gray.600" noOfLines={1}>{c.reference}</Text>
            </Box>
            <Box flex="1">
              <Box bg="gray.200" h="6" borderRadius="md" overflow="hidden">
                <Box bg="purple.500" h="100%" width={`${pct}%`} />
              </Box>
            </Box>
            <Text w="100px" textAlign="right" fontWeight="semibold">{formatGBP(c.outstanding)}</Text>
          </HStack>
        )
      })}
    </VStack>
  )
}

function seedCustomerTransactions(customer: Customer, companyId: string, count = 10): Transaction[] {
  const arr: Transaction[] = []
  for (let i = 0; i < count; i++) {
    const open = i % 2 === 0
    const isNegative = i % 5 === 0
    const baseAmt = Math.round((Math.random() * 4000 + 150) * 100) / 100
    const amt = isNegative ? -baseAmt : baseAmt
    const remaining = open && !isNegative ? Math.round((baseAmt * Math.random()) * 100) / 100 : 0
    let type: Transaction['type']
    if (isNegative) {
      const negTypes: Transaction['type'][] = ['Payment', 'Credit Note', 'Credit Adjustment']
      type = negTypes[i % negTypes.length]
    } else {
      type = i % 7 === 0 ? 'Debit Adjustment' : 'Invoice'
    }
    const notified = i % 2 === 0
    const documentDate = new Date(Date.now() + (Math.random()*90-45) * 24 * 60 * 60 * 1000).toISOString()
    const entryDate = new Date(Date.now() + (Math.random()*90-45) * 24 * 60 * 60 * 1000).toISOString()
    arr.push({
      id: `${companyId}-${customer.id}-tx-${i+1}`,
      customerName: customer.name,
      customerRef: customer.reference,
      amount: amt,
      remaining,
      document: `DOC-${companyId}-${i + 1}`,
      dueDate: new Date(Date.now() + (Math.random()*60-30) * 24 * 60 * 60 * 1000).toISOString(),
      status: open ? 'open' : 'closed',
      type,
      notified,
      documentDate,
      entryDate,
    })
  }
  return arr
}

export default function CompanyPanel({
  isOpen,
  onClose,
  company,
  balances,
  retentions,
  ageing,
  salesTransactions,
  purchaseTransactions,
  customers,
  suppliers,
  funding,
}: {
  isOpen: boolean
  onClose: () => void
  company: CompanySummary
  balances: BalanceBreakdown
  retentions: Retentions
  ageing: Ageing
  salesTransactions: Transaction[]
  purchaseTransactions: Transaction[]
  customers: Customer[]
  suppliers: Customer[]
  funding?: 'Not funded' | 'Company' | 'Pool'
}) {
  const [txFilter, setTxFilter] = useState<'open' | 'closed'>('open')
  const [customerOpen, setCustomerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerTx, setCustomerTx] = useState<Transaction[]>([])
  const [poolOpen, setPoolOpen] = useState(false)

  // Transactions sort state (Amount and Remaining)
  type TxSortKey = 'amount' | 'remaining'
  const [txSortKey, setTxSortKey] = useState<TxSortKey>('amount')
  const [txSortDir, setTxSortDir] = useState<'asc' | 'desc'>('asc')

  // Customers table filter/sort state
  const [custSearch, setCustSearch] = useState('')
  type CustSortKey = 'name' | 'reference' | 'outstanding' | 'debtorPoolRef'
  const [custSortKey, setCustSortKey] = useState<CustSortKey>('name')
  const [custSortDir, setCustSortDir] = useState<'asc' | 'desc'>('asc')
  // Keep a local copy of customers so we can toggle notified and apply enrichment
  const [custRows, setCustRows] = useState<Customer[]>(customers)

  // Add mock data for the new fields to test the UI
  useEffect(() => {
    if (customers.length > 0) {
      setCustRows(prev => prev.map((c, index) => {
        // Only add mock data to the first few customers
        if (index < 5) {
          return {
            ...c,
            address: c.address || `${index + 1} Business Street\nCity, Country\nPostcode`,
            website: `https://example${index}.com`,
            contact: `Contact Person ${index + 1}\nEmail: contact${index + 1}@example.com\nPhone: +44 123 456 ${index + 1000}`,
            createdDate: new Date(Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
            changedDate: index % 2 === 0 ? new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString() : undefined,
            changeDetails: index % 2 === 0 ? {
              'Address Line 1': 'Changed from "Old Street" to "Business Street"',
              'Contact': 'Updated phone number'
            } : undefined,
            limits: {
              funding: { currency: 'GBP', amount: 10000 * (index + 1) },
              concentration: 10 + index * 2,
              dilution: 5 + index
            }
          }
        }
        return c
      }))
    }
  }, [customers])

  // Suppliers table filter/sort state
  const [supSearch, setSupSearch] = useState('')
  type SupSortKey = 'name' | 'reference' | 'outstanding'
  const [supSortKey, setSupSortKey] = useState<SupSortKey>('name')
  const [supSortDir, setSupSortDir] = useState<'asc' | 'desc'>('asc')

  // Selected party type for drill-in
  const [selectedPartyType, setSelectedPartyType] = useState<'customer' | 'supplier'>('customer')

  // Export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [selectedCustomerForExport, setSelectedCustomerForExport] = useState<Customer | null>(null)
  const [isExport, setIsExport] = useState(false)
  const [exportDelayDays, setExportDelayDays] = useState(0)

  // Contra modal state
  const [contraModalOpen, setContraModalOpen] = useState(false)
  const [selectedSupplierForContra, setSelectedSupplierForContra] = useState<Customer | null>(null)
  const [selectedCustomerForContra, setSelectedCustomerForContra] = useState<Customer | null>(null)
  const [potentialMatches, setPotentialMatches] = useState<Customer[]>([])

  const filteredSalesTx = useMemo(() => salesTransactions.filter(t => t.status === txFilter), [salesTransactions, txFilter])
  const filteredPurchTx = useMemo(() => purchaseTransactions.filter(t => t.status === txFilter), [purchaseTransactions, txFilter])

  const sortedSalesTx = useMemo(() => {
    const arr = [...filteredSalesTx]
    arr.sort((a, b) => {
      let av: number = a[txSortKey]
      let bv: number = b[txSortKey]
      if (av < bv) return txSortDir === 'asc' ? -1 : 1
      if (av > bv) return txSortDir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [filteredSalesTx, txSortKey, txSortDir])

  const sortedPurchTx = useMemo(() => {
    const arr = [...filteredPurchTx]
    arr.sort((a, b) => {
      let av: number = a[txSortKey]
      let bv: number = b[txSortKey]
      if (av < bv) return txSortDir === 'asc' ? -1 : 1
      if (av > bv) return txSortDir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [filteredPurchTx, txSortKey, txSortDir])

  function openCustomer(c: Customer) {
    setSelectedPartyType('customer')
    setSelectedCustomer(c)
    setCustomerTx(seedCustomerTransactions(c, company.id))
    setCustomerOpen(true)
  }

  function openSupplier(s: Customer) {
    setSelectedPartyType('supplier')
    setSelectedCustomer(s)
    setCustomerTx(seedCustomerTransactions(s, company.id))
    setCustomerOpen(true)
  }

  function openExportModal(c: Customer) {
    setSelectedCustomerForExport(c)
    setIsExport(c.isExport || false)
    setExportDelayDays(c.exportDelayDays || 0)
    setExportModalOpen(true)
  }

  function handleExportSubmit() {
    if (selectedCustomerForExport) {
      setCustRows(prev => prev.map(row => 
        row.id === selectedCustomerForExport.id 
          ? { ...row, isExport, exportDelayDays } 
          : row
      ))
      setExportModalOpen(false)
    }
  }

  // Find customers with similar names or addresses to the supplier
  function findSimilarCustomers(supplier: Customer): Customer[] {
    // Convert supplier name and address to lowercase for case-insensitive comparison
    const supplierName = supplier.name.toLowerCase();
    const supplierAddress = (supplier.address || '').toLowerCase();

    // Find customers with similar names or addresses
    return custRows.filter(customer => {
      // Skip if customer is already contra linked
      if (customer.contraLinked) return false;

      const customerName = customer.name.toLowerCase();
      const customerAddress = (customer.address || '').toLowerCase();

      // Check for similarity in name (contains part of the name)
      const nameSimilarity = 
        supplierName.includes(customerName) || 
        customerName.includes(supplierName) ||
        // Split names into words and check for common words
        supplierName.split(' ').some(word => word.length > 3 && customerName.includes(word)) ||
        customerName.split(' ').some(word => word.length > 3 && supplierName.includes(word));

      // Check for similarity in address (if both have addresses)
      const addressSimilarity = 
        supplierAddress && 
        customerAddress && 
        (supplierAddress.includes(customerAddress) || 
         customerAddress.includes(supplierAddress));

      return nameSimilarity || addressSimilarity;
    });
  }

  // Open the contra modal for a supplier
  function openContraModal(supplier: Customer) {
    setSelectedSupplierForContra(supplier);
    const matches = findSimilarCustomers(supplier);
    setPotentialMatches(matches);
    setSelectedCustomerForContra(null);
    setContraModalOpen(true);
  }

  // Handle contra linking between a supplier and a customer
  function handleContraSubmit() {
    if (selectedSupplierForContra && selectedCustomerForContra) {
      // Update the supplier in the suppliers list
      const updatedSuppliers = suppliers.map(s => 
        s.id === selectedSupplierForContra.id 
          ? { ...s, contraLinked: true, contraLinkedId: selectedCustomerForContra.id } 
          : s
      );

      // Update the customer in the customers list
      setCustRows(prev => prev.map(c => 
        c.id === selectedCustomerForContra.id 
          ? { ...c, contraLinked: true, contraLinkedId: selectedSupplierForContra.id } 
          : c
      ));

      // Close the modal
      setContraModalOpen(false);
    }
  }

  function onTxSortClick(key: TxSortKey) {
    if (key === txSortKey) {
      setTxSortDir(txSortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setTxSortKey(key)
      setTxSortDir('asc')
    }
  }

  const filteredCustomers = useMemo(() => {
    const term = custSearch.trim().toLowerCase()
    if (!term) return custRows
    return custRows.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.reference.toLowerCase().includes(term) ||
      (c.debtorPoolRef || '').toLowerCase().includes(term)
    )
  }, [custRows, custSearch])

  const sortedCustomers = useMemo(() => {
    const arr = [...filteredCustomers]
    arr.sort((a, b) => {
      let av: any = a[custSortKey]
      let bv: any = b[custSortKey]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return custSortDir === 'asc' ? -1 : 1
      if (av > bv) return custSortDir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [filteredCustomers, custSortKey, custSortDir])

  const filteredSuppliers = useMemo(() => {
    const term = supSearch.trim().toLowerCase()
    if (!term) return suppliers
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.reference.toLowerCase().includes(term)
    )
  }, [suppliers, supSearch])

  const sortedSuppliers = useMemo(() => {
    const arr = [...filteredSuppliers]
    arr.sort((a, b) => {
      let av: any = a[supSortKey]
      let bv: any = b[supSortKey]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return supSortDir === 'asc' ? -1 : 1
      if (av > bv) return supSortDir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [filteredSuppliers, supSortKey, supSortDir])

  function onCustSortClick(key: CustSortKey) {
    if (key === custSortKey) {
      setCustSortDir(custSortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setCustSortKey(key)
      setCustSortDir('asc')
    }
  }

  function onSupSortClick(key: SupSortKey) {
    if (key === supSortKey) {
      setSupSortDir(supSortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSupSortKey(key)
      setSupSortDir('asc')
    }
  }

  function SortHeader({ label, k, isNumeric }: { label: string; k: CustSortKey; isNumeric?: boolean }) {
    const active = k === custSortKey
    const dir = active ? custSortDir : undefined
    return (
      <Th cursor="pointer" onClick={() => onCustSortClick(k)} userSelect="none" isNumeric={isNumeric}>
        <HStack spacing={1} justify={isNumeric ? 'flex-end' : 'flex-start'}>
          <Box>{label}</Box>
          {active && (dir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
        </HStack>
      </Th>
    )
  }

  // Enrichment state and handlers
  const [enrichOpen, setEnrichOpen] = useState(false)
  const [enriching, setEnriching] = useState(false)

  function parseCsv(text: string): { reference: string; key: string; value: string }[] {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    const rows: { reference: string; key: string; value: string }[] = []
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim())
      if (parts.length < 2) continue
      let reference = parts[0]
      let key = 'value'
      let value = parts[1]
      if (parts.length >= 3) {
        key = parts[1]
        value = parts.slice(2).join(',')
      }
      // Skip header row heuristically
      const low = reference.toLowerCase()
      if (low === 'reference' || low === 'customerref' || low === 'customer_reference') continue
      rows.push({ reference, key, value })
    }
    return rows
  }

  async function handleCsvFile(file?: File | null) {
    if (!file) return
    setEnriching(true)
    try {
      const text = await file.text()
      const rows = parseCsv(text)
      let applied = 0
      setCustRows(prev => prev.map(c => {
        const matches = rows.filter(r => r.reference === c.reference)
        if (matches.length === 0) return c
        applied += 1
        const enrichment: Record<string, string> = { ...(c.enrichment || {}) }
        for (const r of matches) {
          enrichment[r.key] = r.value
        }
        return { ...c, enrichment }
      }))
      // optional toast can be shown by using a toast from parent; here we keep silent to avoid new imports
      // But we can at least close the modal
    } finally {
      setEnriching(false)
      setEnrichOpen(false)
    }
  }

  function SupSortHeader({ label, k, isNumeric }: { label: string; k: SupSortKey; isNumeric?: boolean }) {
    const active = k === supSortKey
    const dir = active ? supSortDir : undefined
    return (
      <Th cursor="pointer" onClick={() => onSupSortClick(k)} userSelect="none" isNumeric={isNumeric}>
        <HStack spacing={1} justify={isNumeric ? 'flex-end' : 'flex-start'}>
          <Box>{label}</Box>
          {active && (dir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
        </HStack>
      </Th>
    )
  }

  // Lightweight inline Attributes editor for a customer
  function AttributesEditor({ customer, onSave }: { customer: Customer; onSave: (map: Record<string,string>) => void }) {
    const initRows = Object.entries(customer.enrichment || {}).map(([k,v]) => ({ key: k, value: v }))
    const [rows, setRows] = useState<{ key: string; value: string }[]>(initRows)

    function addRow() {
      setRows(prev => [...prev, { key: '', value: '' }])
    }
    function updateRow(idx: number, patch: Partial<{ key: string; value: string }>) {
      setRows(prev => prev.map((r,i) => i===idx ? { ...r, ...patch } : r))
    }
    function removeRow(idx: number) {
      setRows(prev => prev.filter((_,i) => i!==idx))
    }
    function save() {
      const map: Record<string, string> = {}
      rows.forEach(r => { if (r.key.trim()) map[r.key.trim()] = r.value })
      onSave(map)
    }

    return (
      <Stack spacing={3}>
        <HStack justify="space-between">
          <Text fontWeight="semibold">Attributes</Text>
          <HStack>
            <Button size="sm" onClick={addRow}>Add</Button>
            <Button size="sm" colorScheme="blue" onClick={save}>Save</Button>
          </HStack>
        </HStack>
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th w="40%">Name</Th>
                <Th>Value</Th>
                <Th w="80px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.length === 0 && (
                <Tr>
                  <Td colSpan={3}><Text fontSize="sm" color="gray.500">No attributes</Text></Td>
                </Tr>
              )}
              {rows.map((r, idx) => (
                <Tr key={idx}>
                  <Td>
                    <Input size="sm" placeholder="name" value={r.key} onChange={(e) => updateRow(idx, { key: e.target.value })} />
                  </Td>
                  <Td>
                    <Input size="sm" placeholder="value" value={r.value} onChange={(e) => updateRow(idx, { value: e.target.value })} />
                  </Td>
                  <Td>
                    <Button size="xs" variant="ghost" colorScheme="red" onClick={() => removeRow(idx)}>Delete</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Stack>
    )
  }

  return (
    <>
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
      <DrawerOverlay />
      <DrawerContent w={{ base: '100%', md: '85vw', lg: '80vw' }} maxW="none">
        <DrawerHeader borderBottomWidth="1px">
          <HStack justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontWeight="semibold">{company.name}</Text>
              <Text fontSize="sm" color="gray.600">{company.reference} · {company.email}</Text>
            </VStack>
            <Button onClick={onClose} variant="outline">Close</Button>
          </HStack>
        </DrawerHeader>
        <DrawerBody>
          <Stack spacing={6} py={2}>
            {/* Timeline at the top, centered */}
            <Card>
              <CardBody>
                <HStack justify="center" align="center" spacing={8} flexWrap="wrap">
                  {(() => {
                    const load = new Date(company.lastLoadDate)
                    const request = new Date(load)
                    request.setDate(load.getDate() - 2)
                    const extract = new Date(request)
                    extract.setHours(extract.getHours() + 2)
                    const exportDt = new Date(load)
                    exportDt.setDate(load.getDate() + 1)

                    function fmt(d: Date) {
                      return d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
                    }

                    function Step({ icon, label, date, color }: { icon: any; label: string; date: Date; color: string }) {
                      return (
                        <VStack minW="160px" spacing={2}>
                          <Box bg={`${color}.50`} border={`2px solid`} borderColor={`${color}.300`} borderRadius="full" w="12" h="12" display="flex" alignItems="center" justifyContent="center">
                            <Icon as={icon} color={`${color}.600`} boxSize={5} />
                          </Box>
                          <Text fontWeight="semibold">{label}</Text>
                          <Text fontSize="sm" color="gray.600" textAlign="center">{fmt(date)}</Text>
                        </VStack>
                      )
                    }

                    return (
                      <>
                        <Step icon={TimeIcon} label="Request" date={request} color="blue" />
                        <Box w="8" h="1" bg="gray.300" display={{ base: 'none', md: 'block' }} />
                        <Step icon={DownloadIcon} label="Extract" date={extract} color="purple" />
                        <Box w="8" h="1" bg="gray.300" display={{ base: 'none', md: 'block' }} />
                        <Step icon={CalendarIcon} label="Load" date={load} color="green" />
                        <Box w="8" h="1" bg="gray.300" display={{ base: 'none', md: 'block' }} />
                        <Step icon={ExternalLinkIcon} label="Export" date={exportDt} color="teal" />
                      </>
                    )
                  })()}
                </HStack>
              </CardBody>
            </Card>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Card>
                <CardBody>
                  <Stack spacing={2}>
                    <Text fontSize="sm" color="gray.600">Company party</Text>
                    <Text fontSize="lg" fontWeight="semibold">{company.name}</Text>
                    <Text fontSize="sm" color="gray.600">{company.email}</Text>
                    <Text fontSize="sm" color="gray.600">Reference: {company.reference}</Text>
                    <HStack>
                      <Text fontSize="sm" color="gray.600">Funding:</Text>
                      <Badge colorScheme={funding === 'Pool' ? 'purple' : funding === 'Company' ? 'blue' : 'gray'} variant="subtle">{funding || 'Not funded'}</Badge>
                      {funding === 'Pool' && (
                        <Button size="xs" colorScheme="purple" variant="outline" onClick={() => setPoolOpen(true)}>View Pool Level Data</Button>
                      )}
                    </HStack>
                  </Stack>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stack spacing={3}>
                    <Text fontSize="sm" color="gray.600">Balances</Text>
                    <Grid templateColumns="1fr auto" rowGap={2} columnGap={4}>
                      <Text>Sales ledger balance</Text>
                      <Text fontWeight="semibold">{formatGBP(balances.salesLedgerBalance)}</Text>
                      <Text>Notified sales ledger</Text>
                      <Text fontWeight="semibold">{formatGBP(balances.notifiedSalesLedgerBalance)}</Text>
                    </Grid>
                    <Divider />
                    <Grid templateColumns="1fr auto" rowGap={2} columnGap={4}>
                      <Text color="gray.600">Invoices</Text>
                      <Text>{formatGBP(balances.invoices)}</Text>
                      <Text color="gray.600">Credit notes</Text>
                      <Text>{formatGBP(balances.creditNotes)}</Text>
                      <Text color="gray.600">Open cash</Text>
                      <Text>{formatGBP(balances.openCash)}</Text>
                    </Grid>
                  </Stack>
                </CardBody>
              </Card>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Card>
                <CardBody>
                  <Stack spacing={3}>
                    <Text fontSize="sm" color="gray.600">Retentions</Text>
                    <BarChart data={retentions} />
                  </Stack>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stack spacing={3}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Top Customers</Text>
                      <Badge colorScheme="purple">Top 10</Badge>
                    </HStack>
                    <TopCustomersChart customers={custRows} onSelect={openCustomer} />
                  </Stack>
                </CardBody>
              </Card>
            </SimpleGrid>

            <Card>
              <CardBody>
                <Stack spacing={3}>
                  <Text fontSize="sm" color="gray.600">Ageing</Text>
                  <AgeingBarChart ageing={ageing} />
                </Stack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stack spacing={3}>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Sales Ledger Items ({sortedSalesTx.length})</Text>
                    <HStack>
                      <Button size="sm" variant={txFilter==='open'?'solid':'outline'} onClick={() => setTxFilter('open')}>Open</Button>
                      <Button size="sm" variant={txFilter==='closed'?'solid':'outline'} onClick={() => setTxFilter('closed')}>Closed</Button>
                    </HStack>
                  </HStack>
                  <TableContainer>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Customer</Th>
                          <Th>Notified</Th>
                          <Th>Type</Th>
                          <Th>Document</Th>
                          <Th>Document Date</Th>
                          <Th>Entry Date</Th>
                          <Th isNumeric cursor="pointer" userSelect="none" onClick={() => onTxSortClick('amount')}>
                            <HStack spacing={1} justify="flex-end">
                              <Box>Amount</Box>
                              {txSortKey === 'amount' && (txSortDir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
                            </HStack>
                          </Th>
                          <Th isNumeric cursor="pointer" userSelect="none" onClick={() => onTxSortClick('remaining')}>
                            <HStack spacing={1} justify="flex-end">
                              <Box>Remaining</Box>
                              {txSortKey === 'remaining' && (txSortDir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
                            </HStack>
                          </Th>
                          <Th>Due</Th>
                          <Th>Past Due</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {sortedSalesTx.map(tx => {
                          const past = daysPastDue(tx.dueDate)
                          return (
                            <Tr key={tx.id}>
                              <Td>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="semibold">{tx.customerName}</Text>
                                  <Text fontSize="sm" color="gray.600">{tx.customerRef}</Text>
                                </VStack>
                              </Td>
                              <Td>
                                <Badge colorScheme={tx.notified ? 'green' : 'gray'}>{tx.notified ? 'Notified' : 'Non-notified'}</Badge>
                              </Td>
                              <Td>{tx.type || (tx.amount >= 0 ? 'Invoice' : 'Payment')}</Td>
                              <Td>{tx.document}</Td>
                              <Td>{tx.documentDate ? new Date(tx.documentDate).toLocaleDateString('en-GB') : '-'}</Td>
                              <Td>{tx.entryDate ? new Date(tx.entryDate).toLocaleDateString('en-GB') : '-'}</Td>
                              <Td isNumeric>{formatGBP(tx.amount)}</Td>
                              <Td isNumeric>{formatGBP(tx.remaining)}</Td>
                              <Td>{new Date(tx.dueDate).toLocaleDateString('en-GB')}</Td>
                              <Td>
                                {past > 0 ? (
                                  <Badge colorScheme="red">{past}d</Badge>
                                ) : (
                                  <Badge colorScheme="green">On time</Badge>
                                )}
                              </Td>
                            </Tr>
                          )
                        })}
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
                    <Text fontWeight="semibold">Purchase Ledger Items ({sortedPurchTx.length})</Text>
                    <HStack>
                      <Button size="sm" variant={txFilter==='open'?'solid':'outline'} onClick={() => setTxFilter('open')}>Open</Button>
                      <Button size="sm" variant={txFilter==='closed'?'solid':'outline'} onClick={() => setTxFilter('closed')}>Closed</Button>
                    </HStack>
                  </HStack>
                  <TableContainer>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Supplier</Th>
                          <Th>Notified</Th>
                          <Th>Type</Th>
                          <Th>Document</Th>
                          <Th>Document Date</Th>
                          <Th>Entry Date</Th>
                          <Th isNumeric cursor="pointer" userSelect="none" onClick={() => onTxSortClick('amount')}>
                            <HStack spacing={1} justify="flex-end">
                              <Box>Amount</Box>
                              {txSortKey === 'amount' && (txSortDir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
                            </HStack>
                          </Th>
                          <Th isNumeric cursor="pointer" userSelect="none" onClick={() => onTxSortClick('remaining')}>
                            <HStack spacing={1} justify="flex-end">
                              <Box>Remaining</Box>
                              {txSortKey === 'remaining' && (txSortDir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
                            </HStack>
                          </Th>
                          <Th>Due</Th>
                          <Th>Past Due</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {sortedPurchTx.map(tx => {
                          const past = daysPastDue(tx.dueDate)
                          return (
                            <Tr key={tx.id}>
                              <Td>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="semibold">{tx.customerName}</Text>
                                  <Text fontSize="sm" color="gray.600">{tx.customerRef}</Text>
                                </VStack>
                              </Td>
                              <Td>
                                <Badge colorScheme={tx.notified ? 'green' : 'gray'}>{tx.notified ? 'Notified' : 'Non-notified'}</Badge>
                              </Td>
                              <Td>{tx.type || (tx.amount >= 0 ? 'Invoice' : 'Payment')}</Td>
                              <Td>{tx.document}</Td>
                              <Td>{tx.documentDate ? new Date(tx.documentDate).toLocaleDateString('en-GB') : '-'}</Td>
                              <Td>{tx.entryDate ? new Date(tx.entryDate).toLocaleDateString('en-GB') : '-'}</Td>
                              <Td isNumeric>{formatGBP(tx.amount)}</Td>
                              <Td isNumeric>{formatGBP(tx.remaining)}</Td>
                              <Td>{new Date(tx.dueDate).toLocaleDateString('en-GB')}</Td>
                              <Td>
                                {past > 0 ? (
                                  <Badge colorScheme="red">{past}d</Badge>
                                ) : (
                                  <Badge colorScheme="green">On time</Badge>
                                )}
                              </Td>
                            </Tr>
                          )
                        })}
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
                    <Text fontWeight="semibold">Customers</Text>
                    <HStack spacing={3}>
                      <Button size="sm" variant="outline" onClick={() => setEnrichOpen(true)}>Enrichment</Button>
                      <InputGroup maxW="320px">
                        <InputLeftElement pointerEvents="none">
                          <Icon as={SearchIcon} />
                        </InputLeftElement>
                        <Input placeholder="Filter by name, reference or pool…" value={custSearch} onChange={e => setCustSearch(e.target.value)} />
                      </InputGroup>
                    </HStack>
                  </HStack>
                  <TableContainer>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <SortHeader label="Customer" k="name" />
                          <SortHeader label="Reference" k="reference" />
                          <SortHeader label="Outstanding" k="outstanding" isNumeric />
                          <SortHeader label="Debtor Pool Ref" k="debtorPoolRef" />
                          <Th>Status</Th>
                          <Th>Address</Th>
                          <Th>Actions</Th>
                          <Th>EXPORT</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {sortedCustomers.map(c => (
                          <Tr key={c.id} _hover={{ bg: 'gray.50' }}>
                            <Td onClick={() => openCustomer(c)} cursor="pointer">{c.name}</Td>
                            <Td onClick={() => openCustomer(c)} cursor="pointer">{c.reference}</Td>
                            <Td isNumeric onClick={() => openCustomer(c)} cursor="pointer">{formatGBP(c.outstanding)}</Td>
                            <Td>{c.debtorPoolRef || 'not-pooled'}</Td>
                            <Td>
                              <HStack>
                                <Badge colorScheme={c.notified ? 'green' : 'gray'}>{c.notified ? 'Notified' : 'Non-notified'}</Badge>
                                {c.contraLinked && <Badge colorScheme="purple">Contra</Badge>}
                              </HStack>
                            </Td>
                            <Td onClick={() => openCustomer(c)} cursor="pointer">{c.address || '-'}</Td>
                            <Td>
                              <Button size="xs" onClick={() => setCustRows(prev => prev.map(row => row.id === c.id ? { ...row, notified: !row.notified } : row))}>
                                {c.notified ? 'Non-notify' : 'Notify'}
                              </Button>
                            </Td>
                            <Td>
                              <Button 
                                size="xs" 
                                colorScheme="blue" 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  openExportModal(c); 
                                }}
                              >
                                {c.isExport ? `Export (${c.exportDelayDays} days)` : 'Set Export'}
                              </Button>
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
                    <Text fontWeight="semibold">Suppliers</Text>
                    <InputGroup maxW="320px">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={SearchIcon} />
                      </InputLeftElement>
                      <Input placeholder="Filter by name or reference…" value={supSearch} onChange={e => setSupSearch(e.target.value)} />
                    </InputGroup>
                  </HStack>
                  <TableContainer>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <SupSortHeader label="Supplier" k="name" />
                          <SupSortHeader label="Reference" k="reference" />
                          <SupSortHeader label="Outstanding" k="outstanding" isNumeric />
                          <Th>Status</Th>
                          <Th>Address</Th>
                          <Th>CONTRA</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {sortedSuppliers.map(s => (
                          <Tr key={s.id} _hover={{ bg: 'gray.50' }}>
                            <Td onClick={() => openSupplier(s)} cursor="pointer">{s.name}</Td>
                            <Td onClick={() => openSupplier(s)} cursor="pointer">{s.reference}</Td>
                            <Td isNumeric onClick={() => openSupplier(s)} cursor="pointer">{formatGBP(s.outstanding)}</Td>
                            <Td onClick={() => openSupplier(s)} cursor="pointer">
                              <HStack>
                                <Badge colorScheme={s.notified ? 'green' : 'gray'}>{s.notified ? 'Notified' : 'Non-notified'}</Badge>
                                {s.contraLinked && <Badge colorScheme="purple">Contra</Badge>}
                              </HStack>
                            </Td>
                            <Td onClick={() => openSupplier(s)} cursor="pointer">{s.address || '-'}</Td>
                            <Td>
                              <Button 
                                size="xs" 
                                colorScheme="purple" 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  openContraModal(s); 
                                }}
                                isDisabled={s.contraLinked}
                              >
                                {s.contraLinked ? 'Linked' : 'Link'}
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>

    {/* Enrichment modal */}
    <Modal isOpen={enrichOpen} onClose={() => setEnrichOpen(false)} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Customer Enrichment</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={3}>
            <Text fontSize="sm" color="gray.600">Upload a CSV containing customer reference and name/value pairs to enrich customer details.</Text>
            <Text fontSize="sm" color="gray.500">Supported formats:</Text>
            <Box as="ul" pl={5} color="gray.600" fontSize="sm">
              <Box as="li">reference,key,value</Box>
              <Box as="li">reference,value (key will default to "value")</Box>
            </Box>
            <Input type="file" accept=".csv,text/csv" onChange={(e) => handleCsvFile(e.target.files?.[0] || null)} disabled={enriching} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={() => setEnrichOpen(false)} disabled={enriching}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Pool Level Data modal */}
    <Modal isOpen={poolOpen} onClose={() => setPoolOpen(false)} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Pool Level Data — {company.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={3}>
            <Text color="gray.600">This company is funded at Pool level. Below is a placeholder view for pool-level totals and recent movements.</Text>
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Metric</Th>
                    <Th isNumeric>Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Pool Outstanding (Sales)</Td>
                    <Td isNumeric>{formatGBP(balances.salesLedgerBalance * 1.15)}</Td>
                  </Tr>
                  <Tr>
                    <Td>Pool Outstanding (Purchase)</Td>
                    <Td isNumeric>{formatGBP(Math.max(0, balances.salesLedgerBalance * 0.55))}</Td>
                  </Tr>
                  <Tr>
                    <Td>Approved Limit</Td>
                    <Td isNumeric>{formatGBP(balances.salesLedgerBalance * 1.5)}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
            <Text fontSize="sm" color="gray.500">Note: Replace with real pool hierarchy and figures when available.</Text>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setPoolOpen(false)}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Customer panel */}
    <Drawer isOpen={customerOpen} placement="right" onClose={() => setCustomerOpen(false)} size="xl">
      <DrawerOverlay />
      <DrawerContent w={{ base: '100%', md: '85vw', lg: '80vw' }} maxW="none">
        <DrawerHeader borderBottomWidth="1px">
          <HStack justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontWeight="semibold">{selectedCustomer ? (selectedPartyType === 'supplier' ? 'Supplier' : 'Customer') : 'Customer'}</Text>
              {selectedCustomer && (
                <Text fontSize="sm" color="gray.600">{selectedCustomer.reference}</Text>
              )}
            </VStack>
            <Button onClick={() => setCustomerOpen(false)} variant="outline">Close</Button>
          </HStack>
        </DrawerHeader>
        <DrawerBody>
          <Stack spacing={6} py={2}>
            {selectedCustomer && (
              <Card>
                <CardBody>
                  <Stack spacing={4}>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                      {/* Left column - Basic info */}
                      <GridItem>
                        <Stack spacing={3}>
                          <Text fontSize="sm" color="gray.600">{selectedPartyType === 'supplier' ? 'Supplier' : 'Customer'}</Text>
                          <Text fontSize="lg" fontWeight="semibold">{selectedCustomer.name}</Text>
                          <HStack>
                            <Badge colorScheme={selectedCustomer.notified ? 'green' : 'gray'}>
                              {selectedCustomer.notified ? 'Notified' : 'Non-notified'}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">Reference: {selectedCustomer.reference}</Text>
                          <Text fontSize="sm" color="gray.600">Outstanding: {formatGBP(selectedCustomer.outstanding)}</Text>

                          {selectedCustomer.address && (
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold" mb={1}>Address</Text>
                              <Text fontSize="sm" color="gray.600" whiteSpace="pre-line">{selectedCustomer.address}</Text>
                            </Box>
                          )}

                          {selectedCustomer.website && (
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold" mb={1}>Website</Text>
                              <Text fontSize="sm" color="blue.500" as="a" href={selectedCustomer.website} target="_blank" textDecoration="underline">
                                {selectedCustomer.website}
                              </Text>
                            </Box>
                          )}

                          {selectedCustomer.contact && (
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold" mb={1}>Contact</Text>
                              <Text fontSize="sm" color="gray.600">{selectedCustomer.contact}</Text>
                            </Box>
                          )}
                        </Stack>
                      </GridItem>

                      {/* Right column - Dates and Limits */}
                      <GridItem>
                        <Stack spacing={4}>
                          <Box>
                            <Text fontSize="sm" fontWeight="semibold" mb={1}>Dates</Text>
                            <Grid templateColumns="auto 1fr" gap={2}>
                              {selectedCustomer.createdDate && (
                                <>
                                  <Text fontSize="sm" color="gray.600">Created:</Text>
                                  <Text fontSize="sm">{new Date(selectedCustomer.createdDate).toLocaleString('en-GB')}</Text>
                                </>
                              )}

                              {selectedCustomer.changedDate && (
                                <>
                                  <Text fontSize="sm" color="gray.600">Last Changed:</Text>
                                  <HStack>
                                    <Text fontSize="sm">{new Date(selectedCustomer.changedDate).toLocaleString('en-GB')}</Text>
                                    {selectedCustomer.changeDetails && Object.keys(selectedCustomer.changeDetails).length > 0 && (
                                      <Button 
                                        size="xs" 
                                        colorScheme="blue" 
                                        variant="outline"
                                        onClick={() => {
                                          // You would implement a modal or drawer to show change details here
                                          alert(
                                            "Changes:\n" + 
                                            Object.entries(selectedCustomer.changeDetails || {})
                                              .map(([field, value]) => `${field}: ${value}`)
                                              .join("\n")
                                          )
                                        }}
                                      >
                                        View Changes
                                      </Button>
                                    )}
                                  </HStack>
                                </>
                              )}
                            </Grid>
                          </Box>

                          {selectedCustomer.limits && (
                            <Box>
                              <Text fontSize="sm" fontWeight="semibold" mb={1}>Limits</Text>
                              <Grid templateColumns="auto 1fr" gap={2}>
                                {selectedCustomer.limits.funding && (
                                  <>
                                    <Text fontSize="sm" color="gray.600">Funding Limit:</Text>
                                    <Text fontSize="sm">
                                      {new Intl.NumberFormat('en-GB', { 
                                        style: 'currency', 
                                        currency: selectedCustomer.limits.funding.currency 
                                      }).format(selectedCustomer.limits.funding.amount)}
                                    </Text>
                                  </>
                                )}

                                {selectedCustomer.limits.concentration !== undefined && (
                                  <>
                                    <Text fontSize="sm" color="gray.600">Concentration Limit:</Text>
                                    <Text fontSize="sm">{selectedCustomer.limits.concentration}%</Text>
                                  </>
                                )}

                                {selectedCustomer.limits.dilution !== undefined && (
                                  <>
                                    <Text fontSize="sm" color="gray.600">Dilution Limit:</Text>
                                    <Text fontSize="sm">{selectedCustomer.limits.dilution}%</Text>
                                  </>
                                )}
                              </Grid>
                            </Box>
                          )}
                        </Stack>
                      </GridItem>
                    </Grid>
                  </Stack>
                </CardBody>
              </Card>
            )}

            {/* Customer-level charts */}
            {selectedCustomer && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Card>
                  <CardBody>
                    <Stack spacing={3}>
                      <Text fontSize="sm" color="gray.600">Retentions (Customer)</Text>
                      {(() => {
                        const tot = Math.max(1, Math.round((selectedCustomer.outstanding || 0)))
                        const ret = {
                          ageing: Math.round(tot * 0.25),
                          manual: Math.round(tot * 0.1),
                          concentration: Math.round(tot * 0.15),
                          funding: Math.round(tot * 0.1),
                          contra: Math.round(tot * 0.1),
                          approved: Math.max(0, tot - Math.round(tot * (0.25+0.1+0.15+0.1+0.1))),
                        } as Retentions
                        return <BarChart data={ret} />
                      })()}
                    </Stack>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody>
                    <Stack spacing={3}>
                      <Text fontSize="sm" color="gray.600">Ageing (Customer)</Text>
                      {(() => {
                        const tot = Math.max(1, Math.round((selectedCustomer.outstanding || 0)))
                        const ad = {
                          notDue: Math.round(tot * 0.35),
                          d30: Math.round(tot * 0.25),
                          d60: Math.round(tot * 0.18),
                          d90: Math.round(tot * 0.12),
                          over: Math.max(0, tot - Math.round(tot * (0.35+0.25+0.18+0.12))),
                        } as Ageing
                        return <AgeingBarChart ageing={ad} />
                      })()}
                    </Stack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            )}

            {/* Customer transactions table matching company-level */}
            <Card>
              <CardBody>
                <Stack spacing={3}>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Transactions ({customerTx.length})</Text>
                    <HStack>
                      <Button size="sm" variant={txFilter==='open'?'solid':'outline'} onClick={() => setTxFilter('open')}>Open</Button>
                      <Button size="sm" variant={txFilter==='closed'?'solid':'outline'} onClick={() => setTxFilter('closed')}>Closed</Button>
                    </HStack>
                  </HStack>
                  <TableContainer>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Party</Th>
                          <Th>Notified</Th>
                          <Th>Type</Th>
                          <Th>Document</Th>
                          <Th>Document Date</Th>
                          <Th>Entry Date</Th>
                          <Th isNumeric cursor="pointer" userSelect="none" onClick={() => onTxSortClick('amount')}>
                            <HStack spacing={1} justify="flex-end">
                              <Box>Amount</Box>
                              {txSortKey === 'amount' && (txSortDir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
                            </HStack>
                          </Th>
                          <Th isNumeric cursor="pointer" userSelect="none" onClick={() => onTxSortClick('remaining')}>
                            <HStack spacing={1} justify="flex-end">
                              <Box>Remaining</Box>
                              {txSortKey === 'remaining' && (txSortDir === 'asc' ? <Icon as={TriangleUpIcon} /> : <Icon as={TriangleDownIcon} />)}
                            </HStack>
                          </Th>
                          <Th>Due</Th>
                          <Th>Past Due</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {(() => {
                          const arr = customerTx.filter(t => t.status === txFilter).sort((a,b)=> (a[txSortKey]! < b[txSortKey]!? (txSortDir==='asc'?-1:1) : (a[txSortKey]! > b[txSortKey]!? (txSortDir==='asc'?1:-1):0)))
                          return arr.map(tx => {
                            const past = daysPastDue(tx.dueDate)
                            return (
                              <Tr key={tx.id}>
                                <Td>
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="semibold">{tx.customerName}</Text>
                                    <Text fontSize="sm" color="gray.600">{tx.customerRef}</Text>
                                  </VStack>
                                </Td>
                                <Td>
                                  <Badge colorScheme={tx.notified ? 'green' : 'gray'}>{tx.notified ? 'Notified' : 'Non-notified'}</Badge>
                                </Td>
                                <Td>{tx.type || (tx.amount >= 0 ? 'Invoice' : 'Payment')}</Td>
                                <Td>{tx.document}</Td>
                                <Td>{tx.documentDate ? new Date(tx.documentDate).toLocaleDateString('en-GB') : '-'}</Td>
                                <Td>{tx.entryDate ? new Date(tx.entryDate).toLocaleDateString('en-GB') : '-'}</Td>
                                <Td isNumeric>{formatGBP(tx.amount)}</Td>
                                <Td isNumeric>{formatGBP(tx.remaining)}</Td>
                                <Td>{new Date(tx.dueDate).toLocaleDateString('en-GB')}</Td>
                                <Td>
                                  {past > 0 ? (
                                    <Badge colorScheme="red">{past}d</Badge>
                                  ) : (
                                    <Badge colorScheme="green">On time</Badge>
                                  )}
                                </Td>
                              </Tr>
                            )
                          })
                        })()}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Stack>
              </CardBody>
            </Card>

            {/* Attributes editor */}
            {selectedCustomer && (
              <Card>
                <CardBody>
                  {(() => {
                    // Prepare local state for attributes
                    // The component-level state holders
                    // NOTE: Using closures to avoid top-level state explosion; minimal implementation
                    return (
                      <AttributesEditor
                        customer={selectedCustomer}
                        onSave={(nextMap) => {
                          // Update in customers list and selectedCustomer
                          setCustRows(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, enrichment: nextMap } : c))
                          setSelectedCustomer({ ...selectedCustomer, enrichment: nextMap })
                        }}
                      />
                    )
                  })()}
                </CardBody>
              </Card>
            )}
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>

    {/* Export modal */}
    <Modal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Export Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedCustomerForExport && (
            <Stack spacing={4}>
              <Text>
                Do you want to mark <Text as="span" fontWeight="semibold">{selectedCustomerForExport.name}</Text> as export?
              </Text>

              <Checkbox 
                isChecked={isExport} 
                onChange={(e) => setIsExport(e.target.checked)}
                colorScheme="blue"
                size="lg"
                mb={2}
              >
                Mark as Export
              </Checkbox>

              {isExport && (
                <FormControl>
                  <FormLabel>Delay Days (0-999)</FormLabel>
                  <Input 
                    type="number" 
                    min={0}
                    max={999}
                    value={exportDelayDays}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 999) {
                        setExportDelayDays(value);
                      }
                    }}
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Enter the number of days to delay (0-999)
                  </Text>
                </FormControl>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={() => setExportModalOpen(false)}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleExportSubmit}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Contra modal */}
    <Modal isOpen={contraModalOpen} onClose={() => setContraModalOpen(false)} size="lg">
      <ModalOverlay />
      <ModalContent maxW="800px">
        <ModalHeader>Contra Link</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedSupplierForContra && (
            <Stack spacing={4}>
              <Text>
                Select a Customer to link with Supplier <Text as="span" fontWeight="semibold">{selectedSupplierForContra.name}</Text>
              </Text>

              {potentialMatches.length > 0 ? (
                <TableContainer>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Customer</Th>
                        <Th>Reference</Th>
                        <Th>Address</Th>
                        <Th>Select</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {potentialMatches.map(customer => (
                        <Tr 
                          key={customer.id} 
                          _hover={{ bg: 'gray.50' }}
                          bg={selectedCustomerForContra?.id === customer.id ? 'purple.50' : undefined}
                        >
                          <Td>{customer.name}</Td>
                          <Td>{customer.reference}</Td>
                          <Td>{customer.address || '-'}</Td>
                          <Td>
                            <Button 
                              size="xs" 
                              colorScheme={selectedCustomerForContra?.id === customer.id ? 'purple' : 'gray'}
                              onClick={() => setSelectedCustomerForContra(customer)}
                            >
                              {selectedCustomerForContra?.id === customer.id ? 'Selected' : 'Select'}
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Text color="gray.600">
                  No potential matches found. Try selecting a different supplier or manually search for a customer.
                </Text>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={() => setContraModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            colorScheme="purple" 
            onClick={handleContraSubmit}
            isDisabled={!selectedCustomerForContra}
          >
            Link
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  )
}
