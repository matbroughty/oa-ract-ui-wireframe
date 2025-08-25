import { useState } from 'react'
import { Box, Card, CardBody, Container, Divider, Flex, Grid, GridItem, Heading, HStack, Icon, Spacer, Stack, Text, VStack, Button } from '@chakra-ui/react'
import { SettingsIcon, AtSignIcon, TimeIcon } from '@chakra-ui/icons'
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

  type Section = 'Companies' | 'System' | 'User' | 'Recent Activity'
  const [section, setSection] = useState<Section>('Companies')
  const [showMenu, setShowMenu] = useState(false)

  function NavItem({ label, icon, active, onClick }: { label: Section; icon: any; active: boolean; onClick: () => void }) {
    return (
      <Button
        variant={active ? 'solid' : 'ghost'}
        colorScheme={active ? 'blue' : undefined}
        justifyContent="flex-start"
        leftIcon={<Icon as={icon} />}
        w="full"
        size="sm"
        onClick={onClick}
        borderRadius="md"
      >
        {label}
      </Button>
    )
  }

  function CompaniesView() {
    // Compute latest last load date among queued companies
    const queuedCompanies = seedCompanies.filter(c => {
      const today = new Date()
      const d = new Date(c.lastLoadDate)
      const days = isNaN(d.getTime()) ? 999 : Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
      return c.status === 'cloud' && (c.salesBalanceGBP !== 0 || c.purchaseBalanceGBP !== 0) && days > 10
    })
    let lastQueuedLoadSubText: string | undefined
    if (queuedCompanies.length > 0) {
      // Find the most recent load date within queued companies (max by date)
      const maxISO = queuedCompanies.map(c => c.lastLoadDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
      const dt = new Date(maxISO)
      lastQueuedLoadSubText = `Last load: ${dt.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`
    }

    return (
      <Stack spacing={6}>
        {/* KPI / Metrics Row */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
          {metrics.slice(0, 3).map((m) => (
            <GridItem key={m.id}>
              <StatCard label={m.label} value={m.value} changePct={m.changePct} trend={m.trend} helperText={m.helperText} />
            </GridItem>
          ))}
          <GridItem>
            <StatCard label="Queued Companies" value={String(queuedCount)} helperText="awaiting load" subText={lastQueuedLoadSubText} />
          </GridItem>
        </Grid>
        {/* Main companies table */}
        <CompaniesTable />
      </Stack>
    )
  }

  function SystemView() {
    return (
      <Card>
        <CardBody>
          <Stack spacing={3}>
            <Heading size="md">System</Heading>
            <Divider />
            <Text color="gray.600">Manage system metadata such as currencies, export/report definitions, etc. (coming soon)</Text>
          </Stack>
        </CardBody>
      </Card>
    )
  }

  function RecentActivityView() {
    return (
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
    )
  }

  function UserView() {
    return (
      <Card>
        <CardBody>
          <Stack spacing={3}>
            <Heading size="md">User</Heading>
            <Divider />
            <Text color="gray.600">User settings and profile management will appear here.</Text>
          </Stack>
        </CardBody>
      </Card>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="7xl" py={8}>
        <Flex align="center" mb={6} gap={4}>
          <Heading size="lg">Open Accounting — {section}</Heading>
          <Spacer />
          <Button size="sm" variant="outline" onClick={() => setShowMenu(s => !s)}>
            {showMenu ? 'Hide menu' : 'Show menu'}
          </Button>
        </Flex>

        <Grid templateColumns={showMenu ? { base: '1fr', lg: '240px 1fr' } : { base: '1fr', lg: '1fr' }} gap={6}>
          {/* Left menu */}
          {showMenu && (
            <GridItem>
              <Card>
                <CardBody>
                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="sm" color="gray.600" mb={1}>Menu</Text>
                    <NavItem label="Companies" icon={SettingsIcon} active={section==='Companies'} onClick={() => setSection('Companies')} />
                    <NavItem label="System" icon={SettingsIcon} active={section==='System'} onClick={() => setSection('System')} />
                    <NavItem label="User" icon={AtSignIcon} active={section==='User'} onClick={() => setSection('User')} />
                    <NavItem label="Recent Activity" icon={TimeIcon} active={section==='Recent Activity'} onClick={() => setSection('Recent Activity')} />
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          )}

          {/* Main content */}
          <GridItem>
            {section === 'Companies' && <CompaniesView />}
            {section === 'System' && <SystemView />}
            {section === 'Recent Activity' && <RecentActivityView />}
            {section === 'User' && <UserView />}
          </GridItem>
        </Grid>

        <Text mt={6} fontSize="sm" color="gray.500">
          Starter built with Chakra UI in a Purity-style aesthetic. Sorting + search included.
        </Text>
      </Container>
    </Box>
  )
}
