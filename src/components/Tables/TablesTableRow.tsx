
import { Badge, HStack, IconButton, Td, Text, Tr, Tooltip, VStack, Icon } from '@chakra-ui/react'
import { EditIcon, SmallCloseIcon, RepeatIcon, TimeIcon, TriangleUpIcon, TriangleDownIcon, InfoIcon } from '@chakra-ui/icons'

export type CompanyRow = {
  id: string
  name: string
  email: string
  reference: string
  lastLoadDate: string // ISO date
  salesBalanceGBP: number
  notifiedSalesBalanceGBP: number
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
  funding?: 'Not funded' | 'Company' | 'Pool'
  hasBalanceChanged?: boolean
  notifiedSalesBalanceChange?: 'increase' | 'decrease' | 'no-change'
  notifiedSalesBalancePercentChange?: number | null
  hasMixedCurrencies?: boolean
  onEdit?: (id: string) => void
  onClear?: (id: string) => void
  onSelect?: (id: string) => void
  onRefresh?: (id: string) => void
  onSnapshot?: (id: string) => void
  onChangeClick?: (id: string) => void
  onFundingClick?: (id: string) => void
  onConnectorClick?: (id: string) => void
}) {
  const { id, name, email, reference, lastLoadDate, salesBalanceGBP, notifiedSalesBalanceGBP, purchaseBalanceGBP, status, onEdit, onClear, onSelect, onRefresh, onSnapshot, onChangeClick, onFundingClick, onConnectorClick, connector, loadStatus, hoverTitle, funding, hasBalanceChanged, notifiedSalesBalanceChange, notifiedSalesBalancePercentChange, hasMixedCurrencies } = props
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
          <HStack spacing={1}>
            <Text fontWeight="semibold">{name}</Text>
            {hasMixedCurrencies && (
              <Tooltip label="This company has customers in multiple currencies">
                <Icon as={InfoIcon} color="blue.500" boxSize={3} />
              </Tooltip>
            )}
          </HStack>
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
        <HStack spacing={1} justifyContent="flex-end">
          <Text>{formatGBP(notifiedSalesBalanceGBP)}</Text>
          {notifiedSalesBalanceChange === 'increase' ? (
            <HStack spacing={0}>
              <Icon as={TriangleUpIcon} color="green.500" />
              {notifiedSalesBalancePercentChange !== null && (
                <Text fontSize="xs" color="green.500">+{notifiedSalesBalancePercentChange}%</Text>
              )}
            </HStack>
          ) : notifiedSalesBalanceChange === 'decrease' ? (
            <HStack spacing={0}>
              <Icon as={TriangleDownIcon} color="red.500" />
              {notifiedSalesBalancePercentChange !== null && (
                <Text fontSize="xs" color="red.500">{notifiedSalesBalancePercentChange}%</Text>
              )}
            </HStack>
          ) : (
            <Text color="gray.500">-</Text>
          )}
        </HStack>
      </Td>
      <Td isNumeric>
        <Text>{formatGBP(purchaseBalanceGBP)}</Text>
      </Td>
      <Td>
        {(funding === 'Pool' || funding === 'Company') ? (
          <Tooltip label="Click to view exports">
            <Badge 
              colorScheme={funding === 'Pool' ? 'purple' : 'blue'} 
              variant="subtle" 
              cursor="pointer"
              onClick={(e) => { 
                e.stopPropagation(); 
                onFundingClick?.(id); 
              }}
            >
              {funding}
            </Badge>
          </Tooltip>
        ) : (
          <Badge colorScheme="gray" variant="subtle">Not funded</Badge>
        )}
      </Td>
      <Td>
        {status === 'desktop' ? (
          <Tooltip label="Click to view Desktop connector details">
            <Badge 
              colorScheme={badgeColor} 
              variant="subtle" 
              cursor="pointer"
              onClick={(e) => { 
                e.stopPropagation(); 
                onConnectorClick?.(id); 
              }}
            >
              {connectorLabel}
            </Badge>
          </Tooltip>
        ) : (
          <Badge colorScheme={badgeColor} variant="subtle">{connectorLabel}</Badge>
        )}
      </Td>
      <Td>
        <Badge colorScheme={statusColor(loadStatus)} variant="subtle">{loadStatus || 'no load'}</Badge>
      </Td>
      <Td textAlign="center">
        {hasBalanceChanged ? (
          <Tooltip label="Click to view transactions">
            <Text 
              color="green.500" 
              fontSize="xl" 
              cursor="pointer" 
              onClick={(e) => { 
                e.stopPropagation(); 
                onChangeClick?.(id); 
              }}
            >
              ✓
            </Text>
          </Tooltip>
        ) : (
          <Text color="gray.500">-</Text>
        )}
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
