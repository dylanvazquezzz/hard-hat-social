export const TRADES = [
  'Welding',
  'HVAC',
  'Electrical',
  'Plumbing',
  'General Contractor',
  'Drywall',
] as const

export const TRADES_WITH_OTHER = [...TRADES, 'Other'] as const
