export function calculateCompanyScore(stats: {
    totalComplaints: number
    solvedCount: number
    reviewCount: number
    averageRating: number | null
    isVerified: boolean
}) {
    // Base weightings
    const RESOLUTION_WEIGHT = 0.50  // 50% - En önemli faktör
    const SATISFACTION_WEIGHT = 0.30 // 30% - Kullanıcı memnuniyeti
    const RELIABILITY_WEIGHT = 0.15 // 15% - Doğrulanmış firma
    const VOLUME_WEIGHT = 0.05      // 5% - Aktivite göstergesi

    // 1. Resolution Rate (0-100)
    // Çözüm oranı: Çözülen şikayet / Toplam şikayet
    const resolutionRate = stats.totalComplaints > 0
        ? Math.min((stats.solvedCount / stats.totalComplaints) * 100, 100)
        : 50 // Şikayet yoksa neutral skor (50)

    // 2. Satisfaction Score (0-100)
    // Kullanıcı puanlarını 1-5'ten 0-100'e çevir
    let satisfactionScore = 0
    if (stats.averageRating && stats.averageRating > 0) {
        satisfactionScore = (stats.averageRating / 5) * 100
    } else if (stats.reviewCount === 0 && stats.totalComplaints === 0) {
        // Hiç şikayet ve yorum yoksa neutral skor
        satisfactionScore = 50
    } else if (stats.reviewCount === 0) {
        // Şikayet var ama yorum yoksa düşük skor
        satisfactionScore = 30
    }

    // 3. Reliability (Verified or not)
    // Doğrulanmış firmalar daha güvenilir
    const reliabilityScore = stats.isVerified ? 100 : 50

    // 4. Volume Score (0-100)
    // Aktivite göstergesi - çok az şikayet varsa düşük, makul sayıda varsa yüksek
    let volumeScore = 0
    if (stats.totalComplaints === 0) {
        volumeScore = 30 // Hiç şikayet yoksa düşük skor
    } else if (stats.totalComplaints < 5) {
        // 1-4 şikayet: Düşük aktivite
        volumeScore = 40 + (stats.totalComplaints * 5) // 45-60 arası
    } else if (stats.totalComplaints < 20) {
        // 5-19 şikayet: Orta aktivite
        volumeScore = 60 + ((stats.totalComplaints - 5) * 2) // 60-90 arası
    } else {
        // 20+ şikayet: Yüksek aktivite
        volumeScore = Math.min(90 + Math.log10(stats.totalComplaints) * 2, 100)
    }

    // Calculate Weighted Average
    let weightedScore =
        (resolutionRate * RESOLUTION_WEIGHT) +
        (satisfactionScore * SATISFACTION_WEIGHT) +
        (reliabilityScore * RELIABILITY_WEIGHT) +
        (volumeScore * VOLUME_WEIGHT)

    // Ensure score is between 0-100
    weightedScore = Math.max(0, Math.min(100, weightedScore))

    // Round to nearest integer
    return Math.round(weightedScore)
}
