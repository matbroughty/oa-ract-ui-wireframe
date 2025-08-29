import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  HStack,
} from '@chakra-ui/react'
import { currencyCodes, type CurrencyCode } from '../../data/currencies'

export type CreateCompanyPayload = {
  name: string
  reference: string
  email: string
  externalReference?: string
  currencyCode: CurrencyCode
  contactName?: string
  internalName?: string
  createRegistration: boolean
}

export default function CreateCompanyDialog({
  isOpen,
  onClose,
  onSubmit,
  existingCompanies = [],
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreateCompanyPayload) => void
  existingCompanies?: Array<{ id: string; name: string; reference: string }>
}) {
  const [name, setName] = useState('')
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')
  const [externalReference, setExternalReference] = useState('')
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('GBP')
  const [contactName, setContactName] = useState('')
  const [internalName, setInternalName] = useState('')
  const [createRegistration, setCreateRegistration] = useState(true)
  const [useExistingCompany, setUseExistingCompany] = useState(false)

  const [touched, setTouched] = useState<{[k: string]: boolean}>({})

  useEffect(() => {
    if (isOpen) {
      setName('')
      setReference('')
      setEmail('')
      setExternalReference('')
      setCurrencyCode('GBP')
      setContactName('')
      setInternalName('')
      setCreateRegistration(true)
      setUseExistingCompany(false)
      setTouched({})
    }
  }, [isOpen])

  const errors = useMemo(() => {
    const e: {[k: string]: string | undefined} = {}
    if (!name.trim()) e.name = 'Company name is required'
    if (!reference.trim()) e.reference = 'Reference is required'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Invalid email format'
    return e
  }, [name, reference, email])

  function submit() {
    setTouched({ name: true, reference: true, email: true })
    if (Object.values(errors).some(Boolean)) return
    onSubmit({
      name: name.trim(),
      reference: reference.trim(),
      email: email.trim(),
      externalReference: externalReference.trim() || undefined,
      currencyCode,
      contactName: contactName.trim() || undefined,
      internalName: internalName.trim() || undefined,
      createRegistration,
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create new company</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl isInvalid={!!errors.name && touched.name}>
              <HStack justify="space-between" align="center">
                <FormLabel mb={0}>Company name</FormLabel>
                <Checkbox 
                  isChecked={useExistingCompany} 
                  onChange={(e) => setUseExistingCompany(e.target.checked)}
                  size="sm"
                >
                  Use existing company
                </Checkbox>
              </HStack>
              {useExistingCompany ? (
                <Select 
                  value={name} 
                  onChange={(e) => {
                    setName(e.target.value);
                    // Find the selected company
                    const selectedCompany = existingCompanies.find(c => c.name === e.target.value);
                    if (selectedCompany) {
                      // Set reference to the part before the first '/'
                      const refParts = selectedCompany.reference.split('/');
                      setReference(refParts[0]);
                    }
                  }}
                  placeholder="Select an existing company"
                >
                  {existingCompanies.map(company => (
                    <option key={company.id} value={company.name}>{company.name}</option>
                  ))}
                </Select>
              ) : (
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Ltd" />
              )}
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.reference && touched.reference}>
              <FormLabel>Reference</FormLabel>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="123456/001" />
              <FormErrorMessage>{errors.reference}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.email && touched.email}>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@acme.com" />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>External reference</FormLabel>
              <Input value={externalReference} onChange={(e) => setExternalReference(e.target.value)} placeholder="Ext-Ref-001" />
            </FormControl>
            <FormControl>
              <FormLabel>Internal Name</FormLabel>
              <Input value={internalName} onChange={(e) => setInternalName(e.target.value)} placeholder="Internal name (optional)" />
            </FormControl>
            <FormControl>
              <FormLabel>Currency code</FormLabel>
              <Select value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}>
                {currencyCodes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Contact name</FormLabel>
              <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Jane Smith" />
            </FormControl>
            <Checkbox isChecked={createRegistration} onChange={(e) => setCreateRegistration(e.target.checked)}>
              Create registration
            </Checkbox>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={submit}>Submit</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
