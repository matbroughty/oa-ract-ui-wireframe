import { Card, CardBody, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Icon, Input, InputGroup, InputLeftElement, HStack, Box, Text, Flex, Badge, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Select, useToast, IconButton, Tooltip } from '@chakra-ui/react'
import { TriangleDownIcon, TriangleUpIcon, SearchIcon, AddIcon, EditIcon, DeleteIcon, DownloadIcon } from '@chakra-ui/icons'
import ExportButton from '../Common/ExportButton'
import { useMemo, useState } from 'react'
import { exchangeRates, ExchangeRate } from '../../data/exchangeRates'
import { currencyCodes, CurrencyCode } from '../../data/currencies'

type SortKey = keyof Pick<ExchangeRate, 'fromCurrency' | 'toCurrency' | 'rate' | 'lastUpdated' | 'source'>

function sortData(data: ExchangeRate[], sortKey: SortKey, direction: 'asc' | 'desc') {
  const sorted = [...data].sort((a, b) => {
    let av: any = a[sortKey]
    let bv: any = b[sortKey]
    if (sortKey === 'lastUpdated') {
      av = new Date(a.lastUpdated).getTime()
      bv = new Date(b.lastUpdated).getTime()
    }
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    if (av < bv) return direction === 'asc' ? -1 : 1
    if (av > bv) return direction === 'asc' ? 1 : -1
    return 0
  })
  return sorted
}

