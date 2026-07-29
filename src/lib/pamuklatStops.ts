export interface PamuklatStop {
  id: string
  title: string
  description: string
  instructions: string
  representative: string
  stamp_image_url: string
  destination_color: string
  icon: string
  status: string
  gate_number: string
  estimated_duration: string
}

export const OFFICIAL_PAMUKLAT_STOPS: PamuklatStop[] = [
  {
    id: 'pamuklat-stop-1',
    title: 'Attend the Pamuklat',
    description: 'Attend the official morning opening orientation and welcome ceremony for CIT Freshmen.',
    instructions: '1. Arrive at the Main Auditorium.\n2. Sign the attendance log.\n3. Scan your passport QR at the gate to claim your stamp.',
    representative: 'UA CIT Student Council',
    stamp_image_url: '',
    destination_color: '#1E4FCC',
    icon: 'MapPin',
    status: 'active',
    gate_number: 'GATE 01',
    estimated_duration: '45 mins',
  },
  {
    id: 'pamuklat-stop-2',
    title: 'Go to SSITE Booth 1',
    description: 'Visit SSITE Booth 1 to meet your student organization officers and learn about CIT org perks.',
    instructions: '1. Proceed to SSITE Booth 1 in the lobby.\n2. Meet your batch representatives.\n3. Scan the gate QR code to claim your stamp.',
    representative: 'SSITE Officers',
    stamp_image_url: '',
    destination_color: '#16A34A',
    icon: 'Compass',
    status: 'active',
    gate_number: 'GATE 02',
    estimated_duration: '10 mins',
  },
  {
    id: 'pamuklat-stop-3',
    title: 'Go to SSITE Booth 2',
    description: 'Visit SSITE Booth 2 to participate in interactive tech games and win prizes.',
    instructions: '1. Visit SSITE Booth 2.\n2. Participate in the quick mini tech challenge.\n3. Scan the booth QR code to receive your stamp.',
    representative: 'SSITE Event Team',
    stamp_image_url: '',
    destination_color: '#D97706',
    icon: 'Award',
    status: 'active',
    gate_number: 'GATE 03',
    estimated_duration: '15 mins',
  },
  {
    id: 'pamuklat-stop-4',
    title: 'Take a Photo in the Photobooth',
    description: 'Capture your memorable Pamuklat 2026 souvenir photo at the official CIT Photobooth.',
    instructions: '1. Line up at the photobooth area.\n2. Strike a pose with your classmates.\n3. Scan the photobooth QR code to stamp your passport.',
    representative: 'Media & Documentation Team',
    stamp_image_url: '',
    destination_color: '#E11D48',
    icon: 'Camera',
    status: 'active',
    gate_number: 'GATE 04',
    estimated_duration: '10 mins',
  },
  {
    id: 'pamuklat-stop-5',
    title: 'Browse the Projects',
    description: 'Explore the capstone innovation projects, software demos, and hardware exhibits built by CIT seniors.',
    instructions: '1. Tour the project exhibition hall.\n2. Watch at least 2 project demonstrations.\n3. Scan the exhibit QR code to get your stamp.',
    representative: 'CIT Project Exhibitors',
    stamp_image_url: '',
    destination_color: '#9333EA',
    icon: 'BookOpen',
    status: 'active',
    gate_number: 'GATE 05',
    estimated_duration: '20 mins',
  },
  {
    id: 'pamuklat-stop-6',
    title: 'Subscribe to YT Channel',
    description: 'Subscribe to the official SSITE YouTube Channel for video tutorials, livestreams, and tech talks.',
    instructions: '1. Scan the YouTube channel QR code.\n2. Hit the Subscribe button.\n3. Show your subscription confirmation to receive your passport stamp.',
    representative: 'SSITE Media Officer',
    stamp_image_url: '',
    destination_color: '#DC2626',
    icon: 'Video',
    status: 'active',
    gate_number: 'GATE 06',
    estimated_duration: '5 mins',
  },
  {
    id: 'pamuklat-stop-7',
    title: 'Follow FB Page',
    description: 'Follow the official SSITE Facebook Page for daily department updates, announcements, and news.',
    instructions: '1. Open the SSITE Facebook Page.\n2. Tap Follow / Like.\n3. Present screen confirmation to scan and claim your stamp.',
    representative: 'SSITE PR Committee',
    stamp_image_url: '',
    destination_color: '#2563EB',
    icon: 'ThumbsUp',
    status: 'active',
    gate_number: 'GATE 07',
    estimated_duration: '5 mins',
  },
  {
    id: 'pamuklat-stop-8',
    title: 'Attend Afternoon Session',
    description: 'Participate in the afternoon plenary talks, student panel discussions, and closing raffle.',
    instructions: '1. Return to the Main Assembly Hall for the afternoon session.\n2. Complete session evaluation.\n3. Scan the gate QR code to secure your final clearance stamp.',
    representative: 'CIT Program Director',
    stamp_image_url: '',
    destination_color: '#0F1D36',
    icon: 'Clock',
    status: 'active',
    gate_number: 'GATE 08',
    estimated_duration: '60 mins',
  },
]
