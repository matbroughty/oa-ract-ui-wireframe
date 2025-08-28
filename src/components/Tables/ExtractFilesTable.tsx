import { Card, CardBody, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Icon, Input, InputGroup, InputLeftElement, HStack, Box, Text, Flex, Badge, Spinner, Progress } from '@chakra-ui/react'
import { TriangleDownIcon, TriangleUpIcon, SearchIcon, DownloadIcon } from '@chakra-ui/icons'
import ExportButton from '../Common/ExportButton'
import { useMemo, useState } from 'react'
import { extractFiles, ExtractFile } from '../../data/extractFiles'

type SortKey = keyof Pick<ExtractFile, 'companyName' | 'connector' | 'receivedDate' | 'status'>

function sortData(data: ExtractFile[], sortKey: SortKey, direction: 'asc' | 'desc') {
  const sorted = [...data].sort((a, b) => {
    let av: any = a[sortKey]
    let bv: any = b[sortKey]
    if (sortKey === 'receivedDate') {
      av = new Date(a.receivedDate).getTime()
      bv = new Date(b.receivedDate).getTime()
    }
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    if (av < bv) return direction === 'asc' ? -1 : 1
    if (av > bv) return direction === 'asc' ? 1 : -1
    return 0
  })
  return sorted
}

export default function ExtractFilesTable() {
  const [data] = useState<ExtractFile[]>(extractFiles)
  const [sortKey, setSortKey] = useState<SortKey>('receivedDate')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')
  const [localSearch, setLocalSearch] = useState('')

  const searchTerm = localSearch.trim().toLowerCase()

  // Filter to only show QUEUED and LOADING items
  const queuedAndLoading = useMemo(() => {
    return data.filter(d => d.status === 'queued' || d.status === 'loading')
  }, [data])

  const filtered = useMemo(() => {
    if (!searchTerm) return queuedAndLoading
    return queuedAndLoading.filter(d => 
      d.companyName.toLowerCase().includes(searchTerm) ||
      d.connector.toLowerCase().includes(searchTerm) ||
      d.status.toLowerCase().includes(searchTerm)
    )
  }, [queuedAndLoading, searchTerm])

  const sorted = useMemo(() => sortData(filtered, sortKey, sortDir), [filtered, sortKey, sortDir])

  function onSortClick(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
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

  function statusColor(status: string) {
    switch (status) {
      case 'loaded': return 'green'
      case 'loading': return 'blue'
      case 'queued': return 'orange'
      case 'failed': return 'red'
      default: return 'gray'
    }
  }

  function formatConnector(connector: string) {
    switch (connector) {
      case 'native': return 'Native Cloud'
      case 'codat': return 'Codat'
      case 'validis': return 'Validis'
      default: return connector
    }
  }

  // Calculate wait time in minutes
  function calculateWaitTime(receivedDate: string): number {
    const received = new Date(receivedDate).getTime()
    const now = new Date().getTime()
    return Math.floor((now - received) / (1000 * 60))
  }

  // Calculate progress percentage
  const totalItems = data.filter(d => d.status === 'queued' || d.status === 'loading').length
  const loadingItems = data.filter(d => d.status === 'loading').length
  const queuedItems = data.filter(d => d.status === 'queued').length
  const progressPercentage = totalItems > 0 ? ((totalItems - queuedItems) / totalItems) * 100 : 100

  return (
    <Card>
      <CardBody>
        <Flex align="center" mb={4} gap={4}>
          <Box flex="1">
            <Text fontWeight="semibold">Waiting Extract Files ({sorted.length})</Text>
          </Box>
          <Box flex="1">
            <HStack spacing={4} justifyContent="flex-end">
              <ExportButton 
                data={sorted}
                filename="extract_files.csv"
                headers={[
                  { key: 'companyName', label: 'Company' },
                  { key: 'connector', label: 'Connector' },
                  { key: 'receivedDate', label: 'Received Date' },
                  { key: 'status', label: 'Status' },
                  { key: 'size', label: 'Size' },
                  { key: 'waitTime', label: 'Wait Time (min)' }
                ]}
                size="sm"
              />
              <InputGroup maxW="320px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={SearchIcon} />
                </InputLeftElement>
                <Input placeholder="Search by company, connector, or status…" value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
              </InputGroup>
            </HStack>
          </Box>
        </Flex>

        {/* Progress bar showing how far through the queued list the system has got */}
        <Box mb={4}>
          <Text fontSize="sm" mb={1}>Processing progress: {Math.round(progressPercentage)}%</Text>
          <Progress value={progressPercentage} size="sm" colorScheme="blue" borderRadius="md" />
        </Box>
        <TableContainer overflowX="auto">
          <Table size="md" variant="simple">
            <Thead>
              <Tr>
                <SortHeader label="Company" k="companyName" />
                <SortHeader label="Connector" k="connector" />
                <SortHeader label="Received Date" k="receivedDate" />
                <SortHeader label="Status" k="status" />
                <Th>Size</Th>
                <Th>Wait Time (min)</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sorted.map(row => (
                <Tr key={row.id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <Text fontWeight="semibold">{row.companyName}</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme="purple" variant="subtle">{formatConnector(row.connector)}</Badge>
                  </Td>
                  <Td>
                    <Text>{new Date(row.receivedDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</Text>
                  </Td>
                  <Td>
                    {row.status === 'loading' ? (
                      <HStack>
                        <Spinner size="sm" color="blue.500" />
                        <Badge colorScheme={statusColor(row.status)} variant="subtle">loading</Badge>
                      </HStack>
                    ) : (
                      <Badge colorScheme={statusColor(row.status)} variant="subtle">{row.status}</Badge>
                    )}
                  </Td>
                  <Td>
                    <Badge colorScheme="gray" variant="subtle">{row.size}</Badge>
                  </Td>
                  <Td>
                    <Text>{calculateWaitTime(row.receivedDate)}</Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
    </Card>
  )
}
