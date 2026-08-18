import type { Company } from '../types'

interface CompanyLogoProps {
  company: Company
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 32,
  md: 40,
  lg: 64,
}

export function CompanyLogo({ company, size = 'md', className = '' }: CompanyLogoProps) {
  const px = sizes[size]

  if (company.logoUrl) {
    return (
      <img
        src={company.logoUrl}
        alt={`${company.name} logo`}
        className={`company-logo ${className}`}
        style={{ width: px, height: px }}
      />
    )
  }

  return (
    <span
      className={`company-logo-fallback ${className}`}
      style={{ width: px, height: px, fontSize: px * 0.45 }}
      aria-hidden
    >
      {company.name.charAt(0)}
    </span>
  )
}
