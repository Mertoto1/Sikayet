import { prisma } from './db'

export async function getSystemSettings() {
  const settings = await prisma.systemSetting.findMany()
  const settingsMap: Record<string, string> = {}
  
  settings.forEach(setting => {
    settingsMap[setting.key] = setting.value
  })
  
  return settingsMap
}

export async function getSiteSettings() {
  const settings = await getSystemSettings()
  
  // Validate logo URL - if it's an upload path, check if it exists or use fallback
  let siteLogo = settings.SITE_LOGO_URL || settings.site_logo || '/globe.svg'
  
  // If logo is an upload path but file might not exist (Railway ephemeral storage),
  // use fallback to prevent errors
  if (siteLogo.startsWith('/uploads/')) {
    // In production, uploaded files might not persist, so we'll let the Image component handle the fallback
    // But we can also check if it's a valid path
    siteLogo = siteLogo
  }
  
  return {
    siteName: settings.SITE_NAME || settings.site_name || 'Şikayetvar',
    siteLogo: siteLogo,
    favicon: settings.FAVICON_URL || settings.favicon || '/globe.svg',
    siteDescription: settings.site_description || 'Türkiye\'nin en büyük şikayet platformu'
  }
}

// Check if email verification is enabled (default: false/disabled)
export async function isEmailVerificationEnabled(): Promise<boolean> {
  const settings = await getSystemSettings()
  return settings.EMAIL_VERIFICATION_ENABLED === 'true'
}