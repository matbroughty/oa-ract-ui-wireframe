import { Card, CardBody, Divider, Heading, Stack, Text, Button, HStack, Spacer } from '@chakra-ui/react'
import CloudConnectionsTable from '../Tables/CloudConnectionsTable'

export default function CloudConnectionsView({ onBack }: { onBack: () => void }) {
  return (
    <Stack spacing={6}>
      <Card>
        <CardBody>
          <Stack spacing={3}>
            <HStack>
              <Heading size="md">Processing Cloud Connections</Heading>
              <Spacer />
              <Button size="sm" onClick={onBack}>Back to System</Button>
            </HStack>
            <Divider />
            <Text color="gray.600">
              This panel shows all cloud connections that are currently processing or queued for extraction.
              The CONNECTOR column shows the cloud accounting system being used (XERO, QB, CODAT, or VALIDIS),
              and the Status column shows whether the connection is currently EXTRACTING or QUEUED.
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <CloudConnectionsTable />
    </Stack>
  )
}