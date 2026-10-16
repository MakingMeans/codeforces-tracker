import { Footer } from './components/layout/footer'
import { TopBar } from './components/layout/top-bar'
import { Home } from './pages/home'

export default function App() {
  return (
    <div className="flex min-h-svh flex-col">
      <TopBar />
      <main className="flex-1">
        <Home />
      </main>
      <Footer />
    </div>
  )
}
