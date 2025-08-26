import { Card, CardBody, Divider, Heading, Stack, Text, Button, HStack, Spacer } from '@chakra-ui/react'
import ConfigurationOptionsTable from '../Tables/ConfigurationOptionsTable'

export default function ConfigurationOptionsView({ onBack }: { onBack: () => void }) {
  return (
    <Stack spacing={6}>
      <Card>
        <CardBody>
          <Stack spacing={3}>
            <HStack>
              <Heading size="md">Configuration Options</Heading>
              <Spacer />
              <Button size="sm" onClick={onBack}>Back to System</Button>
            </HStack>
            <Divider />
            <Text color="gray.600">
              This panel allows you to view, add, edit, and delete configuration options. 
              These are simple name-value pairs used throughout the application.
            </Text>
          </Stack>
        </CardBody>
      </Card>

      <ConfigurationOptionsTable />
    </Stack>
  )
}