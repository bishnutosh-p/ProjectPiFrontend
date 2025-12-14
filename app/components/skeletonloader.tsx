export function SongCardSkeleton() {
  return (
    <div className="bg-[#1a1a1a] p-4 rounded-lg animate-fade-in">
      <div className="skeleton w-full aspect-square rounded-lg mb-4"></div>
      <div className="skeleton h-4 w-3/4 rounded mb-2"></div>
      <div className="skeleton h-3 w-1/2 rounded"></div>
    </div>
  );
}

export function SongListSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-lg animate-fade-in">
      <div className="skeleton w-8 h-4 rounded"></div>
      <div className="skeleton w-12 h-12 rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3 rounded"></div>
        <div className="skeleton h-3 w-1/2 rounded"></div>
      </div>
      <div className="skeleton w-10 h-10 rounded-full"></div>
    </div>
  );
}

export function PlaylistCardSkeleton() {
  return (
    <div className="bg-[#1a1a1a] p-4 rounded-lg animate-fade-in">
      <div className="skeleton w-full aspect-square rounded-lg mb-4"></div>
      <div className="skeleton h-4 w-3/4 rounded mb-2"></div>
      <div className="skeleton h-3 w-full rounded"></div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SongCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SongListSkeleton key={i} />
      ))}
    </div>
  );
}