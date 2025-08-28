import { ArrowDownIcon, ArrowUpIcon, InfoIcon, TimeIcon } from '@chakra-ui/icons'
import { Badge, Box, Card, CardBody, Flex, HStack, Icon, Stack, Text, useColorModeValue } from '@chakra-ui/react'

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

  // Enhanced colors
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const labelColor = useColorModeValue('brand.700', 'brand.300')
  const subTextColor = useColorModeValue('gray.600', 'gray.400')

  // Determine if this is a special card
  const isSystemSummary = label === 'System Summary'
  const isQueuedCompanies = label === 'Queued Companies'

  return (
    <Card 
      h="100%" 
      onClick={onClick} 
      cursor={onClick ? "pointer" : "default"} 
      _hover={onClick ? { 
        transform: 'translateY(-4px)', 
        shadow: "lg",
        borderColor: isSystemSummary ? "blue.300" : (isQueuedCompanies ? "orange.300" : "brand.200")
      } : { 
        shadow: "md" 
      }}
      transition="all 0.3s ease"
      borderWidth="1px"
      borderColor={isSystemSummary ? "blue.100" : (isQueuedCompanies ? "orange.100" : borderColor)}
      borderRadius="xl"
      overflow="hidden"
      bg={bgColor}
      position="relative"
      boxShadow={isSystemSummary || isQueuedCompanies ? "md" : "sm"}
    >
      {/* Decorative top border for visual interest */}
      <Box 
        position="absolute" 
        top="0" 
        left="0" 
        right="0" 
        h="4px" 
        bgGradient={isSystemSummary 
          ? "linear(to-r, blue.400, purple.500)" 
          : (isQueuedCompanies
            ? "linear(to-r, orange.400, amber.500)"
            : (trend 
              ? (isUp ? "linear(to-r, green.400, teal.400)" : "linear(to-r, red.400, orange.400)") 
              : "linear(to-r, brand.400, accent.400)"
            )
          )
        }
      />

      <CardBody p={6}>
        <Stack spacing={4}>
          <Flex justify="space-between" align="center">
            <Text 
              fontSize="sm" 
              fontWeight="bold" 
              color={isSystemSummary ? "blue.700" : (isQueuedCompanies ? "orange.700" : labelColor)} 
              textTransform="uppercase" 
              letterSpacing="wider"
            >
              {label}
            </Text>

            {isSystemSummary && (
              <Icon as={InfoIcon} color="blue.500" boxSize={4} />
            )}

            {isQueuedCompanies && (
              <Icon as={TimeIcon} color="orange.500" boxSize={4} />
            )}
          </Flex>

          <Text 
            fontSize={isSystemSummary || isQueuedCompanies ? "4xl" : "3xl"} 
            fontWeight="extrabold" 
            lineHeight="1.2"
            bgGradient={isSystemSummary 
              ? "linear(to-r, blue.500, purple.600)" 
              : (isQueuedCompanies
                ? "linear(to-r, orange.500, amber.600)"
                : (trend 
                  ? (isUp ? "linear(to-r, green.400, teal.400)" : "linear(to-r, red.400, orange.400)") 
                  : "linear(to-r, brand.400, accent.400)"
                )
              )
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
              colorScheme={isSystemSummary ? "blue" : (isQueuedCompanies ? "orange" : "brand")} 
              variant="subtle" 
              px={3} 
              py={1.5} 
              borderRadius="full"
              fontSize="sm"
              fontWeight="medium"
            >
              {helperText}
            </Badge>
          )}

          {subText && (
            <Text 
              fontSize="sm" 
              color={subTextColor} 
              fontWeight="medium"
              mt={1}
              lineHeight="1.6"
              maxW="100%"
              noOfLines={isSystemSummary || isQueuedCompanies ? 2 : 1}
            >
              {subText}
            </Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}
