import { Box, Flex, Text, Table, Thead, Tbody, Tr, Th, Td, Divider, Badge, useColorModeValue } from '@chakra-ui/react'
import { useState } from 'react'

// Sample data for sales ledger items
const sampleSalesLedgerItems = [
  {
    id: '1',
    date: '2025-08-15',
    documentDate: '2025-08-15',
    reference: 'INV-001',
    description: 'Product Sale',
    amount: 1250.00,
    outstandingBalance: 1250.00,
    status: 'Pending',
    dueDate: '2025-09-15',
    paymentMethod: 'Bank Transfer',
    notes: 'Awaiting payment',
    type: 'Invoice',
    customerName: 'Acme Corporation',
    customerReference: 'ACME001',
    customerEmail: 'accounts@acme.com',
    customerPhone: '01234 567890',
    customerAddress: '123 Business Park, London, EC1A 1BB'
  },
  {
    id: '2',
    date: '2025-08-20',
    documentDate: '2025-08-20',
    reference: 'INV-002',
    description: 'Service Fee',
    amount: 750.50,
    outstandingBalance: 750.50,
    status: 'Pending',
    dueDate: '2025-09-20',
    paymentMethod: 'Credit Card',
    notes: 'Awaiting payment confirmation',
    type: 'Invoice',
    customerName: 'TechSolutions Ltd',
    customerReference: 'TECH005',
    customerEmail: 'finance@techsolutions.com',
    customerPhone: '01234 123456',
    customerAddress: '456 Tech Hub, Manchester, M1 1AB'
  },
  {
    id: '3',
    date: '2025-08-25',
    documentDate: '2025-08-25',
    reference: 'INV-003',
    description: 'Consulting Services',
    amount: 2500.00,
    outstandingBalance: 2500.00,
    status: 'Overdue',
    dueDate: '2025-09-10',
    paymentMethod: 'Check',
    notes: 'Payment reminder sent',
    type: 'Invoice',
    customerName: 'Global Enterprises',
    customerReference: 'GLOB123',
    customerEmail: 'ar@globalenterprises.com',
    customerPhone: '01234 987654',
    customerAddress: '789 Corporate Tower, Birmingham, B1 1TF'
  },
  {
    id: '4',
    date: '2025-09-01',
    documentDate: '2025-09-01',
    reference: 'DA-001',
    description: 'Additional Services',
    amount: 350.75,
    outstandingBalance: 350.75,
    status: 'Pending',
    dueDate: '2025-10-01',
    paymentMethod: 'Bank Transfer',
    notes: 'Adjustment for additional services',
    type: 'Debit Adjustment',
    customerName: 'Acme Corporation',
    customerReference: 'ACME001',
    customerEmail: 'accounts@acme.com',
    customerPhone: '01234 567890',
    customerAddress: '123 Business Park, London, EC1A 1BB'
  },
  {
    id: '5',
    date: '2025-09-05',
    documentDate: '2025-09-05',
    reference: 'CN-001',
    description: 'Returned Products',
    amount: -450.00,
    outstandingBalance: -450.00,
    status: 'Pending',
    dueDate: '2025-10-05',
    paymentMethod: 'Credit Note',
    notes: 'Credit for returned products',
    type: 'Credit Note',
    customerName: 'TechSolutions Ltd',
    customerReference: 'TECH005',
    customerEmail: 'finance@techsolutions.com',
    customerPhone: '01234 123456',
    customerAddress: '456 Tech Hub, Manchester, M1 1AB'
  },
  {
    id: '6',
    date: '2025-09-10',
    documentDate: '2025-09-10',
    reference: 'PMT-001',
    description: 'Partial Payment',
    amount: -800.00,
    outstandingBalance: -800.00,
    status: 'Pending',
    dueDate: '2025-09-10',
    paymentMethod: 'Bank Transfer',
    notes: 'Partial payment received',
    type: 'Cash',
    customerName: 'Global Enterprises',
    customerReference: 'GLOB123',
    customerEmail: 'ar@globalenterprises.com',
    customerPhone: '01234 987654',
    customerAddress: '789 Corporate Tower, Birmingham, B1 1TF'
  },
  {
    id: '7',
    date: '2025-09-15',
    documentDate: '2025-09-15',
    reference: 'CA-001',
    description: 'Discount Applied',
    amount: -125.00,
    outstandingBalance: -125.00,
    status: 'Pending',
    dueDate: '2025-09-15',
    paymentMethod: 'Credit Adjustment',
    notes: 'Discount applied for early payment',
    type: 'Credit Adjustment',
    customerName: 'Acme Corporation',
    customerReference: 'ACME001',
    customerEmail: 'accounts@acme.com',
    customerPhone: '01234 567890',
    customerAddress: '123 Business Park, London, EC1A 1BB'
  }
]

type SalesLedgerItem = typeof sampleSalesLedgerItems[0]

interface SalesLedgerPanelProps {
  companyId: string
  companyName: string
}

