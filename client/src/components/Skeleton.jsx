import { motion } from 'framer-motion';

export const BlogCardSkeleton = () => (
  <div className="neo-card overflow-hidden">
    <div className="skeleton h-48 w-full rounded-none" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-3 w-16 rounded-full" />
      <div className="skeleton h-5 w-full" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-2/3" />
      <div className="flex items-center gap-2 pt-2">
        <div className="skeleton w-7 h-7 rounded-full" />
        <div className="space-y-1">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-2 w-14" />
        </div>
      </div>
    </div>
  </div>
);

export const HeroSkeleton = () => (
  <div className="neo-card p-8 space-y-4">
    <div className="skeleton h-4 w-20 rounded-full" />
    <div className="skeleton h-10 w-4/5" />
    <div className="skeleton h-10 w-3/5" />
    <div className="skeleton h-5 w-2/3" />
    <div className="flex gap-3">
      <div className="skeleton h-12 w-32 rounded-full" />
      <div className="skeleton h-12 w-32 rounded-full" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="neo-card p-6 flex flex-col items-center gap-4">
      <div className="skeleton w-24 h-24 rounded-full" />
      <div className="skeleton h-6 w-32" />
      <div className="skeleton h-4 w-48" />
      <div className="flex gap-4">
        <div className="skeleton h-8 w-20 rounded-full" />
        <div className="skeleton h-8 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

export default function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}
