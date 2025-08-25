import { ArrowDownIcon, ArrowUpIcon } from '@chakra-ui/icons'
import { Badge, Card, CardBody, HStack, Icon, Stack, Text } from '@chakra-ui/react'

export default function StatCard({
  label,
  value,
  changePct,
  trend,
  helperText,
  subText,
}: {
  label: string
  value: string
  changePct?: number
  trend?: 'up' | 'down'
  helperText?: string
  subText?: string
}) {
  const isUp = trend === 'up'
  const color = trend ? (isUp ? 'green.500' : 'red.500') : 'gray.500'
  const IconCmp = isUp ? ArrowUpIcon : ArrowDownIcon

  return (
    <Card h="100%">
      <CardBody>
        <Stack spacing={2}>
          <Text fontSize="sm" color="gray.600">{label}</Text>
          <Text fontSize="2xl" fontWeight="semibold">{value}</Text>
          {(changePct !== undefined && trend) && (
            <HStack spacing={2}>
              <Icon as={IconCmp} color={color} />
              <Text color={color} fontWeight="medium">{Math.abs(changePct).toFixed(1)}%</Text>
              {helperText && (
                <Badge colorScheme="gray" variant="subtle">{helperText}</Badge>
              )}
            </HStack>
          )}
          {subText && (
            <Text fontSize="sm" color="gray.500">{subText}</Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}
