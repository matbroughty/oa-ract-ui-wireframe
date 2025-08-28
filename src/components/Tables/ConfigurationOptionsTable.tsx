import { Card, CardBody, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Icon, Input, InputGroup, InputLeftElement, HStack, Box, Text, Flex, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, useToast, IconButton, Tooltip } from '@chakra-ui/react'
import { TriangleDownIcon, TriangleUpIcon, SearchIcon, AddIcon, EditIcon, DeleteIcon, DownloadIcon } from '@chakra-ui/icons'
import ExportButton from '../Common/ExportButton'
import { useMemo, useState } from 'react'
import { configOptions, ConfigOption } from '../../data/configOptions'

type SortKey = keyof Pick<ConfigOption, 'name' | 'value' | 'description' | 'lastUpdated'>

function sortData(data: ConfigOption[], sortKey: SortKey, direction: 'asc' | 'desc') {
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

export default function ConfigurationOptionsTable() {
  const toast = useToast()
  const [data, setData] = useState<ConfigOption[]>(configOptions)
  const [sortKey, setSortKey] = useState<SortKey>('lastUpdated')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')
  const [localSearch, setLocalSearch] = useState('')

  // Add/Edit modal state
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isEditing, setIsEditing] = useState(false)
  const [currentOption, setCurrentOption] = useState<ConfigOption | null>(null)
  const [name, setName] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  // Delete confirmation modal state
  const deleteModal = useDisclosure()
  const [optionToDelete, setOptionToDelete] = useState<ConfigOption | null>(null)

  const searchTerm = localSearch.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!searchTerm) return data
    return data.filter(d => 
      d.name.toLowerCase().includes(searchTerm) ||
      d.value.toLowerCase().includes(searchTerm) ||
      d.description.toLowerCase().includes(searchTerm)
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
    setCurrentOption(null)
    setName('')
    setValue('')
    setDescription('')
    onOpen()
  }

  function handleEditClick(option: ConfigOption) {
    setIsEditing(true)
    setCurrentOption(option)
    setName(option.name)
    setValue(option.value)
    setDescription(option.description)
    onOpen()
  }

  function handleDeleteClick(option: ConfigOption) {
    setOptionToDelete(option)
    deleteModal.onOpen()
  }

  function confirmDelete() {
    if (optionToDelete) {
      setData(prev => prev.filter(r => r.id !== optionToDelete.id))
      toast({
        title: 'Configuration option deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      deleteModal.onClose()
      setOptionToDelete(null)
    }
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast({
        title: 'Invalid name',
        description: 'Name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!value.trim()) {
      toast({
        title: 'Invalid value',
        description: 'Value is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const now = new Date().toISOString()

    if (isEditing && currentOption) {
      // Update existing option
      setData(prev => prev.map(r => r.id === currentOption.id ? {
        ...r,
        name,
        value,
        description,
        lastUpdated: now
      } : r))

      toast({
        title: 'Configuration option updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } else {
      // Add new option
      const newId = String(Math.max(0, ...data.map(d => Number(d.id) || 0)) + 1)

      setData(prev => [...prev, {
        id: newId,
        name,
        value,
        description,
        lastUpdated: now
      }])

      toast({
        title: 'Configuration option added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }

    onClose()
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
    <Card>
      <CardBody>
        <Flex align="center" mb={4} gap={4}>
          <Box flex="1">
            <Text fontWeight="semibold">Configuration Options ({sorted.length})</Text>
          </Box>
          <HStack>
            <Button colorScheme="blue" leftIcon={<AddIcon />} size="sm" onClick={handleAddClick}>
              Add Option
            </Button>
            <ExportButton 
              data={sorted}
              filename="configuration_options.csv"
              headers={[
                { key: 'name', label: 'Name' },
                { key: 'value', label: 'Value' },
                { key: 'description', label: 'Description' },
                { key: 'lastUpdated', label: 'Last Updated' }
              ]}
              size="sm"
            />
          </HStack>
          <Box flex="1">
            <InputGroup maxW="320px" ml="auto">
              <InputLeftElement pointerEvents="none">
                <Icon as={SearchIcon} />
              </InputLeftElement>
              <Input placeholder="Search by name, value, or description…" value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
            </InputGroup>
          </Box>
        </Flex>
        <TableContainer overflowX="auto">
          <Table size="md" variant="simple">
            <Thead>
              <Tr>
                <SortHeader label="Name" k="name" />
                <SortHeader label="Value" k="value" />
                <SortHeader label="Description" k="description" />
                <SortHeader label="Last Updated" k="lastUpdated" />
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sorted.map(row => (
                <Tr key={row.id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <Text fontWeight="semibold">{row.name}</Text>
                  </Td>
                  <Td>
                    <Text>{row.value}</Text>
                  </Td>
                  <Td>
                    <Text>{row.description}</Text>
                  </Td>
                  <Td>
                    <Text>{new Date(row.lastUpdated).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</Text>
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

      {/* Add/Edit Configuration Option Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? 'Edit Configuration Option' : 'Add Configuration Option'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Name</FormLabel>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name (e.g., default-currency)"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Value</FormLabel>
              <Input 
                value={value} 
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Input 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Configuration Option</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {optionToDelete && (
              <Text>
                Are you sure you want to delete the configuration option "{optionToDelete.name}"?
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
