import { Card, CardBody, Divider, Heading, Stack, Text } from '@chakra-ui/react'
import ExtractFilesTable from '../Tables/ExtractFilesTable'

export default function ExtractFilesView() {
  return (
    <Stack spacing={6}>
      <Card>
        <CardBody>
          <Stack spacing={3}>
            <Heading size="md">Waiting Extract Files</Heading>
            <Divider />
            <Text color="gray.600">
              This panel shows all extract files that are waiting to be processed, currently loading, 
              have been loaded, or have failed to load. Failed extracts will display an error message.
            </Text>
          </Stack>
        </CardBody>
      </Card>
      
      <ExtractFilesTable />
    </Stack>
  )
}