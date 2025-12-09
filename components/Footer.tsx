import Link from 'next/link'
import Image from 'next/image'

interface FooterProps {
  siteSettings: {
    siteName: string
    siteLogo: string
    favicon: string
    siteDescription: string
  }
}

export default function Footer({ siteSettings }: FooterProps) {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image 
                src={siteSettings.siteLogo}
                onError={(e) => {
                  // Fallback to default logo if image fails to load
                  const target = e.target as HTMLImageElement
                  if (target.src !== '/globe.svg') {
                    target.src = '/globe.svg'
                  }
                }} 
                alt={siteSettings.siteName}
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <h3 className="text-lg font-semibold">{siteSettings.siteName}</h3>
            </div>
            <p className="text-gray-300 text-sm">
              {siteSettings.siteDescription}
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/complaints" className="text-gray-300 hover:text-white">
                  Şikayetler
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-gray-300 hover:text-white">
                  Şirketler
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Hesap</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-gray-300 hover:text-white">
                  Giriş Yap
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-300 hover:text-white">
                  Kayıt Ol
                </Link>
              </li>
              <li>
                <Link href="/company-login" className="text-gray-300 hover:text-white">
                  Şirket Girişi
                </Link>
              </li>
              <li>
                <Link href="/company-register" className="text-gray-300 hover:text-white">
                  Şirket Üyeliği
                </Link>
              </li>
              <li>
                <Link href="/company-request" className="text-gray-300 hover:text-white">
                  Şirket Kayıt Talebi
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white">
                  Profil
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Yasal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white">
                  Kullanım Şartları
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-300 hover:text-white">
                  Çerez Politikası
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; 2024 {siteSettings.siteName}. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
