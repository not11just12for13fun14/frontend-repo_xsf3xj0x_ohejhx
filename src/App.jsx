import { useEffect, useState } from 'react'
import Spline from '@splinetool/react-spline'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Navbar({ onSearch }) {
  const [query, setQuery] = useState('')
  return (
    <div className="fixed top-0 inset-x-0 z-50 backdrop-blur bg-white/70 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="text-xl font-bold tracking-tight">TechCart</div>
        <nav className="hidden md:flex gap-4 text-sm text-gray-600">
          <a href="#catalog" className="hover:text-gray-900">Catalog</a>
          <a href="#build" className="hover:text-gray-900">Build Your PC</a>
          <a href="#cart" className="hover:text-gray-900">Cart</a>
        </nav>
        <div className="ml-auto flex items-center gap-2 w-full md:w-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
            placeholder="Search CPUs, GPUs, RAM..."
            className="w-full md:w-72 px-3 py-2 rounded-md bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={() => onSearch(query)} className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Search</button>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
      <Spline scene="https://prod.spline.design/fcD-iW8YZHyBp1qq/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-white/90" />
      <div className="absolute inset-0 flex items-end md:items-center">
        <div className="max-w-7xl mx-auto w-full px-6 pb-10 md:pb-0">
          <div className="bg-white/70 backdrop-blur rounded-2xl p-6 md:p-10 shadow-xl max-w-xl">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">Build your dream PC</h1>
            <p className="mt-3 text-gray-700 md:text-lg">Browse high‑performance parts, compare specs, and customize your perfect setup.</p>
            <div className="mt-5 flex gap-3">
              <a href="#catalog" className="px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Shop Parts</a>
              <a href="#build" className="px-5 py-3 rounded-lg bg-gray-900 text-white hover:bg-black">Build Your PC</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CategoryPills({ categories, current, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => onSelect('')} className={`px-3 py-1.5 rounded-full border ${current === '' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'} border-gray-200`}>All</button>
      {categories.map(c => (
        <button key={c.slug} onClick={() => onSelect(c.slug)} className={`px-3 py-1.5 rounded-full border ${current === c.slug ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'} border-gray-200`}>{c.name}</button>
      ))}
    </div>
  )
}

function ProductCard({ p, onAdd }) {
  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="aspect-video rounded-md bg-gradient-to-br from-gray-100 to-gray-200 mb-3" style={{backgroundImage: p.image ? `url(${p.image})` : undefined, backgroundSize: 'cover'}} />
      <div className="text-sm text-gray-500">{p.brand || '—'} • {p.category}</div>
      <div className="font-semibold text-gray-900 mt-1 line-clamp-2 min-h-[3rem]">{p.name}</div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-blue-600 font-bold">${p.price?.toFixed(2)}</div>
        <button onClick={() => onAdd(p)} className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700">Add to cart</button>
      </div>
    </div>
  )
}

function Catalog() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async (params={}) => {
    setLoading(true)
    const qs = new URLSearchParams(params).toString()
    const res = await fetch(`${API_BASE}/products${qs ? `?${qs}` : ''}`)
    const data = await res.json()
    setProducts(data)
    setLoading(false)
  }

  const loadCats = async () => {
    const res = await fetch(`${API_BASE}/categories`)
    const data = await res.json()
    setCategories(data)
  }

  useEffect(() => {
    loadCats()
    load()
  }, [])

  const handleSearch = (query) => {
    setQ(query)
    load({ q: query, category: cat || undefined })
  }

  const handleSelectCat = (slug) => {
    setCat(slug)
    load({ q: q || undefined, category: slug || undefined })
  }

  const addToCart = async (p) => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login first')
      return
    }
    await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ product_id: p.id, quantity: 1 })
    })
    alert('Added to cart')
  }

  return (
    <section id="catalog" className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Popular parts</h2>
          <CategoryPills categories={categories} current={cat} onSelect={handleSelectCat} />
        </div>

        {loading ? (
          <div className="text-gray-500">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} p={p} onAdd={addToCart} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function AuthPanel() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })

  const submit = async () => {
    if (mode === 'register') {
      const res = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: form.username, email: form.email, password: form.password }) })
      if (!res.ok) { alert('Registration failed'); return }
      alert('Registered! Now login.')
      setMode('login')
      return
    }
    const body = new URLSearchParams({ username: form.username, password: form.password })
    const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('token', data.access_token)
      alert('Logged in!')
    } else {
      alert(data.detail || 'Login failed')
    }
  }

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-xl font-bold mb-2">Your account</h3>
          <p className="text-gray-600">Sign in to add items to cart and checkout.</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex gap-2 mb-3">
            <button onClick={() => setMode('login')} className={`px-3 py-1.5 rounded-md ${mode==='login'? 'bg-gray-900 text-white':'bg-white border'}`}>Login</button>
            <button onClick={() => setMode('register')} className={`px-3 py-1.5 rounded-md ${mode==='register'? 'bg-gray-900 text-white':'bg-white border'}`}>Register</button>
          </div>
          <div className="grid gap-2">
            <input placeholder="Username" value={form.username} onChange={(e)=>setForm({...form, username:e.target.value})} className="px-3 py-2 rounded-md border" />
            {mode==='register' && <input placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} className="px-3 py-2 rounded-md border" />}
            <input type="password" placeholder="Password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} className="px-3 py-2 rounded-md border" />
            <button onClick={submit} className="mt-2 px-4 py-2 rounded-md bg-blue-600 text-white">{mode==='login'? 'Login':'Create account'}</button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-10 bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-semibold">TechCart</div>
        <div className="text-sm">© {new Date().getFullYear()} TechCart. Built for custom PC lovers.</div>
        <a href="/test" className="text-sm underline hover:text-white">System status</a>
      </div>
    </footer>
  )
}

function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar onSearch={()=>{}} />
      <main className="pt-16">
        <Hero />
        <Catalog key={refreshKey} />
        <AuthPanel />
      </main>
      <Footer />
    </div>
  )
}

export default App
