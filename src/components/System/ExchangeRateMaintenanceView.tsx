import { Card, CardBody, Divider, Heading, Stack, Text, Button, HStack, Spacer } from '@chakra-ui/react'
import ExchangeRatesTable from '../Tables/ExchangeRatesTable'

export default function ExchangeRateMaintenanceView({ onBack }: { onBack: () => void }) {
  return (
    <Stack spacing={6}>
      <Card>
        <CardBody>
          <Stack spacing={3}>
            <HStack>
              <Heading size="md">Exchange Rate Maintenance</Heading>
              <Spacer />
              <Button size="sm" onClick={onBack}>Back to System</Button>
            </HStack>
            <Divider />
            <Text color="gray.600">
              This panel allows you to view, add, edit, and delete exchange rates. 
              You can also import rates from Lendscape RF or from openexchangerates.org.
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <ExchangeRatesTable />
    </Stack>
  )
}
