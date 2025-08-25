import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
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
  Text,
  VStack,
} from '@chakra-ui/react'
import { currencyCodes, type CurrencyCode } from '../../data/currencies'

export type DebtorPoolType = 'Currency' | 'Manual'
export type DebtorPool = {
  name: string
  reference: string
  type: DebtorPoolType
  currencyCode?: CurrencyCode
}

export type CompanyConfig = {
  exports: string[]
  reports: string[]
  pools: DebtorPool[]
}

const EXPORT_OPTIONS = ['Debtors','Debtors Pool','Movements','Movements Pool','Bulk ID','Disapproval'] as const
const REPORT_OPTIONS = ['Retentions PDF','Survey','Ageing Due Date'] as const

export default function EditCompanyDialog({
  isOpen,
  onClose,
  initialName,
  initialEmail,
  initialConfig,
  onSubmit,
}: {
  isOpen: boolean
  onClose: () => void
  initialName: string
  initialEmail: string
  initialConfig: CompanyConfig
  onSubmit: (payload: { name: string; email: string; config: CompanyConfig }) => void
}) {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [exportsSel, setExportsSel] = useState<string[]>(initialConfig.exports || [])
  const [reportsSel, setReportsSel] = useState<string[]>(initialConfig.reports || [])
  const [pools, setPools] = useState<DebtorPool[]>(initialConfig.pools || [])
  const [touched, setTouched] = useState<{[k: string]: boolean}>({})

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setEmail(initialEmail)
      setExportsSel(initialConfig.exports || [])
      setReportsSel(initialConfig.reports || [])
      setPools(initialConfig.pools || [])
      setTouched({})
    }
  }, [isOpen, initialName, initialEmail, initialConfig])

  const errors = useMemo(() => {
    const e: {[k: string]: string | undefined} = {}
    if (!name.trim()) e.name = 'Company name is required'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Invalid email format'
    // pools validations per pool
    pools.forEach((p, idx) => {
      const key = `pool-${idx}`
      if (!p.name.trim()) e[`${key}-name`] = 'Pool name is required'
      if (!/^\d{7}:\d{3}$/.test(p.reference)) e[`${key}-reference`] = 'Reference must be NNNNNNN:NNN'
      if (p.type === 'Currency' && !p.currencyCode) e[`${key}-currency`] = 'Currency code is required'
    })
    return e
  }, [name, email, pools])

  function addPool() {
    setPools(prev => [...prev, { name: '', reference: '', type: 'Manual' }])
  }

  function updatePool(idx: number, patch: Partial<DebtorPool>) {
    setPools(prev => prev.map((p, i) => i === idx ? { ...p, ...patch } : p))
  }

  function removePool(idx: number) {
    setPools(prev => prev.filter((_, i) => i !== idx))
  }

  function submit() {
    setTouched({ name: true, email: true })
    if (Object.values(errors).some(Boolean)) return
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      config: {
        exports: exportsSel,
        reports: reportsSel,
        pools: pools.map(p => ({
          name: p.name.trim(),
          reference: p.reference.trim(),
          type: p.type,
          currencyCode: p.type === 'Currency' ? p.currencyCode : undefined,
        })),
      }
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit company</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={5}>
            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.name && touched.name}>
                <FormLabel>Company name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Ltd" />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.email && touched.email}>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@acme.com" />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
            </Stack>

            <VStack align="stretch" spacing={3}>
              <Text fontWeight="semibold">Exports</Text>
              <CheckboxGroup value={exportsSel} onChange={(v) => setExportsSel(v as string[])}>
                <HStack wrap="wrap" spacing={4}>
                  {EXPORT_OPTIONS.map(opt => (
                    <Checkbox key={opt} value={opt}>{opt}</Checkbox>
                  ))}
                </HStack>
              </CheckboxGroup>
            </VStack>

            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Debtor Pools</Text>
                <Button size="sm" onClick={addPool}>Add Pool</Button>
              </HStack>
              <Stack spacing={4}>
                {pools.length === 0 && (
                  <Text fontSize="sm" color="gray.500">No pools added.</Text>
                )}
                {pools.map((p, idx) => {
                  const key = `pool-${idx}`
                  const nameErr = errors[`${key}-name`]
                  const refErr = errors[`${key}-reference`]
                  const curErr = errors[`${key}-currency`]
                  return (
                    <Stack key={idx} p={3} borderWidth="1px" borderRadius="md" spacing={3}>
                      <HStack justify="space-between">
                        <Badge colorScheme="blue">Pool {idx+1}</Badge>
                        <Button size="xs" variant="ghost" colorScheme="red" onClick={() => removePool(idx)}>Remove</Button>
                      </HStack>
                      <FormControl isInvalid={!!nameErr && touched[key]}> 
                        <FormLabel>Name</FormLabel>
                        <Input value={p.name} onChange={(e) => updatePool(idx, { name: e.target.value })} placeholder="GBP Line" />
                        <FormErrorMessage>{nameErr}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!refErr && touched[key]}> 
                        <FormLabel>Reference</FormLabel>
                        <Input value={p.reference} onChange={(e) => updatePool(idx, { reference: e.target.value })} placeholder="0000987:001" />
                        <FormErrorMessage>{refErr}</FormErrorMessage>
                      </FormControl>
                      <HStack align="start" spacing={4}>
                        <FormControl>
                          <FormLabel>Type</FormLabel>
                          <Select value={p.type} onChange={(e) => updatePool(idx, { type: e.target.value as DebtorPoolType, currencyCode: e.target.value === 'Currency' ? p.currencyCode : undefined })}>
                            <option value="Currency">Currency</option>
                            <option value="Manual">Manual</option>
                          </Select>
                        </FormControl>
                        {p.type === 'Currency' && (
                          <FormControl isInvalid={!!curErr && touched[key]}> 
                            <FormLabel>Currency code</FormLabel>
                            <Select placeholder="Select currency" value={p.currencyCode || ''} onChange={(e) => updatePool(idx, { currencyCode: e.target.value as CurrencyCode })}>
                              {currencyCodes.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </Select>
                            <FormErrorMessage>{curErr}</FormErrorMessage>
                          </FormControl>
                        )}
                      </HStack>
                    </Stack>
                  )
                })}
              </Stack>
            </VStack>

            <VStack align="stretch" spacing={3}>
              <Text fontWeight="semibold">Reports</Text>
              <CheckboxGroup value={reportsSel} onChange={(v) => setReportsSel(v as string[])}>
                <HStack wrap="wrap" spacing={4}>
                  {REPORT_OPTIONS.map(opt => (
                    <Checkbox key={opt} value={opt}>{opt}</Checkbox>
                  ))}
                </HStack>
              </CheckboxGroup>
            </VStack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={submit}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
