import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Stack,
  HStack,
  Badge,
  useToast,
  useClipboard,
  Input,
  FormControl,
  FormLabel,
  Select,
  useDisclosure
} from '@chakra-ui/react'
import { useState } from 'react'
import { Registration, createRegistration } from '../../data/registrations'
import { currencyCodes, CurrencyCode } from '../../data/currencies'

interface RegistrationsModalProps {
  isOpen: boolean
  onClose: () => void
  companyId: string
  registrations: Registration[]
  onRegistrationCreated?: (registration: Registration) => void
}

export default function RegistrationsModal({
  isOpen,
  onClose,
  companyId,
  registrations,
  onRegistrationCreated
}: RegistrationsModalProps) {
  const toast = useToast()
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const { hasCopied, onCopy, setValue } = useClipboard("")
  
  // New registration form state
  const newRegistrationModal = useDisclosure()
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('GBP')
  const [externalReference, setExternalReference] = useState('')

  // Handle copying registration link
  const handleCopyLink = (link: string) => {
    setValue(link)
    onCopy()
    toast({
      title: 'Link copied',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }

  // Create a new registration
  const handleCreateRegistration = () => {
    const newRegistration = createRegistration(
      companyId, 
      currencyCode, 
      externalReference.trim() || undefined
    )
    
    if (onRegistrationCreated) {
      onRegistrationCreated(newRegistration)
    }
    
    toast({
      title: 'Registration created',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    
    // Reset form and close modal
    setCurrencyCode('GBP')
    setExternalReference('')
    newRegistrationModal.onClose()
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Registrations</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Registration Records</Text>
                <Button 
                  colorScheme="blue" 
                  size="sm" 
                  onClick={newRegistrationModal.onOpen}
                >
                  Create New Registration
                </Button>
              </HStack>
              
              {registrations.length === 0 ? (
                <Text color="gray.500">No registrations found for this company.</Text>
              ) : (
                <TableContainer>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Date Created</Th>
                        <Th>Date Closed</Th>
                        <Th>Date Expires</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {registrations.map(registration => (
                        <Tr key={registration.id}>
                          <Td>{formatDate(registration.dateCreated)}</Td>
                          <Td>{formatDate(registration.dateClosed)}</Td>
                          <Td>{formatDate(registration.dateExpires)}</Td>
                          <Td>
                            <Badge 
                              colorScheme={registration.dateClosed ? 'gray' : 'green'}
                            >
                              {registration.dateClosed ? 'Closed' : 'Open'}
                            </Badge>
                          </Td>
                          <Td>
                            <Button 
                              size="xs" 
                              onClick={() => handleCopyLink(registration.registrationLink)}
                            >
                              {hasCopied && selectedRegistration?.id === registration.id ? 'Copied' : 'Copy Link'}
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* New Registration Modal */}
      <Modal isOpen={newRegistrationModal.isOpen} onClose={newRegistrationModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Registration</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Text>Create a new registration for this company.</Text>
              
              <FormControl>
                <FormLabel>Currency Code</FormLabel>
                <Select 
                  value={currencyCode} 
                  onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
                >
                  {currencyCodes.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>External Reference (Optional)</FormLabel>
                <Input 
                  value={externalReference} 
                  onChange={(e) => setExternalReference(e.target.value)}
                  placeholder="Enter external reference"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={newRegistrationModal.onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateRegistration}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}