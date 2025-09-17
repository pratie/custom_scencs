// Environment variable validation for production safety

export function validateEnvironment() {
  const requiredEnvVars = {
    // Database
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

    // Authentication
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    // AI APIs
    FAL_API_KEY: process.env.FAL_API_KEY,
    KIE_API_KEY: process.env.KIE_API_KEY,
  }

  const missing: string[] = []
  const invalid: string[] = []

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key)
    } else if (value.length < 10) {
      invalid.push(key)
    }
  }

  // Additional validation
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co')) {
    invalid.push('NEXT_PUBLIC_SUPABASE_URL (invalid format)')
  }

  if (process.env.NEXTAUTH_URL && process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_URL.startsWith('https://')) {
    invalid.push('NEXTAUTH_URL (must use HTTPS in production)')
  }

  if (missing.length > 0 || invalid.length > 0) {
    const errorMessage = [
      'Environment validation failed:',
      missing.length > 0 ? `Missing: ${missing.join(', ')}` : '',
      invalid.length > 0 ? `Invalid: ${invalid.join(', ')}` : '',
    ].filter(Boolean).join('\n')

    throw new Error(errorMessage)
  }

  console.log('✅ Environment validation passed')
}

// Production safety checks
export function validateProductionSafety() {
  if (process.env.NODE_ENV === 'production') {
    // Check for development values in production
    const dangerousValues = [
      'localhost',
      'development',
      'test',
      '123456',
      'secret',
    ]

    const envString = JSON.stringify(process.env).toLowerCase()
    const foundDangerous = dangerousValues.filter(val => envString.includes(val))

    if (foundDangerous.length > 0) {
      throw new Error(`Production safety check failed. Found development values: ${foundDangerous.join(', ')}`)
    }

    // Ensure HTTPS
    if (!process.env.NEXTAUTH_URL?.startsWith('https://')) {
      throw new Error('NEXTAUTH_URL must use HTTPS in production')
    }

    console.log('✅ Production safety checks passed')
  }
}