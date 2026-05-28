// placeholder data until real activities are fetched from supabase
// split into three arrays matching the three homepage sections

export type Activity = {
  id: number
  title: string
  rating: number
  location: string
  imageUrl: string
  category: 'Restaurant' | 'Place' | 'Service' | 'Product' | 'Event'
  attendeeCount: number
  tags: string[]
  isBookmarked?: boolean
}

// picsum.photos gives a consistent placeholder image per seed string
export const TRENDING: Activity[] = [
  { id: 1,  title: 'Sundays in LA',           rating: 4.5, location: 'Sunset Recreation, Los Angeles', imageUrl: 'https://picsum.photos/seed/sunday/400/300',   category: 'Restaurant', attendeeCount: 46,  tags: ['Solo', 'Free'] },
  { id: 2,  title: 'Spikeball at Janss Steps', rating: 5.4, location: 'Janss Steps, UCLA',              imageUrl: 'https://picsum.photos/seed/spike/400/300',   category: 'Place',      attendeeCount: 28,  tags: ['Solo', 'Free'] },
  { id: 3,  title: 'LACMA After Dark',         rating: 4.5, location: 'Wilshire Blvd, Los Angeles',    imageUrl: 'https://picsum.photos/seed/lacma/400/300',    category: 'Service',    attendeeCount: 63,  tags: ['Solo', 'Free'] },
  { id: 4,  title: 'Grand Central Market',     rating: 4.8, location: 'Downtown Los Angeles',           imageUrl: 'https://picsum.photos/seed/market/400/300',  category: 'Product',    attendeeCount: 91,  tags: ['Group', 'Paid'] },
  { id: 5,  title: 'Griffith Observatory',     rating: 4.9, location: 'Griffith Park, Los Angeles',    imageUrl: 'https://picsum.photos/seed/griffith/400/300', category: 'Event',      attendeeCount: 120, tags: ['Solo', 'Free'] },
  { id: 6,  title: 'Abbot Kinney Food Tour',   rating: 4.6, location: 'Venice, Los Angeles',            imageUrl: 'https://picsum.photos/seed/abbot/400/300',   category: 'Restaurant', attendeeCount: 34,  tags: ['Group', 'Paid'] },
]

export const OFF_CAMPUS: Activity[] = [
  { id: 7,  title: 'Santa Monica Pier',        rating: 4.3, location: 'Santa Monica, CA',              imageUrl: 'https://picsum.photos/seed/pier/400/300',    category: 'Place',      attendeeCount: 82,  tags: ['Group', 'Free'] },
  { id: 8,  title: 'The Getty Center',         rating: 4.9, location: 'Sepulveda Pass, Los Angeles',   imageUrl: 'https://picsum.photos/seed/getty/400/300',   category: 'Service',    attendeeCount: 55,  tags: ['Solo', 'Free'] },
  { id: 9,  title: 'Runyon Canyon Hike',       rating: 4.7, location: 'Hollywood Hills, Los Angeles',  imageUrl: 'https://picsum.photos/seed/runyon/400/300',  category: 'Event',      attendeeCount: 40,  tags: ['Solo', 'Free'] },
  { id: 10, title: 'Echo Park Night Market',   rating: 4.4, location: 'Echo Park, Los Angeles',        imageUrl: 'https://picsum.photos/seed/echo/400/300',    category: 'Product',    attendeeCount: 67,  tags: ['Group', 'Free'] },
  { id: 11, title: 'Nobu Malibu',              rating: 4.8, location: 'Malibu, CA',                    imageUrl: 'https://picsum.photos/seed/nobu/400/300',    category: 'Restaurant', attendeeCount: 22,  tags: ['Group', 'Paid'] },
  { id: 12, title: 'Venice Skate Park',        rating: 4.2, location: 'Venice Beach, Los Angeles',     imageUrl: 'https://picsum.photos/seed/skate/400/300',   category: 'Place',      attendeeCount: 38,  tags: ['Solo', 'Free'] },
]

export const ON_CAMPUS: Activity[] = [
  { id: 13, title: 'Bruin Plate Breakfast',    rating: 4.6, location: 'De Neve Plaza, UCLA',           imageUrl: 'https://picsum.photos/seed/plate/400/300',    category: 'Restaurant', attendeeCount: 74,  tags: ['Solo', 'Paid'] },
  { id: 14, title: 'Powell Library Study',     rating: 4.5, location: 'Powell Library, UCLA',          imageUrl: 'https://picsum.photos/seed/powell/400/300',   category: 'Service',    attendeeCount: 50,  tags: ['Solo', 'Free'] },
  { id: 15, title: 'Sculpture Garden Walk',    rating: 4.7, location: 'Franklin Murphy Garden, UCLA',  imageUrl: 'https://picsum.photos/seed/garden/400/300',   category: 'Place',      attendeeCount: 18,  tags: ['Solo', 'Free'] },
  { id: 16, title: 'Ackerman Underground',     rating: 4.3, location: 'Ackerman Union, UCLA',          imageUrl: 'https://picsum.photos/seed/ackerman/400/300', category: 'Restaurant', attendeeCount: 95,  tags: ['Group', 'Paid'] },
  { id: 17, title: 'Sunset Rec Volleyball',    rating: 4.8, location: 'Sunset Canyon Recreation',      imageUrl: 'https://picsum.photos/seed/volley/400/300',   category: 'Event',      attendeeCount: 30,  tags: ['Group', 'Free'] },
  { id: 18, title: 'Hammer Museum Visit',      rating: 4.6, location: 'Wilshire Blvd, Westwood',       imageUrl: 'https://picsum.photos/seed/hammer/400/300',   category: 'Service',    attendeeCount: 25,  tags: ['Solo', 'Free'] },
]
