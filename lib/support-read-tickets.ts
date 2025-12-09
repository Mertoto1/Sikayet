// Shared utility for tracking read support tickets
// In-memory store for tracking read tickets (in a real app, this would be in a database)
const readTickets = new Map<string, Set<string>>(); // userId -> Set of ticketIds

export function markTicketAsRead(userId: string, ticketId: string) {
  // Initialize user's read tickets set if it doesn't exist
  if (!readTickets.has(userId)) {
    readTickets.set(userId, new Set());
  }

  // Mark ticket as read for this user
  readTickets.get(userId)!.add(ticketId);
}

export function getReadTicketsForUser(userId: string): string[] {
  const userReadTickets = readTickets.get(userId) || new Set();
  return Array.from(userReadTickets);
}

export function clearReadTicketsForUser(userId: string) {
  readTickets.delete(userId);
}