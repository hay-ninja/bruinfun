import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import ActivityCard from './activity-card'

vi.mock('next/link', () => ({
  default: ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

describe('ActivityCard', () => {
  const baseProps = {
    title: 'Pickleball at Sunset Rec',
    rating: 4.8,
    location: 'UCLA',
    imageUrl: 'https://example.com/image.jpg',
  }

  it('renders plain card when href is not provided', () => {
    const html = renderToStaticMarkup(<ActivityCard {...baseProps} />)
    expect(html).not.toContain('<a ')
  })

  it('renders linked card when href is provided', () => {
    const html = renderToStaticMarkup(<ActivityCard {...baseProps} href="/activities/123" />)
    expect(html).toContain('<a href="/activities/123"')
    expect(html).toContain('hover:-translate-y-[2px]')
  })
})