export default function ExchangeRatesTable() {
  const toast = useToast()
  const [data, setData] = useState<ExchangeRate[]>(exchangeRates)
  const [sortKey, setSortKey] = useState<SortKey>('lastUpdated')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')
  const [localSearch, setLocalSearch] = useState('')

  // Add/Edit modal state
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isEditing, setIsEditing] = useState(false)
  const [currentRate, setCurrentRate] = useState<ExchangeRate | null>(null)
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('GBP')
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('USD')
  const [rate, setRate] = useState<string>('1.0')
  const [source, setSource] = useState<'manual' | 'lendscape' | 'openexchangerates'>('manual')

  // Import modal state
  const importModal = useDisclosure()
  const [importSource, setImportSource] = useState<'lendscape' | 'openexchangerates'>('lendscape')

  // Delete confirmation modal state
  const deleteModal = useDisclosure()
  const [rateToDelete, setRateToDelete] = useState<ExchangeRate | null>(null)

  const searchTerm = localSearch.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!searchTerm) return data
    return data.filter(d => 
      d.fromCurrency.toLowerCase().includes(searchTerm) ||
      d.toCurrency.toLowerCase().includes(searchTerm) ||
      d.source.toLowerCase().includes(searchTerm)
    )
  }, [data, searchTerm])

  const sorted = useMemo(() => sortData(filtered, sortKey, sortDir), [filtered, sortKey, sortDir])

  function onSortClick(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function handleAddClick() {
    setIsEditing(false)
    setCurrentRate(null)
    setFromCurrency('GBP')
    setToCurrency('USD')
    setRate('1.0')
    setSource('manual')
    onOpen()
  }

  function handleEditClick(rate: ExchangeRate) {
    setIsEditing(true)
    setCurrentRate(rate)
    setFromCurrency(rate.fromCurrency)
    setToCurrency(rate.toCurrency)
    setRate(rate.rate.toString())
    setSource(rate.source)
    onOpen()
  }

  function handleDeleteClick(rate: ExchangeRate) {
    setRateToDelete(rate)
    deleteModal.onOpen()
  }

  function confirmDelete() {
    if (rateToDelete) {
      setData(prev => prev.filter(r => r.id !== rateToDelete.id))
      toast({
        title: 'Exchange rate deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      deleteModal.onClose()
      setRateToDelete(null)
    }
  }

  function handleSubmit() {
    const rateValue = parseFloat(rate)
    if (isNaN(rateValue) || rateValue <= 0) {
      toast({
        title: 'Invalid rate',
        description: 'Rate must be a positive number',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (fromCurrency === toCurrency) {
      toast({
        title: 'Invalid currencies',
        description: 'From and To currencies must be different',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const now = new Date().toISOString()

    if (isEditing && currentRate) {
      // Update existing rate
      setData(prev => prev.map(r => r.id === currentRate.id ? {
        ...r,
        fromCurrency,
        toCurrency,
        rate: rateValue,
        lastUpdated: now,
        source
      } : r))

      toast({
        title: 'Exchange rate updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } else {
      // Add new rate
      const newId = String(Math.max(0, ...data.map(d => Number(d.id) || 0)) + 1)

      setData(prev => [...prev, {
        id: newId,
        fromCurrency,
        toCurrency,
        rate: rateValue,
        lastUpdated: now,
        source
      }])

      toast({
        title: 'Exchange rate added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }

    onClose()
  }

  function handleImport() {
    // Simulate importing exchange rates
    const now = new Date().toISOString()
    const newRates: ExchangeRate[] = []

    // Generate some random rates for demonstration
    if (importSource === 'lendscape') {
      // Simulate Lendscape import with 3 new rates
      const baseCurrencies = ['GBP', 'USD', 'EUR']
      const targetCurrencies = ['JPY', 'CAD', 'AUD']

      for (let i = 0; i < 3; i++) {
        const newId = String(Math.max(0, ...data.map(d => Number(d.id) || 0)) + i + 1)
        const fromCurrency = baseCurrencies[i] as CurrencyCode
        const toCurrency = targetCurrencies[i] as CurrencyCode
        const rate = Math.round((1 + Math.random() * 2) * 100) / 100

        newRates.push({
          id: newId,
          fromCurrency,
          toCurrency,
          rate,
          lastUpdated: now,
          source: 'lendscape'
        })
      }
    } else {
      // Simulate OpenExchangeRates import with 3 new rates
      const baseCurrencies = ['USD', 'EUR', 'GBP']
      const targetCurrencies = ['CHF', 'SEK', 'NOK']

      for (let i = 0; i < 3; i++) {
        const newId = String(Math.max(0, ...data.map(d => Number(d.id) || 0)) + i + 1)
        const fromCurrency = baseCurrencies[i] as CurrencyCode
        const toCurrency = targetCurrencies[i] as CurrencyCode
        const rate = Math.round((0.5 + Math.random() * 1.5) * 100) / 100

        newRates.push({
          id: newId,
          fromCurrency,
          toCurrency,
          rate,
          lastUpdated: now,
          source: 'openexchangerates'
        })
      }
    }

    // Add new rates to the data
    setData(prev => {
      // Filter out any existing rates with the same currency pairs
      const filtered = prev.filter(r => !newRates.some(nr => 
        nr.fromCurrency === r.fromCurrency && nr.toCurrency === r.toCurrency
      ))

      return [...filtered, ...newRates]
    })

    toast({
      title: 'Exchange rates imported',
      description: `Successfully imported ${newRates.length} rates from ${importSource === 'lendscape' ? 'Lendscape RF' : 'openexchangerates.org'}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    importModal.onClose()
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

  function sourceColor(source: string) {
    switch (source) {
      case 'manual': return 'blue'
      case 'lendscape': return 'green'
      case 'openexchangerates': return 'purple'
      default: return 'gray'
    }
  }

  function formatSource(source: string) {
    switch (source) {
      case 'manual': return 'Manual'
      case 'lendscape': return 'Lendscape RF'
      case 'openexchangerates': return 'OpenExchangeRates'
      default: return source
    }
  }

  return (
    <Card>
      <CardBody>
        <Flex align="center" mb={4} gap={4}>
          <Box flex="1">
            <Text fontWeight="semibold">Exchange Rates ({sorted.length})</Text>
          </Box>
          <HStack>
            <Button colorScheme="green" size="sm" onClick={() => {
              setImportSource('lendscape')
              importModal.onOpen()
            }}>
              Import from Lendscape
            </Button>
            <Button colorScheme="purple" size="sm" onClick={() => {
              setImportSource('openexchangerates')
              importModal.onOpen()
            }}>
              Import from OpenExchangeRates
            </Button>
            <Button colorScheme="blue" leftIcon={<AddIcon />} size="sm" onClick={handleAddClick}>
              Add Rate
            </Button>
            <ExportButton 
              data={sorted}
              filename="exchange_rates.csv"
              headers={[
                { key: 'fromCurrency', label: 'From Currency' },
                { key: 'toCurrency', label: 'To Currency' },
                { key: 'rate', label: 'Rate' },
                { key: 'lastUpdated', label: 'Last Updated' },
                { key: 'source', label: 'Source' }
              ]}
              size="sm"
            />
          </HStack>
          <Box flex="1">
            <InputGroup maxW="320px" ml="auto">
              <InputLeftElement pointerEvents="none">
                <Icon as={SearchIcon} />
              </InputLeftElement>
              <Input placeholder="Search by currency or source…" value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
            </InputGroup>
          </Box>
        </Flex>
        <TableContainer overflowX="auto">
          <Table size="md" variant="simple">
            <Thead>
              <Tr>
                <SortHeader label="From Currency" k="fromCurrency" />
                <SortHeader label="To Currency" k="toCurrency" />
                <SortHeader label="Rate" k="rate" />
                <SortHeader label="Last Updated" k="lastUpdated" />
                <SortHeader label="Source" k="source" />
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sorted.map(row => (
                <Tr key={row.id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <Text fontWeight="semibold">{row.fromCurrency}</Text>
                  </Td>
                  <Td>
                    <Text fontWeight="semibold">{row.toCurrency}</Text>
                  </Td>
                  <Td>
                    <Text>{row.rate.toFixed(6)}</Text>
                  </Td>
                  <Td>
                    <Text>{new Date(row.lastUpdated).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={sourceColor(row.source)} variant="subtle">{formatSource(row.source)}</Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="Edit">
                        <IconButton
                          aria-label="Edit"
                          icon={<EditIcon />}
                          size="sm"
                          onClick={() => handleEditClick(row)}
                        />
                      </Tooltip>
                      <Tooltip label="Delete">
                        <IconButton
                          aria-label="Delete"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDeleteClick(row)}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>

      {/* Add/Edit Exchange Rate Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? 'Edit Exchange Rate' : 'Add Exchange Rate'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>From Currency</FormLabel>
              <Select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}>
                {currencyCodes.map(code => (
                  <option key={`from-${code}`} value={code}>{code}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>To Currency</FormLabel>
              <Select value={toCurrency} onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}>
                {currencyCodes.map(code => (
                  <option key={`to-${code}`} value={code}>{code}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Exchange Rate</FormLabel>
              <Input 
                type="number" 
                step="0.000001" 
                min="0.000001" 
                value={rate} 
                onChange={(e) => setRate(e.target.value)}
                placeholder="Enter exchange rate"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Source</FormLabel>
              <Select value={source} onChange={(e) => setSource(e.target.value as 'manual' | 'lendscape' | 'openexchangerates')}>
                <option value="manual">Manual</option>
                <option value="lendscape">Lendscape RF</option>
                <option value="openexchangerates">OpenExchangeRates</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {isEditing ? 'Update' : 'Add'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Import Exchange Rates Modal */}
      <Modal isOpen={importModal.isOpen} onClose={importModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Import Exchange Rates</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Import exchange rates from {importSource === 'lendscape' ? 'Lendscape RF' : 'openexchangerates.org'}. 
              This will update any existing rates with the same currency pairs.
            </Text>
            <FormControl mb={4}>
              <FormLabel>Source</FormLabel>
              <Select value={importSource} onChange={(e) => setImportSource(e.target.value as 'lendscape' | 'openexchangerates')}>
                <option value="lendscape">Lendscape RF</option>
                <option value="openexchangerates">OpenExchangeRates</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={importModal.onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleImport}>
              Import
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Exchange Rate</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {rateToDelete && (
              <Text>
                Are you sure you want to delete the exchange rate from {rateToDelete.fromCurrency} to {rateToDelete.toCurrency}?
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={deleteModal.onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  )
}
