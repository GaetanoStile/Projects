import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Hero from './pages/Hero'
import HomePage from './pages/HomePage'
import Blog from './pages/Blog'
import Novel from './pages/Novel'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Dice from './pages/Dice'
import Game from './pages/Game'
import Settings from './pages/Settings'
import Create from './pages/Create'
import Admin from './pages/Admin'
import HowToPlay from './pages/HowToPlay'
import Disclaimer from './pages/Disclaimer'

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/welcome" element={<Hero />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/novel" element={<Novel />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
          <Route path="/create" element={<Create />} />
          <Route path="/dice" element={<Dice />} />
          <Route path="/game" element={<Game />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}

export default App
