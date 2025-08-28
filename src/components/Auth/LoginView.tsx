import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  FormErrorMessage
} from '@chakra-ui/react'
import backgroundImage from '../../lendscape_citybg.jpg'

// Define valid users
const VALID_USERS = [
  { username: 'Admin User 1', password: 'admin1' },
  { username: 'Admin User 2', password: 'admin2' },
  { username: 'Admin User 3', password: 'admin3' }
]

interface LoginViewProps {
  onLogin: (username: string) => void
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const toast = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check if the username and password match any valid user
    const user = VALID_USERS.find(
      user => user.username === username && user.password === password
    )

    if (user) {
      // Clear any previous errors
      setError('')

      // Show success toast
      toast({
        title: 'Login successful',
        description: `Welcome, ${username}!`,
        status: 'success',
        duration: 3000,
        isClosable: true
      })

      // Call the onLogin callback with the username
      onLogin(username)
    } else {
      // Show error message
      setError('Invalid username or password')
    }
  }

  return (
    <Box 
      minH="100vh" 
      py={10}
      backgroundImage={`url(${backgroundImage})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
    >
      <Container maxW="md">
        <Card boxShadow="xl">
          <CardBody>
            <Stack spacing={6}>
              <Heading size="lg" textAlign="center">Open Accounting</Heading>
              <Text textAlign="center" color="gray.600">Please sign in to continue</Text>

              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <FormControl isInvalid={!!error}>
                    <FormLabel>Username</FormLabel>
                    <Input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      required
                    />
                  </FormControl>

                  <FormControl isInvalid={!!error}>
                    <FormLabel>Password</FormLabel>
                    <Input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    {error && <FormErrorMessage>{error}</FormErrorMessage>}
                  </FormControl>

                  <Button 
                    type="submit" 
                    colorScheme="blue" 
                    size="lg" 
                    width="full"
                    mt={4}
                  >
                    Sign In
                  </Button>
                </Stack>
              </form>

              <Text fontSize="sm" color="gray.500" textAlign="center">
                Valid users: Admin User 1, Admin User 2, Admin User 3
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
}
