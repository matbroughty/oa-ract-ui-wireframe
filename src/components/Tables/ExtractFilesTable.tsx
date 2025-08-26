import { Card, CardBody, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Icon, Input, InputGroup, InputLeftElement, HStack, Box, Text, Flex, Badge } from '@chakra-ui/react'
import { TriangleDownIcon, TriangleUpIcon, SearchIcon } from '@chakra-ui/icons'
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

  return (
    <Card>
      <CardBody>
        <Flex align="center" mb={4} gap={4}>
          <Box flex="1">
            <Text fontWeight="semibold">Waiting Extract Files ({sorted.length})</Text>
          </Box>
          <Box flex="1">
            <InputGroup maxW="320px" ml="auto">
              <InputLeftElement pointerEvents="none">
                <Icon as={SearchIcon} />
              </InputLeftElement>
              <Input placeholder="Search by company, connector, or status…" value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
            </InputGroup>
          </Box>
        </Flex>
        <TableContainer overflowX="auto">
          <Table size="md" variant="simple">
            <Thead>
              <Tr>
                <SortHeader label="Company" k="companyName" />
                <SortHeader label="Connector" k="connector" />
                <SortHeader label="Received Date" k="receivedDate" />
                <SortHeader label="Status" k="status" />
                <Th>Error Message</Th>
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
                    <Badge colorScheme={statusColor(row.status)} variant="subtle">{row.status}</Badge>
                  </Td>
                  <Td>
                    {row.status === 'failed' && row.errorMessage && (
                      <Text color="red.500">{row.errorMessage}</Text>
                    )}
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