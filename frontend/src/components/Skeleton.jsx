import React from 'react';

// ── Base shimmer block ─────────────────────────────────
export function Shimmer({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

// ── Product Card Skeleton ──────────────────────────────
export function ProductCardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Shimmer className="w-full aspect-[3/4] rounded-none" />
          <Shimmer className="h-3.5 w-3/4 mt-1" />
          <Shimmer className="h-3 w-1/3" />
          <div className="flex gap-1.5 mt-1">
            <Shimmer className="w-3 h-3 rounded-full" />
            <Shimmer className="w-3 h-3 rounded-full" />
            <Shimmer className="w-3 h-3 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}

// ── Category Card Skeleton ─────────────────────────────
export function CategoryCardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0" style={{ width: '175px', minWidth: '160px' }}>
          <Shimmer className="w-full aspect-[3/4] rounded-t-full" />
          <Shimmer className="h-3 w-2/3" />
        </div>
      ))}
    </>
  );
}

// ── Hero Banner Skeleton ───────────────────────────────
export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[42vh] md:h-[58vh] bg-surface-container overflow-hidden">
      <Shimmer className="w-full h-full rounded-none" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <Shimmer className="h-3 w-36" />
        <Shimmer className="h-10 w-64 md:w-96" />
        <Shimmer className="h-10 w-36 mt-2" />
      </div>
    </div>
  );
}

// ── Product Detail Skeleton ────────────────────────────
export function ProductDetailSkeleton() {
  return (
    <div className="pt-6 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Breadcrumb */}
      <div className="flex gap-3 mb-6">
        <Shimmer className="h-3 w-12" />
        <Shimmer className="h-3 w-2" />
        <Shimmer className="h-3 w-12" />
        <Shimmer className="h-3 w-2" />
        <Shimmer className="h-3 w-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Shimmer className="w-full aspect-[3/4]" />
          <div className="flex gap-3 justify-center">
            {[1,2,3].map(i => <Shimmer key={i} className="w-14 h-[72px] flex-shrink-0" />)}
          </div>
        </div>
        {/* Info */}
        <div className="lg:col-span-5 flex flex-col gap-5 pt-2">
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-9 w-3/4" />
          <Shimmer className="h-6 w-1/3" />
          <Shimmer className="h-20 w-full" />
          {/* Colors */}
          <div className="flex gap-2">
            {[1,2,3].map(i => <Shimmer key={i} className="h-8 w-24" />)}
          </div>
          {/* Sizes */}
          <div className="grid grid-cols-4 gap-2">
            {[1,2,3,4].map(i => <Shimmer key={i} className="h-10" />)}
          </div>
          <Shimmer className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
}

// ── Profile Skeleton ───────────────────────────────────
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-10 py-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 flex flex-col gap-4">
        <Shimmer className="h-6 w-32" />
        {[1,2,3,4].map(i => <Shimmer key={i} className="h-4 w-full" />)}
      </div>
      {/* Content */}
      <div className="w-full md:w-3/4 flex flex-col gap-5">
        <Shimmer className="h-6 w-48" />
        {[1,2,3].map(i => (
          <div key={i} className="flex flex-col gap-2">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-10 w-full" />
          </div>
        ))}
        <Shimmer className="h-10 w-32 mt-2" />
      </div>
    </div>
  );
}

// ── Address Card Skeleton ──────────────────────────────
export function AddressCardSkeleton({ count = 2 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-outline-variant/20 p-5 flex flex-col gap-3">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-3/4" />
          <Shimmer className="h-3 w-1/2" />
          <div className="flex gap-4 border-t border-outline-variant/10 pt-3 mt-1">
            <Shimmer className="h-3 w-8" />
            <Shimmer className="h-3 w-12" />
          </div>
        </div>
      ))}
    </>
  );
}

// ── Search Grid Skeleton ───────────────────────────────
export function SearchGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Shimmer className="w-full aspect-[3/4]" />
          <Shimmer className="h-3.5 w-3/4" />
          <Shimmer className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

// ── Testimonial Skeleton ───────────────────────────────
export function TestimonialSkeleton({ count = 2 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 snap-start" style={{ width: 'min(88vw, 460px)' }}>
          <div className="bg-warm-ivory border border-outline-variant/20 rounded-[15px] flex flex-col gap-4 p-4">
            <div className="flex items-center gap-3">
              <Shimmer className="w-14 h-14 rounded-full flex-shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <Shimmer className="h-3 w-24" />
                <Shimmer className="h-3 w-16" />
              </div>
            </div>
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-5/6" />
            <Shimmer className="h-3 w-4/6" />
          </div>
        </div>
      ))}
    </>
  );
}

// ── Order Row Skeleton ─────────────────────────────────
export function OrderRowSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i}>
          {[1,2,3,4,5].map(c => (
            <td key={c} className="py-4 px-2">
              <Shimmer className="h-3.5 w-full max-w-[120px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
