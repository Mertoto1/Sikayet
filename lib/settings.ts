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
  
  return {
    siteName: settings.SITE_NAME || settings.site_name || 'Şikayetvar',
    siteLogo: settings.SITE_LOGO_URL || settings.site_logo || '/globe.svg',
    favicon: settings.FAVICON_URL || settings.favicon || '/globe.svg',
    siteDescription: settings.site_description || 'Türkiye\'nin en büyük şikayet platformu'
  }
}
