import { useState, useEffect } from 'react'
import { Box, Card, CardBody, Container, Divider, Flex, Grid, GridItem, Heading, HStack, Icon, Spacer, Stack, Text, VStack, Button, useToast, Menu, MenuButton, MenuList, MenuItem, Image } from '@chakra-ui/react'
import logoImage from './oa-rev.png'
import { SettingsIcon, AtSignIcon, TimeIcon, InfoIcon, ViewIcon, ChevronDownIcon } from '@chakra-ui/icons'
import LoginView from './components/Auth/LoginView'
import CompaniesTable from './pages/CompaniesTable'
import StatCard from './components/Cards/StatCard'
import { metrics } from './data/metrics'
import { activities } from './data/activities'
import ActivityItem from './components/Activity/ActivityItem'
import { companies as seedCompanies } from './data/companies'
import ExtractFilesView from './components/System/ExtractFilesView'
import ExchangeRateMaintenanceView from './components/System/ExchangeRateMaintenanceView'
import ConfigurationOptionsView from './components/System/ConfigurationOptionsView'

// Normalize type for companies array to avoid TS inference issues with `as const` in some environments
export type CompanySeed = {
  id: string
  name: string
  email: string
  reference: string
  lastLoadDate: string // ISO
  salesBalanceGBP: number
  purchaseBalanceGBP: number
  status: 'cloud' | 'desktop'
}
const companiesArr = seedCompanies as unknown as CompanySeed[]

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<string>('')
  const toast = useToast()

  // Handle successful login
  const handleLogin = (username: string) => {
    setIsAuthenticated(true)
    setCurrentUser(username)
  }

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser('')
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
      status: 'info',
      duration: 3000,
      isClosable: true
    })
  }

  // Compute queued companies count (demo rule): cloud companies with non-zero balances and last load > 10 days ago
  const queuedCount = (() => {
    const today = new Date()
    function daysSince(dateISO: string) {
      const d = new Date(dateISO)
      if (isNaN(d.getTime())) return 999
      const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
      return diff
    }
    return companiesArr.filter(c => c.status === 'cloud' && (c.salesBalanceGBP !== 0 || c.purchaseBalanceGBP !== 0) && daysSince(c.lastLoadDate) > 10).length
  })()

  type Section = 'Companies' | 'System' | 'User' | 'Recent Activity' | 'Survey'
  type SystemSubSection = 'Main' | 'ExtractFiles' | 'ExchangeRates' | 'ConfigOptions'
  const [systemSubSection, setSystemSubSection] = useState<SystemSubSection>('Main')
  const [section, setSection] = useState<Section>('Companies')
  const [showMenu, setShowMenu] = useState(false)

  function NavItem({ label, icon, active, onClick }: { label: Section; icon: any; active: boolean; onClick: () => void }) {
    return (
      <Button
        variant={active ? 'solid' : 'ghost'}
        colorScheme={active ? 'brand' : undefined}
        justifyContent="flex-start"
        leftIcon={<Icon as={icon} boxSize={5} />}
        w="full"
        size="md"
        onClick={onClick}
        borderRadius="lg"
        py={6}
        fontWeight={active ? 'bold' : 'medium'}
        transition="all 0.2s"
        _hover={{
          transform: 'translateX(4px)',
          bg: active ? undefined : 'gray.50'
        }}
        boxShadow={active ? 'md' : 'none'}
      >
        {label}
      </Button>
    )
  }

  function CompaniesView() {
    // Compute latest last load date among queued companies
    const queuedCompanies = companiesArr.filter(c => {
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
        <Box px={{ base: 3, md: 4 }}>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
            {metrics.slice(0, 3).map((m) => (
              <GridItem key={m.id}>
                <StatCard label={m.label} value={m.value} changePct={m.changePct} trend={m.trend} helperText={m.helperText} />
              </GridItem>
            ))}
            <GridItem>
              <StatCard 
                label="Queued Companies" 
                value={String(queuedCount)} 
                helperText="awaiting load" 
                subText={lastQueuedLoadSubText} 
                onClick={() => { 
                  setSection('System'); 
                  setSystemSubSection('ExtractFiles'); 
                  setShowMenu(true); 
                }} 
              />
            </GridItem>
          </Grid>
        </Box>
        {/* Main companies table */}
        <Box px={{ base: 3, md: 4 }}>
          <CompaniesTable />
        </Box>
      </Stack>
    )
  }

  function SystemView() {
    if (systemSubSection === 'ExtractFiles') {
      return <ExtractFilesView onBack={() => setSystemSubSection('Main')} />
    }

    if (systemSubSection === 'ExchangeRates') {
      return <ExchangeRateMaintenanceView onBack={() => setSystemSubSection('Main')} />
    }

    if (systemSubSection === 'ConfigOptions') {
      return <ConfigurationOptionsView onBack={() => setSystemSubSection('Main')} />
    }

    return (
      <Card>
        <CardBody>
          <Stack spacing={3}>
            <Heading size="md">System</Heading>
            <Divider />
            <Text color="gray.600">Manage system metadata such as currencies, export/report definitions, etc.</Text>
            <Stack spacing={3} mt={4}>
              <Button 
                colorScheme="blue" 
                onClick={() => setSystemSubSection('ConfigOptions')}
              >
                Configuration Options
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={() => setSystemSubSection('ExchangeRates')}
              >
                Exchange Rate Maintenance
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={() => setSystemSubSection('ExtractFiles')}
              >
                Extract Files
              </Button>
            </Stack>
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

  // Survey dashboard view
  function SurveyView() {
    const toast = useToast()
    const [riskScore, setRiskScore] = useState<number>(() => Math.round(50 + Math.random() * 50))
    const [lastSurveyISO, setLastSurveyISO] = useState<string>(() => new Date().toISOString())

    function rerunSurvey() {
      // Simulate a new survey run
      const nextScore = Math.max(1, Math.min(100, Math.round(riskScore + (Math.random() * 20 - 10))))
      setRiskScore(nextScore)
      const now = new Date().toISOString()
      setLastSurveyISO(now)
      toast({ title: 'Survey re-run requested', description: 'A new survey has been initiated and results updated.', status: 'info', duration: 3000, isClosable: true })
    }

    const lastSurveyText = new Date(lastSurveyISO).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

    // Simple inline SVG charts (bar and line) for a generic dashboard
    function RiskCategoryBars() {
      const cats = [
        { label: 'Financial', value: 30 },
        { label: 'Operational', value: 24 },
        { label: 'Compliance', value: 18 },
        { label: 'Market', value: 14 },
        { label: 'Other', value: 8 },
      ]
      const max = Math.max(...cats.map(c => c.value), 1)
      return (
        <VStack align="stretch" spacing={2}>
          {cats.map((c) => {
            const pct = Math.round((c.value / max) * 100)
            return (
              <HStack key={c.label} spacing={3}>
                <Box w="140px" fontSize="sm" color="gray.600">{c.label}</Box>
                <Box flex="1">
                  <Box bg="gray.200" h="6" borderRadius="md" overflow="hidden">
                    <Box bg="orange.400" h="100%" width={`${pct}%`} />
                  </Box>
                </Box>
                <Text w="60px" textAlign="right" fontWeight="semibold">{c.value}</Text>
              </HStack>
            )
          })}
        </VStack>
      )
    }

    function ScoreTrendLine() {
      const w = 800, h = 200, pad = 32
      const points = Array.from({ length: 12 }).map((_, i) => 40 + Math.round(Math.sin(i/2) * 10) + Math.round(Math.random()*8))
      const minV = Math.min(...points, 0), maxV = Math.max(...points, 100)
      const x = (i: number) => pad + (i * (w - 2 * pad)) / Math.max(1, points.length - 1)
      const y = (v: number) => h - pad - ((v - minV) * (h - 2 * pad)) / Math.max(1, (maxV - minV) || 1)
      const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')
      return (
        <Box w="100%" h="220px">
          <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
            <line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad} stroke="#CBD5E0" />
            <line x1={pad} y1={pad} x2={pad} y2={h-pad} stroke="#CBD5E0" />
            <path d={path} fill="none" stroke="#2B6CB0" strokeWidth="2" />
          </svg>
        </Box>
      )
    }

    return (
      <Stack spacing={6}>
        <HStack justify="space-between" align="center">
          <Heading size="md">Survey Dashboard</Heading>
          <Button leftIcon={<Icon as={InfoIcon} />} colorScheme="blue" onClick={rerunSurvey}>Re-run Survey</Button>
        </HStack>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
          <GridItem>
            <StatCard label="Risk Score" value={`${riskScore}/100`} helperText="latest" />
          </GridItem>
          <GridItem>
            <StatCard label="Last Survey" value={lastSurveyText} />
          </GridItem>
          <GridItem>
            <StatCard label="Risk Level" value={riskScore >= 75 ? 'High' : riskScore >= 50 ? 'Medium' : 'Low'} />
          </GridItem>
          <GridItem>
            <StatCard label="Surveys in Year" value={String(4)} />
          </GridItem>
        </Grid>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <GridItem>
            <Card>
              <CardBody>
                <Stack spacing={2}>
                  <Text fontSize="sm" color="gray.600">Risk Categories</Text>
                  <RiskCategoryBars />
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Stack spacing={2}>
                  <Text fontSize="sm" color="gray.600">Score Trend (12 months)</Text>
                  <ScoreTrendLine />
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Stack>
    )
  }

  // If not authenticated, show login view
  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />
  }

  // Otherwise, show the main application
  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW={(section === 'Companies' && !showMenu) ? '100%' : '7xl'} py={8} px={(section === 'Companies' && !showMenu) ? 0 : undefined}>
        {section === 'Companies' && !showMenu ? (
          <Box px={{ base: 3, md: 4 }}>
            <Flex 
              align="center" 
              mb={8} 
              gap={4} 
              bg="white" 
              p={4} 
              borderRadius="xl" 
              boxShadow="md"
              borderWidth="1px"
              borderColor="gray.100"
            >
              <Image src={logoImage} alt="Open Accounting Logo" height="50px" mr={4} />
              <Heading size="lg" color="brand.700">
                Open Accounting — {section}
              </Heading>
              <Spacer />
              <Menu>
                <MenuButton 
                  as={Button} 
                  rightIcon={<ChevronDownIcon />} 
                  size="md" 
                  mr={3}
                  colorScheme="brand"
                  variant="outline"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'sm' }}
                  transition="all 0.2s"
                >
                  {currentUser}
                </MenuButton>
                <MenuList borderRadius="md" boxShadow="lg">
                  <MenuItem onClick={handleLogout} _hover={{ bg: 'red.50', color: 'red.500' }}>Logout</MenuItem>
                </MenuList>
              </Menu>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowMenu(s => !s)}
                colorScheme="gray"
                _hover={{ bg: 'gray.100' }}
              >
                {showMenu ? 'Hide menu' : 'Show menu'}
              </Button>
            </Flex>
          </Box>
        ) : (
          <Flex 
            align="center" 
            mb={8} 
            gap={4} 
            bg="white" 
            p={4} 
            borderRadius="xl" 
            boxShadow="md"
            borderWidth="1px"
            borderColor="gray.100"
          >
            <Image src={logoImage} alt="Open Accounting Logo" height="50px" mr={4} />
            <Heading size="lg" color="brand.700">
              Open Accounting — {section}
            </Heading>
            <Spacer />
            <Menu>
              <MenuButton 
                as={Button} 
                rightIcon={<ChevronDownIcon />} 
                size="md" 
                mr={3}
                colorScheme="brand"
                variant="outline"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'sm' }}
                transition="all 0.2s"
              >
                {currentUser}
              </MenuButton>
              <MenuList borderRadius="md" boxShadow="lg">
                <MenuItem onClick={handleLogout} _hover={{ bg: 'red.50', color: 'red.500' }}>Logout</MenuItem>
              </MenuList>
            </Menu>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowMenu(s => !s)}
              colorScheme="gray"
              _hover={{ bg: 'gray.100' }}
            >
              {showMenu ? 'Hide menu' : 'Show menu'}
            </Button>
          </Flex>
        )}

        <Grid templateColumns={showMenu ? { base: '1fr', lg: '240px 1fr' } : { base: '1fr', lg: '1fr' }} gap={6}>
          {/* Left menu */}
          {showMenu && (
            <GridItem>
              <Card
                bg="white"
                boxShadow="lg"
                borderRadius="xl"
                overflow="hidden"
                borderWidth="1px"
                borderColor="gray.100"
              >
                <CardBody p={4}>
                  <VStack align="stretch" spacing={3}>
                    <Text fontSize="sm" fontWeight="bold" color="brand.600" mb={2} textTransform="uppercase" letterSpacing="wider">Menu</Text>
                    <NavItem label="Companies" icon={ViewIcon} active={section==='Companies'} onClick={() => setSection('Companies')} />
                    <NavItem label="System" icon={SettingsIcon} active={section==='System'} onClick={() => setSection('System')} />
                    <NavItem label="User" icon={AtSignIcon} active={section==='User'} onClick={() => setSection('User')} />
                    <NavItem label="Recent Activity" icon={TimeIcon} active={section==='Recent Activity'} onClick={() => setSection('Recent Activity')} />
                    <NavItem label="Survey" icon={InfoIcon} active={section==='Survey'} onClick={() => setSection('Survey')} />
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
            {section === 'Survey' && <SurveyView />}
          </GridItem>
        </Grid>

        <Text mt={6} fontSize="sm" color="gray.500">
        </Text>
      </Container>
    </Box>
  )
}
