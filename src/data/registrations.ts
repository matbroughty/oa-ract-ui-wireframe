export type Registration = {
  id: string
  companyId: string
  dateCreated: string // ISO date
  dateClosed?: string // ISO date, optional if still open
  dateExpires: string // ISO date
  registrationLink: string
}

// Generate dummy data for registrations
export function generateRegistrations(companyId: string, count = 3): Registration[] {
  const registrations: Registration[] = []
  const now = new Date()
  
  for (let i = 0; i < count; i++) {
    // Create dates: dateCreated is in the past, dateExpires is in the future
    const dateCreated = new Date(now)
    dateCreated.setDate(dateCreated.getDate() - (i * 30 + 10)) // Each registration is created 30 days apart
    
    const dateExpires = new Date(dateCreated)
    dateExpires.setFullYear(dateExpires.getFullYear() + 1) // Expires 1 year after creation
    
    // Some registrations are closed, some are still open
    let dateClosed: string | undefined = undefined
    if (i > 0 && i % 2 === 0) {
      const closedDate = new Date(dateCreated)
      closedDate.setDate(closedDate.getDate() + 60) // Closed 60 days after creation
      dateClosed = closedDate.toISOString()
    }
    
    // Create registration link similar to the one in CompaniesTable
    const registrationLink = `https://onboarding.openaccounting.example/register/${companyId}?ref=${i + 1}`
    
    registrations.push({
      id: `reg-${companyId}-${i + 1}`,
      companyId,
      dateCreated: dateCreated.toISOString(),
      dateClosed,
      dateExpires: dateExpires.toISOString(),
      registrationLink
    })
  }
  
  // Sort by dateCreated in descending order (newest first)
  return registrations.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
}

// Get registrations for a specific company
export function getCompanyRegistrations(companyId: string): Registration[] {
  return generateRegistrations(companyId)
}

// Create a new registration for a company
export function createRegistration(companyId: string, currencyCode: string = 'GBP', externalReference?: string): Registration {
  const now = new Date()
  const dateExpires = new Date(now)
  dateExpires.setFullYear(dateExpires.getFullYear() + 1) // Expires 1 year after creation
  
  // Create registration link similar to the one in CompaniesTable
  const registrationLink = `https://onboarding.openaccounting.example/register/${companyId}?currency=${currencyCode}` + 
    (externalReference ? `&ext=${encodeURIComponent(externalReference)}` : '')
  
  return {
    id: `reg-${companyId}-${Date.now()}`,
    companyId,
    dateCreated: now.toISOString(),
    dateExpires: dateExpires.toISOString(),
    registrationLink
  }
}