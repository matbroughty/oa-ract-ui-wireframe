import { HStack, Stack, Text } from '@chakra-ui/react'

export default function ActivityItem({
  company,
  action,
  time,
  meta,
}: {
  company: string
  action: string
  time: string
  meta?: string
}) {
  const date = new Date(time)
  const human = date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
  return (
    <HStack align="flex-start" justify="space-between">
      <Stack spacing={0}>
        <Text fontWeight="semibold">{company}</Text>
        <Text fontSize="sm" color="gray.600">{action}{meta ? ` — ${meta}` : ''}</Text>
      </Stack>
      <Text fontSize="sm" color="gray.500">{human}</Text>
    </HStack>
  )
}
