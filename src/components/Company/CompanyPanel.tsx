import { useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
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
  type CustSortKey = 'name' | 'reference' | 'outstanding'
  const [custSortKey, setCustSortKey] = useState<CustSortKey>('name')
  const [custSortDir, setCustSortDir] = useState<'asc' | 'desc'>('asc')

  // Suppliers table filter/sort state
  const [supSearch, setSupSearch] = useState('')
  type SupSortKey = 'name' | 'reference' | 'outstanding'
  const [supSortKey, setSupSortKey] = useState<SupSortKey>('name')
  const [supSortDir, setSupSortDir] = useState<'asc' | 'desc'>('asc')

  // Selected party type for drill-in
  const [selectedPartyType, setSelectedPartyType] = useState<'customer' | 'supplier'>('customer')

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
    if (!term) return customers
    return customers.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.reference.toLowerCase().includes(term)
    )
  }, [customers, custSearch])

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
                    <TopCustomersChart customers={customers} onSelect={openCustomer} />
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
                    <InputGroup maxW="320px">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={SearchIcon} />
                      </InputLeftElement>
                      <Input placeholder="Filter by name or reference…" value={custSearch} onChange={e => setCustSearch(e.target.value)} />
                    </InputGroup>
                  </HStack>
                  <TableContainer>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <SortHeader label="Customer" k="name" />
                          <SortHeader label="Reference" k="reference" />
                          <SortHeader label="Outstanding" k="outstanding" isNumeric />
                          <Th>Status</Th>
                          <Th>Address</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {sortedCustomers.map(c => (
                          <Tr key={c.id} onClick={() => openCustomer(c)} _hover={{ bg: 'gray.50' }} cursor="pointer">
                            <Td>{c.name}</Td>
                            <Td>{c.reference}</Td>
                            <Td isNumeric>{formatGBP(c.outstanding)}</Td>
                            <Td>
                              <Badge colorScheme={c.notified ? 'green' : 'gray'}>{c.notified ? 'Notified' : 'Non-notified'}</Badge>
                            </Td>
                            <Td>{c.address || '-'}</Td>
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
                        </Tr>
                      </Thead>
                      <Tbody>
                        {sortedSuppliers.map(s => (
                          <Tr key={s.id} onClick={() => openSupplier(s)} _hover={{ bg: 'gray.50' }} cursor="pointer">
                            <Td>{s.name}</Td>
                            <Td>{s.reference}</Td>
                            <Td isNumeric>{formatGBP(s.outstanding)}</Td>
                            <Td>
                              <Badge colorScheme={s.notified ? 'green' : 'gray'}>{s.notified ? 'Notified' : 'Non-notified'}</Badge>
                            </Td>
                            <Td>{s.address || '-'}</Td>
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
    <Drawer isOpen={customerOpen} placement="right" onClose={() => setCustomerOpen(false)} size="md">
      <DrawerOverlay />
      <DrawerContent>
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
                  <Stack spacing={1}>
                    <Text fontSize="sm" color="gray.600">{selectedPartyType === 'supplier' ? 'Supplier' : 'Customer'}</Text>
                    <Text fontSize="lg" fontWeight="semibold">{selectedCustomer.name}</Text>
                    <Text fontSize="sm" color="gray.600">Reference: {selectedCustomer.reference}</Text>
                    <Text fontSize="sm" color="gray.600">Outstanding: {formatGBP(selectedCustomer.outstanding)}</Text>
                  </Stack>
                </CardBody>
              </Card>
            )}

            <Card>
              <CardBody>
                <Stack spacing={3}>
                  <Text fontWeight="semibold">Transactions ({customerTx.length})</Text>
                  <TableContainer>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Document</Th>
                          <Th isNumeric>Amount</Th>
                          <Th isNumeric>Remaining</Th>
                          <Th>Due</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {customerTx.map(tx => (
                          <Tr key={tx.id}>
                            <Td>{tx.document}</Td>
                            <Td isNumeric>{formatGBP(tx.amount)}</Td>
                            <Td isNumeric>{formatGBP(tx.remaining)}</Td>
                            <Td>{new Date(tx.dueDate).toLocaleDateString('en-GB')}</Td>
                            <Td>
                              <Badge colorScheme={tx.status==='open'?'yellow':'green'} textTransform="capitalize">{tx.status}</Badge>
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
    </>
  )
}
