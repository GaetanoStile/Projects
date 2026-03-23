import { useNavigate } from 'react-router-dom'
import BlogSection from '@/components/landing/BlogSection'
import Features from '@/components/landing/Features'
import LandingHero from '@/components/landing/LandingHero'
import MarketingLayout from '@/components/landing/MarketingLayout'
import NovelSection from '@/components/landing/NovelSection'
import { getStartGamePath } from '@/lib/routes'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <MarketingLayout>
      <LandingHero onStartPlaying={() => navigate(getStartGamePath())} />
      <Features />
      <BlogSection />
      <NovelSection />
    </MarketingLayout>
  )
}
