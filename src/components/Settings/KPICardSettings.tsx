import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Checkbox,
  VStack,
  HStack,
  Text,
  Divider,
  Box,
  useToast
} from '@chakra-ui/react'

export type KPICard = {
  id: string
  label: string
  value: string
  changePct?: number
  trend?: 'up' | 'down'
  helperText?: string
  subText?: string
  onClick?: () => void
  isSpecial?: boolean
}

export type KPICardVisibility = {
  [key: string]: boolean
}

// Local storage key for KPI card visibility
const KPI_VISIBILITY_KEY = 'kpi_card_visibility'

// Default visibility state - all cards visible
export const getDefaultVisibility = (cards: KPICard[]): KPICardVisibility => {
  const visibility: KPICardVisibility = {}
  cards.forEach(card => {
    visibility[card.id] = true
  })
  return visibility
}

// Load visibility settings from localStorage
export const loadVisibilitySettings = (): KPICardVisibility | null => {
  try {
    const saved = localStorage.getItem(KPI_VISIBILITY_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load KPI card visibility settings:', error)
  }
  return null
}

// Save visibility settings to localStorage
export const saveVisibilitySettings = (settings: KPICardVisibility): void => {
  try {
    localStorage.setItem(KPI_VISIBILITY_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save KPI card visibility settings:', error)
  }
}

interface KPICardSettingsProps {
  isOpen: boolean
  onClose: () => void
  cards: KPICard[]
  visibility: KPICardVisibility
  onVisibilityChange: (visibility: KPICardVisibility) => void
}

export default function KPICardSettings({
  isOpen,
  onClose,
  cards,
  visibility,
  onVisibilityChange
}: KPICardSettingsProps) {
  const toast = useToast()
  const [localVisibility, setLocalVisibility] = useState<KPICardVisibility>({})

  // Initialize local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalVisibility({ ...visibility })
    }
  }, [isOpen, visibility])

  // Handle checkbox change
  const handleCheckboxChange = (id: string, checked: boolean) => {
    setLocalVisibility(prev => ({
      ...prev,
      [id]: checked
    }))
  }

  // Save changes
  const handleSave = () => {
    onVisibilityChange(localVisibility)
    saveVisibilitySettings(localVisibility)
    toast({
      title: 'Settings saved',
      description: 'Your KPI card preferences have been saved.',
      status: 'success',
      duration: 3000,
      isClosable: true
    })
    onClose()
  }

  // Reset to defaults (all visible)
  const handleReset = () => {
    const defaultVisibility = getDefaultVisibility(cards)
    setLocalVisibility(defaultVisibility)
  }

  // Group cards by type (standard and special)
  const standardCards = cards.filter(card => !card.isSpecial)
  const specialCards = cards.filter(card => card.isSpecial)

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Customize KPI Cards</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4}>
            Select which KPI cards you want to display on your dashboard.
          </Text>

          {standardCards.length > 0 && (
            <>
              <Text fontWeight="bold" mb={2}>
                Standard Metrics
              </Text>
              <VStack align="start" spacing={3} mb={4}>
                {standardCards.map(card => (
                  <Checkbox
                    key={card.id}
                    isChecked={localVisibility[card.id]}
                    onChange={e => handleCheckboxChange(card.id, e.target.checked)}
                  >
                    <HStack spacing={2}>
                      <Text>{card.label}</Text>
                    </HStack>
                  </Checkbox>
                ))}
              </VStack>
            </>
          )}

          {specialCards.length > 0 && (
            <>
              <Divider my={4} />
              <Text fontWeight="bold" mb={2}>
                Special Cards
              </Text>
              <VStack align="start" spacing={3}>
                {specialCards.map(card => (
                  <Checkbox
                    key={card.id}
                    isChecked={localVisibility[card.id]}
                    onChange={e => handleCheckboxChange(card.id, e.target.checked)}
                  >
                    <HStack spacing={2}>
                      <Text>{card.label}</Text>
                    </HStack>
                  </Checkbox>
                ))}
              </VStack>
            </>
          )}

          <Box mt={6} p={3} bg="blue.50" borderRadius="md">
            <Text fontSize="sm">
              Your preferences will be saved in your browser and remembered for future visits.
            </Text>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleReset}>
            Reset to Default
          </Button>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}