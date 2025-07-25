
'use client'
import { useState } from 'react'

interface Review {
  name: string
  rating: number
  comment: string
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setReviews([...reviews, form])
    setForm({ name: '', rating: 5, comment: '' })
  }

  return (
    <section className="p-4">
      <h2 className="text-xl font-bold mb-2">Reseñas</h2>
      <form onSubmit={handleSubmit} className="space-y-2 mb-4">
        <input
          className="border p-1 w-full"
          placeholder="Tu nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="number"
          min="1"
          max="5"
          className="border p-1 w-full"
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
          required
        />
        <textarea
          className="border p-1 w-full"
          placeholder="Tu comentario"
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">
          Enviar Reseña
        </button>
      </form>
      <ul className="space-y-2">
        {reviews.map((r, i) => (
          <li key={i} className="border p-2 rounded">
            <strong>{r.name}</strong> ({r.rating}/5): {r.comment}
          </li>
        ))}
      </ul>
    </section>
  )
}
