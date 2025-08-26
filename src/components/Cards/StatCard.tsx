import { ArrowDownIcon, ArrowUpIcon } from '@chakra-ui/icons'
import { Badge, Card, CardBody, HStack, Icon, Stack, Text } from '@chakra-ui/react'

export default function StatCard({
  label,
  value,
  changePct,
  trend,
  helperText,
  subText,
  onClick,
}: {
  label: string
  value: string
  changePct?: number
  trend?: 'up' | 'down'
  helperText?: string
  subText?: string
  onClick?: () => void
}) {
  const isUp = trend === 'up'
  const color = trend ? (isUp ? 'green.500' : 'red.500') : 'gray.500'
  const IconCmp = isUp ? ArrowUpIcon : ArrowDownIcon

  return (
    <Card 
      h="100%" 
      onClick={onClick} 
      cursor={onClick ? "pointer" : "default"} 
      _hover={onClick ? { 
        transform: 'translateY(-4px)', 
        shadow: "lg",
        borderColor: "brand.200"
      } : { 
        shadow: "md" 
      }}
      transition="all 0.3s ease"
      borderWidth="1px"
      borderColor="gray.100"
      borderRadius="xl"
      overflow="hidden"
      bg="white"
      position="relative"
    >
      <CardBody p={5}>
        <Stack spacing={3}>
          <Text 
            fontSize="sm" 
            fontWeight="bold" 
            color="brand.600" 
            textTransform="uppercase" 
            letterSpacing="wider"
          >
            {label}
          </Text>
          <Text 
            fontSize="3xl" 
            fontWeight="bold" 
            bgGradient={trend ? 
              (isUp ? "linear(to-r, green.400, teal.400)" : "linear(to-r, red.400, orange.400)") : 
              "linear(to-r, brand.400, accent.400)"
            } 
            bgClip="text"
          >
            {value}
          </Text>
          {(changePct !== undefined && trend) && (
            <HStack spacing={2}>
              <Icon as={IconCmp} color={color} boxSize={5} />
              <Text color={color} fontWeight="bold">{Math.abs(changePct).toFixed(1)}%</Text>
              {helperText && (
                <Badge 
                  colorScheme={trend ? (isUp ? "green" : "red") : "brand"} 
                  variant="subtle" 
                  px={2} 
                  py={1} 
                  borderRadius="full"
                >
                  {helperText}
                </Badge>
              )}
            </HStack>
          )}
          {!changePct && helperText && (
            <Badge 
              colorScheme="brand" 
              variant="subtle" 
              px={2} 
              py={1} 
              borderRadius="full"
            >
              {helperText}
            </Badge>
          )}
          {subText && (
            <Text fontSize="sm" color="gray.600" fontWeight="medium">{subText}</Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}
