
import { Card, CardBody, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Icon, Input, InputGroup, InputLeftElement, HStack, Box, Text, Flex, useDisclosure, Button, Link, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useClipboard, Stack, Checkbox, Select, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Badge, Divider, useToast } from '@chakra-ui/react'
import { TriangleDownIcon, TriangleUpIcon, SearchIcon, AddIcon } from '@chakra-ui/icons'
import { useMemo, useState } from 'react'
import TablesTableRow, { CompanyRow } from '../components/Tables/TablesTableRow'
import { companies as seedCompanies } from '../data/companies'
import CompanyPanel from '../components/Company/CompanyPanel'
import { getCompanyDetails } from '../data/companyDetails'
import CreateCompanyDialog, { CreateCompanyPayload } from '../components/Company/CreateCompanyDialog'
import EditCompanyDialog, { CompanyConfig } from '../components/Company/EditCompanyDialog'

type SortKey = keyof Pick<CompanyRow,'name'|'reference'|'lastLoadDate'|'salesBalanceGBP'|'purchaseBalanceGBP'|'status'>

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
  const [data, setData] = useState<CompanyRow[]>(seedCompanies as unknown as CompanyRow[])
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
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
      setData(prev => prev.map(r => r.id === clearTarget.id ? { ...r, lastLoadDate: snap, salesBalanceGBP: 0, purchaseBalanceGBP: 0 } : r))
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
          </Box>
          <Box flex="1" textAlign="center">
            <Button colorScheme="blue" onClick={createDialog.onOpen} leftIcon={<AddIcon />}>Create new company</Button>
          </Box>
          <Box flex="1">
            <InputGroup maxW="320px" ml="auto">
              <InputLeftElement pointerEvents="none">
                <Icon as={SearchIcon} />
              </InputLeftElement>
              <Input placeholder="Search by name or reference…" value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
            </InputGroup>
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
                <SortHeader label="Purchase Balance" k="purchaseBalanceGBP" />
                <SortHeader label="CONNECTOR" k="status" />
                <Th>Status</Th>
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
        transactions={details.transactions}
        customers={details.customers}
      />
    )}
    </>
  )
}
