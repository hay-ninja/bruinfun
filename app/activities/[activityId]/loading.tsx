import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ActivityDetailsLoading() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="px-[90px] py-[48px]">
        <div className="mx-auto max-w-[920px] rounded-[24px] border border-[rgba(192,199,209,0.6)] bg-[rgba(255,255,255,0.7)] p-6 shadow-[0px_1.68px_16.78px_-1px_rgba(0,0,0,0.12)]">
          <div className="mb-6 h-[360px] w-full animate-pulse rounded-[16px] bg-[#e9eef2]" />

          <div className="h-10 w-2/3 animate-pulse rounded-md bg-[#e9eef2]" />
          <div className="mt-4 h-6 w-1/2 animate-pulse rounded-md bg-[#eef2f5]" />
          <div className="mt-6 h-20 w-full animate-pulse rounded-md bg-[#eef2f5]" />

          <div className="mt-8 border-t border-[rgba(192,199,209,0.6)] pt-6">
            <div className="h-8 w-40 animate-pulse rounded-md bg-[#e9eef2]" />
            <div className="mt-4 h-32 w-full animate-pulse rounded-xl bg-[#eef2f5]" />
            <div className="mt-4 h-24 w-full animate-pulse rounded-xl bg-[#eef2f5]" />
            <div className="mt-3 h-24 w-full animate-pulse rounded-xl bg-[#eef2f5]" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}