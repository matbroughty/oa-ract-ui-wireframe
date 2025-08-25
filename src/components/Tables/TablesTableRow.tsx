
import { Badge, HStack, IconButton, Td, Text, Tr, Tooltip, VStack } from '@chakra-ui/react'
import { EditIcon, SmallCloseIcon, RepeatIcon, TimeIcon } from '@chakra-ui/icons'

export type CompanyRow = {
  id: string
  name: string
  email: string
  reference: string
  lastLoadDate: string // ISO date
  salesBalanceGBP: number
  purchaseBalanceGBP: number
  status: 'cloud' | 'desktop'
}

function formatGBP(value: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)
}

export default function TablesTableRow(props: CompanyRow & {
  connector?: 'native' | 'codat' | 'validis'
  loadStatus?: 'loaded' | 'requested' | 'queued' | 'no load'
  hoverTitle?: string
  onEdit?: (id: string) => void
  onClear?: (id: string) => void
  onSelect?: (id: string) => void
  onRefresh?: (id: string) => void
  onSnapshot?: (id: string) => void
}) {
  const { id, name, email, reference, lastLoadDate, salesBalanceGBP, purchaseBalanceGBP, status, onEdit, onClear, onSelect, onRefresh, onSnapshot, connector, loadStatus, hoverTitle } = props
  const isCloud = status === 'cloud'
  const badgeColor = isCloud ? 'green' : 'gray'
  const connectorLabel = isCloud ? (connector === 'native' ? 'Native Cloud' : connector === 'codat' ? 'Codat' : connector === 'validis' ? 'Validis' : 'Cloud') : 'Desktop'

  function handleRowClick() {
    onSelect?.(id)
  }

  function statusColor(status?: string) {
    switch (status) {
      case 'loaded': return 'green'
      case 'requested': return 'blue'
      case 'queued': return 'orange'
      case 'no load': return 'gray'
      default: return 'gray'
    }
  }

  return (
    <Tr onClick={handleRowClick} _hover={{ bg: 'gray.50' }} cursor="pointer" title={hoverTitle}>
      <Td>
        <VStack align="start" spacing={0.5}>
          <Text fontWeight="semibold">{name}</Text>
          <Text fontSize="sm" color="gray.500">{email}</Text>
        </VStack>
      </Td>
      <Td>
        <Text>{reference}</Text>
      </Td>
      <Td>
        <Text>{new Date(lastLoadDate).toLocaleDateString('en-GB')}</Text>
      </Td>
      <Td isNumeric>
        <Text>{formatGBP(salesBalanceGBP)}</Text>
      </Td>
      <Td isNumeric>
        <Text>{formatGBP(purchaseBalanceGBP)}</Text>
      </Td>
      <Td>
        <Badge colorScheme={badgeColor} variant="subtle">{connectorLabel}</Badge>
      </Td>
      <Td>
        <Badge colorScheme={statusColor(loadStatus)} variant="subtle">{loadStatus || 'no load'}</Badge>
      </Td>
      <Td>
        <HStack>
          {(salesBalanceGBP !== 0 || purchaseBalanceGBP !== 0) && (
            <Tooltip label="Snapshots">
              <IconButton aria-label="Snapshots" size="sm" icon={<TimeIcon />} onClick={(e) => { e.stopPropagation(); onSnapshot?.(id) }} />
            </Tooltip>
          )}
          {isCloud && (
            <Tooltip label="Refresh cloud data">
              <IconButton aria-label="Refresh" size="sm" icon={<RepeatIcon />} onClick={(e) => { e.stopPropagation(); onRefresh?.(id) }} />
            </Tooltip>
          )}
          <Tooltip label="Edit">
            <IconButton aria-label="Edit" size="sm" icon={<EditIcon />} onClick={(e) => { e.stopPropagation(); onEdit?.(id) }} />
          </Tooltip>
          <Tooltip label="Clear">
            <IconButton aria-label="Clear" size="sm" icon={<SmallCloseIcon />} onClick={(e) => { e.stopPropagation(); onClear?.(id) }} />
          </Tooltip>
        </HStack>
      </Td>
    </Tr>
  )
}
