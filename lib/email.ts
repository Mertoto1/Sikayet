import * as nodemailer from 'nodemailer'
import { prisma } from './db'
import { getSiteSettings } from './settings'

// Helper function to get SMTP settings
async function getSMTPSetting(key: string): Promise<string | undefined> {
    try {
        const setting = await prisma.systemSetting.findUnique({ where: { key } })
        if (setting?.value) {
            console.log(`[SMTP] Found ${key} in database: ${key === 'SMTP_PASS' ? '***' : setting.value}`)
            return setting.value
        }
        const envValue = process.env[key]
        if (envValue) {
            console.log(`[SMTP] Found ${key} in environment: ${key === 'SMTP_PASS' ? '***' : envValue}`)
            return envValue
        }
        console.warn(`[SMTP] ${key} not found in database or environment`)
        return undefined
    } catch (error) {
        console.error(`[SMTP] Error fetching ${key} from database:`, error)
        const envValue = process.env[key]
        if (envValue) {
            console.log(`[SMTP] Using ${key} from environment: ${key === 'SMTP_PASS' ? '***' : envValue}`)
            return envValue
        }
        return undefined
    }
}

async function getTransporter() {
    const host = await getSMTPSetting('SMTP_HOST')
    if (!host) {
        console.warn('SMTP_HOST is not configured. Email sending will be skipped.')
        return null
    }

    const portStr = await getSMTPSetting('SMTP_PORT')
    const port = parseInt(portStr || '587')
    // Port 465 requires SSL/TLS (secure=true), port 587 uses STARTTLS (secure=false)
    const secureStr = await getSMTPSetting('SMTP_SECURE')
    let secure = secureStr === 'true'
    if (port === 465) {
        secure = true // Port 465 always requires SSL/TLS
    } else if (port === 587) {
        secure = false // Port 587 uses STARTTLS
    }
    const user = await getSMTPSetting('SMTP_USER')
    const pass = await getSMTPSetting('SMTP_PASS')

    console.log(`[SMTP] Creating transporter - host=${host}, port=${port}, secure=${secure}, user=${user ? '***' : 'undefined'}, pass=${pass ? '***' : 'undefined'}`)

    return nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure,
        auth: user && pass ? {
            user: user,
            pass: pass,
        } : undefined,
        // Add timeout configuration
        connectionTimeout: 30000, // 30 seconds (increased for slower connections)
        greetingTimeout: 30000,   // 30 seconds
        socketTimeout: 30000,     // 30 seconds
    })
}

export async function sendEmail(to: string, subject: string, html: string) {
    // Declare from outside try block so it's accessible in catch
    let from = ''
    
    console.log(`[EMAIL] sendEmail called - to: ${to}, subject: ${subject}`)
    
    try {
        console.log(`[EMAIL] Getting transporter...`)
        const transporter = await getTransporter()

        if (!transporter) {
            console.error('[EMAIL] No SMTP Configured (DB/Env). Email cannot be sent:', { to, subject })
            return { success: false, reason: 'No SMTP configuration' }
        }
        
        console.log(`[EMAIL] Transporter created successfully`)

        // Fetch settings
        const user = await getSMTPSetting('SMTP_USER')
        const host = await getSMTPSetting('SMTP_HOST')
        const smtpFrom = await getSMTPSetting('SMTP_FROM')
        const siteSettings = await getSiteSettings()
        const siteName = siteSettings.siteName
        
        // Extract domain from host for validation
        let smtpDomain = ''
        if (host) {
            smtpDomain = host.replace(/^smtp\./i, '').replace(/^mail\./i, '').toLowerCase()
        }
        
        // Check if SMTP_FROM contains a valid email address
        let fromHasValidEmail = false
        let fromDomain = ''
        if (smtpFrom) {
            const emailMatch = smtpFrom.match(/<([^>]+)>/) || smtpFrom.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
            if (emailMatch && emailMatch[1] && emailMatch[1].includes('@')) {
                fromHasValidEmail = true
                fromDomain = emailMatch[1].split('@')[1]?.toLowerCase() || ''
            }
        }
        
        // Construct From address - prioritize SMTP_USER for domain matching
        if (user && user.includes('@')) {
            // Always use SMTP_USER email as From address (best practice - same domain as auth)
            from = `"${siteName}" <${user}>`
        } else if (fromHasValidEmail && smtpDomain && fromDomain.endsWith(smtpDomain)) {
            // Use SMTP_FROM if it has a valid email and domain matches
            from = smtpFrom!
        } else if (host && smtpDomain) {
            // Extract domain from host (e.g., smtp.brandliftup.nl -> brandliftup.nl)
            from = `"${siteName}" <noreply@${smtpDomain}>`
        } else if (host) {
            from = `"${siteName}" <noreply@${host}>`
        } else {
            from = `"${siteName}" <noreply@example.com>`
        }
        
        console.log(`[EMAIL] From address constructed: ${from}`)
        console.log(`[EMAIL] Attempting to send email to ${to} with subject "${subject}" from ${from}`)

        const info = await transporter.sendMail({
            from,
            to,
            subject,
            html,
        })
        
        console.log(`[EMAIL] Email sent successfully! MessageId: ${info.messageId}, Response: ${info.response || 'N/A'}`)
        return { success: true, messageId: info.messageId }
    } catch (error: any) {
        console.error('Error sending email:', error)
        
        if (error.code === 'ETIMEDOUT') {
            console.error(`SMTP Connection Timeout: Could not connect to SMTP server at ${error.host || 'unknown host'}. Please check your SMTP settings and network connectivity.`)
        } else if (error.code === 'ECONNREFUSED') {
            console.error(`SMTP Connection Refused: The SMTP server at ${error.address || 'unknown address'}:${error.port || 'unknown port'} refused the connection. Please check your SMTP settings.`)
        } else if (error.code === 'EAUTH' || error.responseCode === 535) {
            console.info(`SMTP Configured but Auth Failed: ${error.message}. Email skipped (Registration continues).`)
        } else if (error.code === 'ENOTFOUND') {
            console.error(`SMTP Host Not Found: Could not resolve SMTP host. Please check your SMTP_HOST setting.`)
        } else if (error.code === 'EENVELOPE' || error.responseCode === 550) {
            const host = await getSMTPSetting('SMTP_HOST')
            const user = await getSMTPSetting('SMTP_USER')
            console.error(`SMTP From Address Error: ${error.response || error.message}`)
            console.error(`The From address domain must match the SMTP server domain.`)
            console.error(`Current From: ${from}`)
            console.error(`SMTP Host: ${host}`)
            console.error(`SMTP User: ${user ? '***' : 'undefined'}`)
            const siteSettings = await getSiteSettings()
            const siteName = siteSettings.siteName
            
            if (user && user.includes('@')) {
                console.error(`RECOMMENDATION: Set SMTP_FROM to: "${siteName}" <${user}> (using your SMTP_USER email)`)
            } else if (host) {
                const domain = host.replace(/^smtp\./i, '').replace(/^mail\./i, '')
                console.error(`RECOMMENDATION: Set SMTP_FROM to: "${siteName}" <noreply@${domain}>`)
            }
            console.error(`Please update SMTP_FROM in admin settings (/admin/settings) to use an email address from the same domain as your SMTP server.`)
        } else {
            console.error('Unexpected email sending error:', error)
        }
        
        return { success: false, error: error.message, code: error.code }
    }
}