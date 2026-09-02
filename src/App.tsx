import { Route, Routes, useLocation } from "react-router-dom"
import { motion } from "framer-motion"

import AppShell from "@/components/layout/AppShell"
import { ThemeProvider } from "@/lib/theme"
import { CartProvider } from "@/lib/cart"
import Home from "@/routes/Home"
import Shop from "@/routes/Shop"
import ChairDetail from "@/routes/ChairDetail"
import Cart from "@/routes/Cart"
import Checkout from "@/routes/Checkout"
import OrderConfirmation from "@/routes/OrderConfirmation"
import NotFound from "@/routes/NotFound"

export default function App() {
  const location = useLocation()

  return (
    <ThemeProvider>
      <CartProvider>
        <AppShell>
          {/* Keyed on the path so each route remounts and plays its entry
              animation. Deliberately NOT wrapped in <AnimatePresence
              mode="wait">: under React 19's StrictMode the exit never
              completes, so the outgoing page is held forever and every
              in-app navigation changes the URL while the view stays frozen.
              An entry-only transition costs the exit fade and cannot wedge.

              This key is load-bearing beyond the animation. Because the slug
              is part of the pathname, it is what remounts ChairDetail when you
              move between two product pages — measured, not assumed. That
              route keeps its own reset effect as a second line of defence, so
              removing this key degrades rather than breaks it. If you do change
              it, read that effect first: it is the only thing stopping a
              reader inheriting the previous chair's colourway and build. */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:slug" element={<ChairDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/:id" element={<OrderConfirmation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AppShell>
      </CartProvider>
    </ThemeProvider>
  )
}