export default function SalesLedgerPanel({ companyId, companyName }: SalesLedgerPanelProps) {
  const [selectedItem, setSelectedItem] = useState<SalesLedgerItem | null>(null)
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // In a real application, you would fetch the sales ledger items for the company
  // For now, we'll use the sample data and filter to only show PENDING or OVERDUE items
  const salesLedgerItems = sampleSalesLedgerItems.filter(item => 
    item.status === 'Pending' || item.status === 'Overdue'
  )

  function handleRowClick(item: SalesLedgerItem) {
    setSelectedItem(item)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'Paid': return 'green'
      case 'Pending': return 'orange'
      case 'Overdue': return 'red'
      default: return 'gray'
    }
  }

  // Calculate the total outstanding balance
  const totalOutstandingBalance = salesLedgerItems.reduce((sum, item) => sum + item.outstandingBalance, 0)

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Open Sales Ledger Items for {companyName} ({salesLedgerItems.length} items, {formatCurrency(totalOutstandingBalance)} total)
      </Text>

      {/* Master: Transactions Table */}
      <Box mb={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor} overflow="hidden">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Customer Name</Th>
              <Th>Customer Reference</Th>
              <Th>Document Date</Th>
              <Th>Due Date</Th>
              <Th>Reference</Th>
              <Th isNumeric>Amount</Th>
              <Th isNumeric>Outstanding Balance</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {salesLedgerItems.map(item => (
              <Tr 
                key={item.id} 
                onClick={() => handleRowClick(item)} 
                cursor="pointer" 
                bg={selectedItem?.id === item.id ? 'gray.100' : undefined}
                _hover={{ bg: 'gray.50' }}
              >
                <Td>{item.type}</Td>
                <Td>{item.customerName}</Td>
                <Td>{item.customerReference}</Td>
                <Td>{formatDate(item.documentDate)}</Td>
                <Td>{formatDate(item.dueDate)}</Td>
                <Td>{item.reference}</Td>
                <Td isNumeric>{formatCurrency(item.amount)}</Td>
                <Td isNumeric>{formatCurrency(item.outstandingBalance)}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(item.status)}>{item.status}</Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Detail: Selected Transaction Details */}
      {selectedItem && (
        <Box borderWidth="1px" borderRadius="lg" borderColor={borderColor} p={4}>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>Transaction Details</Text>
          <Divider mb={4} />

          {/* Customer Information */}
          <Box mb={4}>
            <Text fontSize="md" fontWeight="semibold" mb={2}>Customer Information</Text>
            <Flex wrap="wrap">
              <Box flex="1" minW="250px" mb={4}>
                <Text fontWeight="medium">Customer Name:</Text>
                <Text>{selectedItem.customerName}</Text>
              </Box>

              <Box flex="1" minW="250px" mb={4}>
                <Text fontWeight="medium">Customer Reference:</Text>
                <Text>{selectedItem.customerReference}</Text>
              </Box>

              <Box flex="1" minW="250px" mb={4}>
                <Text fontWeight="medium">Email:</Text>
                <Text>{selectedItem.customerEmail}</Text>
              </Box>

              <Box flex="1" minW="250px" mb={4}>
                <Text fontWeight="medium">Phone:</Text>
                <Text>{selectedItem.customerPhone}</Text>
              </Box>

              <Box flex="1" minW="250px" mb={4}>
                <Text fontWeight="medium">Address:</Text>
                <Text>{selectedItem.customerAddress}</Text>
              </Box>
            </Flex>
          </Box>

          <Divider mb={4} />

          {/* Transaction Information */}
          <Text fontSize="md" fontWeight="semibold" mb={2}>Transaction Information</Text>
          <Flex wrap="wrap">
            <Box flex="1" minW="250px" mb={4}>
              <Text fontWeight="medium">Type:</Text>
              <Text>{selectedItem.type}</Text>
            </Box>

            <Box flex="1" minW="250px" mb={4}>
              <Text fontWeight="medium">Reference:</Text>
              <Text>{selectedItem.reference}</Text>
            </Box>

            <Box flex="1" minW="250px" mb={4}>
              <Text fontWeight="medium">Document Date:</Text>
              <Text>{formatDate(selectedItem.documentDate)}</Text>
            </Box>

            <Box flex="1" minW="250px" mb={4}>
              <Text fontWeight="medium">Due Date:</Text>
              <Text>{formatDate(selectedItem.dueDate)}</Text>
            </Box>

            <Box flex="1" minW="250px" mb={4}>
              <Text fontWeight="medium">Description:</Text>
              <Text>{selectedItem.description}</Text>
            </Box>

            <Box flex="1" minW="250px" mb={4}>
              <Text fontWeight="medium">Amount:</Text>
              <Text>{formatCurrency(selectedItem.amount)}</Text>
            </Box>

            <Box flex="1" minW="250px" mb={4}>
              <Text fontWeight="medium">Outstanding Balance:</Text>
              <Text>{formatCurrency(selectedItem.outstandingBalance)}</Text>
            </Box>

            <Box flex="1" minW="250px" mb={4}>
              <Text fontWeight="medium">Status:</Text>
              <Badge colorScheme={getStatusColor(selectedItem.status)}>{selectedItem.status}</Badge>
            </Box>

            <Box flex="1" minW="250px" mb={4}>
              <Text fontWeight="medium">Payment Method:</Text>
              <Text>{selectedItem.paymentMethod}</Text>
            </Box>

            <Box flex="1" minW="250px" mb={4}>
              <Text fontWeight="medium">Notes:</Text>
              <Text>{selectedItem.notes}</Text>
            </Box>
          </Flex>
        </Box>
      )}
    </Box>
  )
}
