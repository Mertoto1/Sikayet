import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // 1. Create Sectors
    const splitSectors = [
        'Bankacılık & Finans', 'E-Ticaret', 'Kargo & Lojistik',
        'Telekomünikasyon', 'İnternet Servis Sağlayıcıları', 'Bahis & Şans Oyunları',
        'Beyaz Eşya', 'Giyim & Moda', 'Market & Gıda', 'Turizm & Otel'
    ]

    const sectorMap = new Map()

    for (const name of splitSectors) {
        const sector = await prisma.sector.upsert({
            where: { name },
            update: {},
            create: { name }
        })
        sectorMap.set(name, sector.id)
        console.log(`Created sector: ${name}`)
    }

    // 2. Create Companies
    const companies = [
        
        // --- Yasal Bahis & Şans Oyunları ---
        { name: 'Mariobet', sector: 'Bahis & Şans Oyunları', slug: 'mariobet' },
        { name: 'Bahis.com', sector: 'Bahis & Şans Oyunları', slug: 'bahis-com' },
        { name: 'Bets10', sector: 'Bahis & Şans Oyunları', slug: 'bets10' },
        { name: 'Mobilbahis', sector: 'Bahis & Şans Oyunları', slug: 'mobilbahis' },
        { name: 'Trbet', sector: 'Bahis & Şans Oyunları', slug: 'trbet' },
        { name: 'Artemisbet', sector: 'Bahis & Şans Oyunları', slug: 'artemisbet' },
        { name: 'Tempobet', sector: 'Bahis & Şans Oyunları', slug: 'tempobet' },
        { name: 'Bettilt', sector: 'Bahis & Şans Oyunları', slug: 'bettilt' },
        { name: 'Yakabet', sector: 'Bahis & Şans Oyunları', slug: 'yakabet' },
        { name: 'Extrabet', sector: 'Bahis & Şans Oyunları', slug: 'extrabet' },
        { name: 'Shangri La', sector: 'Bahis & Şans Oyunları', slug: 'shangrila' },
        { name: 'Betandyou', sector: 'Bahis & Şans Oyunları', slug: 'betandyou' },
        { name: 'Misli', sector: 'Bahis & Şans Oyunları', slug: 'misli' },
        { name: 'Tuttur', sector: 'Bahis & Şans Oyunları', slug: 'tuttur' },
        { name: 'Bilyoner', sector: 'Bahis & Şans Oyunları', slug: 'bilyoner' },
        { name: 'Betboo', sector: 'Bahis & Şans Oyunları', slug: 'betboo' },
        { name: 'Bahigo', sector: 'Bahis & Şans Oyunları', slug: 'bahigo' },
        { name: 'Efesbet', sector: 'Bahis & Şans Oyunları', slug: 'efesbet' },
        { name: 'Hayalbahis', sector: 'Bahis & Şans Oyunları', slug: 'hayalbahis' },
        { name: 'Bahsegel', sector: 'Bahis & Şans Oyunları', slug: 'bahsegel' },
        { name: 'Casinofast', sector: 'Bahis & Şans Oyunları', slug: 'casinofast' },
        { name: 'Royalbahis', sector: 'Bahis & Şans Oyunları', slug: 'royalbahis' },
        { name: 'Betkare', sector: 'Bahis & Şans Oyunları', slug: 'betkare' },
        { name: 'Sekabet', sector: 'Bahis & Şans Oyunları', slug: 'sekabet' },
        { name: 'Maritbet', sector: 'Bahis & Şans Oyunları', slug: 'maritbet' },
        { name: 'Millicasino', sector: 'Bahis & Şans Oyunları', slug: 'millicasino' },
        { name: 'Pusulabet', sector: 'Bahis & Şans Oyunları', slug: 'pusulabet' },
        { name: 'Berlinbet', sector: 'Bahis & Şans Oyunları', slug: 'berlinbet' },
        { name: 'Orisbet', sector: 'Bahis & Şans Oyunları', slug: 'orisbet' },
        { name: 'Casinosu', sector: 'Bahis & Şans Oyunları', slug: 'casinosu' },
        { name: 'Casinoslot', sector: 'Bahis & Şans Oyunları', slug: 'casinoslot' },
        { name: 'Slotbar', sector: 'Bahis & Şans Oyunları', slug: 'slotbar' },
        { name: 'Vdcasino', sector: 'Bahis & Şans Oyunları', slug: 'vdcasino' },
        { name: 'İlbet', sector: 'Bahis & Şans Oyunları', slug: 'ilbet' },
        { name: 'Hitbet', sector: 'Bahis & Şans Oyunları', slug: 'hitbet' },
        { name: 'Zumabet', sector: 'Bahis & Şans Oyunları', slug: 'zumabet' },
        { name: 'Rekabet', sector: 'Bahis & Şans Oyunları', slug: 'rekabet' },
        { name: 'Casinosan', sector: 'Bahis & Şans Oyunları', slug: 'casinosan' },
        { name: 'Betcool', sector: 'Bahis & Şans Oyunları', slug: 'betcool' },
        { name: 'Restbet', sector: 'Bahis & Şans Oyunları', slug: 'restbet' },
        { name: 'Betebet', sector: 'Bahis & Şans Oyunları', slug: 'betebet' },
        { name: '1xbet', sector: 'Bahis & Şans Oyunları', slug: '1xbet' },
        { name: 'Pinbahis', sector: 'Bahis & Şans Oyunları', slug: 'pinbahis' },
        { name: 'Mbh', sector: 'Bahis & Şans Oyunları', slug: 'mbh' },
        { name: 'Betsan', sector: 'Bahis & Şans Oyunları', slug: 'betsan' },
        { name: 'Betmatik', sector: 'Bahis & Şans Oyunları', slug: 'betmatik' },
        { name: 'Nesine', sector: 'Bahis & Şans Oyunları', slug: 'nesine' },
        { name: 'Oley', sector: 'Bahis & Şans Oyunları', slug: 'oley' },
        { name: 'İddaa', sector: 'Bahis & Şans Oyunları', slug: 'iddaa' },
        { name: 'Casibom', sector: 'Bahis & Şans Oyunları', slug: 'casibom' },
        { name: 'Betturkey', sector: 'Bahis & Şans Oyunları', slug: 'betturkey' },
        { name: 'Perabet', sector: 'Bahis & Şans Oyunları', slug: 'perabet' },
        { name: 'Asyabahis', sector: 'Bahis & Şans Oyunları', slug: 'asyabahis' },
        { name: 'Betonvis', sector: 'Bahis & Şans Oyunları', slug: 'betonvis' },
        { name: 'Jestbahis', sector: 'Bahis & Şans Oyunları', slug: 'jestbahis' },
        { name: 'Betsmov', sector: 'Bahis & Şans Oyunları', slug: 'betsmov' },
        { name: 'Betcid', sector: 'Bahis & Şans Oyunları', slug: 'betcid' },
        { name: 'Hilbet', sector: 'Bahis & Şans Oyunları', slug: 'hilbet' },
        { name: 'İmajbet', sector: 'Bahis & Şans Oyunları', slug: 'imajbet' },
        { name: 'Klasbahis', sector: 'Bahis & Şans Oyunları', slug: 'klasbahis' },
        { name: 'Maksiabet', sector: 'Bahis & Şans Oyunları', slug: 'maksiabet' },
        { name: 'Nobet', sector: 'Bahis & Şans Oyunları', slug: 'nobet' },
        { name: 'Payfixbet', sector: 'Bahis & Şans Oyunları', slug: 'payfixbet' },
        { name: 'Süperbahis', sector: 'Bahis & Şans Oyunları', slug: 'superbahis' },
        { name: 'Tombala', sector: 'Bahis & Şans Oyunları', slug: 'tombala' },
        { name: 'Vbet', sector: 'Bahis & Şans Oyunları', slug: 'vbet' },
        { name: 'Wonodd', sector: 'Bahis & Şans Oyunları', slug: 'wonodd' },
        { name: 'Xbahis', sector: 'Bahis & Şans Oyunları', slug: 'xbahis' },
        { name: 'Youwin', sector: 'Bahis & Şans Oyunları', slug: 'youwin' },
        { name: 'Zirvebet', sector: 'Bahis & Şans Oyunları', slug: 'zirvebet' },
        { name: 'Onwin', sector: 'Bahis & Şans Oyunları', slug: 'onwin' },
        { name: 'Tipobet', sector: 'Bahis & Şans Oyunları', slug: 'tipobet' },
        { name: 'Otobet', sector: 'Bahis & Şans Oyunları', slug: 'otobet' },
        { name: 'Sahabet', sector: 'Bahis & Şans Oyunları', slug: 'sahabet' },
        { name: 'Matadorbet', sector: 'Bahis & Şans Oyunları', slug: 'matadorbet' },
        { name: 'Betpublic', sector: 'Bahis & Şans Oyunları', slug: 'betpublic' },
        { name: 'Zbahis', sector: 'Bahis & Şans Oyunları', slug: 'zbahis' },
        { name: 'Xslot', sector: 'Bahis & Şans Oyunları', slug: 'xslot' },
        { name: 'Fixbet', sector: 'Bahis & Şans Oyunları', slug: 'fixbet' },
        { name: 'Bycasino', sector: 'Bahis & Şans Oyunları', slug: 'bycasino' },
        { name: 'Starzbet', sector: 'Bahis & Şans Oyunları', slug: 'starzbet' },
        { name: 'Grandpashabet', sector: 'Bahis & Şans Oyunları', slug: 'grandpashabet' },
        { name: 'Betpark', sector: 'Bahis & Şans Oyunları', slug: 'betpark' },
        { name: 'Ligobet', sector: 'Bahis & Şans Oyunları', slug: 'ligobet' },
        { name: 'Romabet', sector: 'Bahis & Şans Oyunları', slug: 'romabet' },
        { name: 'Alev Casino', sector: 'Bahis & Şans Oyunları', slug: 'alevcasino' },
        { name: 'GetirBet', sector: 'Bahis & Şans Oyunları', slug: 'getirbet' },
        { name: 'Betsson', sector: 'Bahis & Şans Oyunları', slug: 'betsson' },

        
    ];

    for (const comp of companies) {
        const sectorId = sectorMap.get(comp.sector)
        await prisma.company.upsert({
            where: { slug: comp.slug },
            update: { sectorId },
            create: {
                name: comp.name,
                slug: comp.slug,
                description: `${comp.name}, ${comp.sector} alanında hizmet veren öncü bir markadır.`,
                sectorId,
                isApproved: true
            }
        })
        console.log(`Created company: ${comp.name}`)
    }

    // 3. Admin User (if not exists)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sikayetvar.clone'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    const adminUsername = process.env.ADMIN_USERNAME || 'superadmin'
    const adminName = process.env.ADMIN_NAME || 'Super'
    const adminSurname = process.env.ADMIN_SURNAME || 'Admin'
    
    const password = await hash(adminPassword, 12)
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: adminName,
            role: 'ADMIN',
            password,
            isVerified: true
        }
    })
    console.log(`Admin user created/updated: ${adminEmail}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
