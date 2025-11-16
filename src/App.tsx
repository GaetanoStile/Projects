import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Hero from './pages/Hero'
import Dice from './pages/Dice'
import Game from './pages/Game'
import Settings from './pages/Settings'
import Create from './pages/Create'

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/create" element={<Create />} />
          <Route path="/dice" element={<Dice />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}

export default App
