
import { Box, Card, CardBody, Container, Divider, Flex, Grid, GridItem, Heading, Spacer, Stack, Text } from '@chakra-ui/react'
import CompaniesTable from './pages/CompaniesTable'
import StatCard from './components/Cards/StatCard'
import { metrics } from './data/metrics'
import { activities } from './data/activities'
import ActivityItem from './components/Activity/ActivityItem'
import { companies as seedCompanies } from './data/companies'

export default function App() {
  // Compute queued companies count (demo rule): cloud companies with non-zero balances and last load > 10 days ago
  const queuedCount = (() => {
    const today = new Date()
    function daysSince(dateISO: string) {
      const d = new Date(dateISO)
      if (isNaN(d.getTime())) return 999
      const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
      return diff
    }
    return seedCompanies.filter(c => c.status === 'cloud' && (c.salesBalanceGBP !== 0 || c.purchaseBalanceGBP !== 0) && daysSince(c.lastLoadDate) > 10).length
  })()

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="7xl" py={8}>
        <Flex align="center" mb={6} gap={4}>
          <Heading size="lg">Open Accounting — Companies</Heading>
          <Spacer />
        </Flex>

        {/* KPI / Metrics Row */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4} mb={6}>
          {/* Keep 4 cards to preserve alignment: first 3 metrics, then Queued Companies */}
          {metrics.slice(0, 3).map((m) => (
            <GridItem key={m.id}>
              <StatCard label={m.label} value={m.value} changePct={m.changePct} trend={m.trend} helperText={m.helperText} />
            </GridItem>
          ))}
          <GridItem>
            <StatCard label="Queued Companies" value={String(queuedCount)} helperText="awaiting load" />
          </GridItem>
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          <GridItem>
            <CompaniesTable />
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Stack spacing={3}>
                  <Heading size="md">Recent Activity</Heading>
                  <Divider />
                  <Stack spacing={4}>
                    {activities.map(a => (
                      <ActivityItem key={a.id} company={a.company} action={a.action} time={a.time} meta={a.meta} />
                    ))}
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        <Text mt={6} fontSize="sm" color="gray.500">
          Starter built with Chakra UI in a Purity-style aesthetic. Sorting + search included.
        </Text>
      </Container>
    </Box>
  )
}
