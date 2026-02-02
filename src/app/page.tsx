import { mockLooks } from '@/data/mockLooks';
import LookCard from '@/components/feed/LookCard';

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-4xl font-bold text-gray-900">
            Trouve ton look parfait 
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Inspire-toi des looks de notre communauté et achète directement les produits utilisés.
          </p>
        </div>

        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {['Tous', 'Natural', 'Glam', 'Bold', 'Everyday'].map((filter) => (
            <button
              key={filter}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                filter === 'Tous'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {mockLooks.map((look) => (
            <LookCard 
              key={look.id} 
              look={look}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="rounded-full bg-gray-100 px-8 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-200">
            Voir plus de looks
          </button>
        </div>
      </main>
    </div>
  );
}