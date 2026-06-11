import HomeNav        from '../components/home/HomeNav'
import HomeHero       from '../components/home/HomeHero'
import HomeStrip      from '../components/home/HomeStrip'
import HomeHowItWorks from '../components/home/HomeHowItWorks'
import HomeFeatures   from '../components/home/HomeFeatures'
import HomeFaq        from '../components/home/HomeFaq'
import HomeFooter     from '../components/home/HomeFooter'

export default function HomePage() {
  return (
    <div className="overflow-x-hidden" style={{ background: 'var(--lnd-navy-deep)' }}>
      <HomeNav />
      <HomeHero />
      <HomeStrip />
      <HomeHowItWorks />
      <HomeFeatures />
      <HomeFaq />
      <HomeFooter />
    </div>
  )
}