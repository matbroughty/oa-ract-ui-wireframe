import { Card, CardBody, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Icon, Input, InputGroup, InputLeftElement, HStack, Box, Text, Flex, Badge, Spinner, Progress } from '@chakra-ui/react'
import { TriangleDownIcon, TriangleUpIcon, SearchIcon } from '@chakra-ui/icons'
import ExportButton from '../Common/ExportButton'
import { useMemo, useState } from 'react'
import { cloudConnections, CloudConnection } from '../../data/cloudConnections'

type SortKey = keyof Pick<CloudConnection, 'companyName' | 'connector' | 'startDate' | 'status'>

function sortData(data: CloudConnection[], sortKey: SortKey, direction: 'asc' | 'desc') {
  const sorted = [...data].sort((a, b) => {
    let av: any = a[sortKey]
    let bv: any = b[sortKey]
    if (sortKey === 'startDate') {
      av = new Date(a.startDate).getTime()
      bv = new Date(b.startDate).getTime()
    }
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    if (av < bv) return direction === 'asc' ? -1 : 1
    if (av > bv) return direction === 'asc' ? 1 : -1
    return 0
  })
  return sorted
}

export default function CloudConnectionsTable() {
  const [data] = useState<CloudConnection[]>(cloudConnections)
  const [sortKey, setSortKey] = useState<SortKey>('startDate')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')
  const [localSearch, setLocalSearch] = useState('')

  const searchTerm = localSearch.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!searchTerm) return data
    return data.filter(d => 
      d.companyName.toLowerCase().includes(searchTerm) ||
      d.connector.toLowerCase().includes(searchTerm) ||
      d.status.toLowerCase().includes(searchTerm)
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
      case 'EXTRACTING': return 'blue'
      case 'QUEUED': return 'orange'
      default: return 'gray'
    }
  }

  // Calculate wait time in minutes
  function calculateWaitTime(startDate: string): number {
    const started = new Date(startDate).getTime()
    const now = new Date().getTime()
    return Math.floor((now - started) / (1000 * 60))
  }

  // Calculate progress percentage
  const totalItems = data.length
  const extractingItems = data.filter(d => d.status === 'EXTRACTING').length
  const queuedItems = data.filter(d => d.status === 'QUEUED').length
  const progressPercentage = totalItems > 0 ? (extractingItems / totalItems) * 100 : 0

  return (
    <Card>
      <CardBody>
        <Flex align="center" mb={4} gap={4}>
          <Box flex="1">
            <Text fontWeight="semibold">Processing Cloud Connections ({sorted.length})</Text>
          </Box>
          <Box flex="1">
            <HStack spacing={4} justifyContent="flex-end">
              <ExportButton 
                data={sorted}
                filename="cloud_connections.csv"
                headers={[
                  { key: 'companyName', label: 'Company' },
                  { key: 'connector', label: 'Connector' },
                  { key: 'startDate', label: 'Start Date' },
                  { key: 'status', label: 'Status' },
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

        {/* Progress bar showing how far through the processing the system has got */}
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
                <SortHeader label="Start Date" k="startDate" />
                <SortHeader label="Status" k="status" />
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
                    <Badge colorScheme="purple" variant="subtle">{row.connector}</Badge>
                  </Td>
                  <Td>
                    <Text>{new Date(row.startDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</Text>
                  </Td>
                  <Td>
                    {row.status === 'EXTRACTING' ? (
                      <HStack>
                        <Spinner size="sm" color="blue.500" />
                        <Badge colorScheme={statusColor(row.status)} variant="subtle">EXTRACTING</Badge>
                      </HStack>
                    ) : (
                      <Badge colorScheme={statusColor(row.status)} variant="subtle">{row.status}</Badge>
                    )}
                  </Td>
                  <Td>
                    <Text>{calculateWaitTime(row.startDate)}</Text>
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