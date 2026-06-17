export default function SkeletonResult() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeIn 0.3s ease' }}>
      {/* Score card skeleton */}
      <div className="card" style={{ padding: '32px 36px', display: 'flex', gap: 24, alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 140, height: 140, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="skeleton" style={{ height: 22, width: '50%' }} />
          <div className="skeleton" style={{ height: 16, width: '70%' }} />
          <div className="skeleton" style={{ height: 16, width: '40%' }} />
          <div className="skeleton" style={{ height: 14, width: '30%' }} />
          <div className="skeleton" style={{ height: 60, width: '100%' }} />
          <div className="skeleton" style={{ height: 14, width: '25%' }} />
          <div className="skeleton" style={{ height: 40, width: '80%' }} />
          <div className="skeleton" style={{ height: 14, width: '20%' }} />
          <div className="skeleton" style={{ height: 40, width: '75%' }} />
          <div className="skeleton" style={{ height: 50, width: '100%' }} />
        </div>
      </div>

      {/* Dimension card skeletons */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ width: 120, height: 14 }} />
                <div className="skeleton" style={{ width: 60, height: 10 }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
          </div>
          <div className="skeleton" style={{ height: 6, width: '100%', borderRadius: 999 }} />
          <div className="skeleton" style={{ height: 12, width: '25%' }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <div className="skeleton" style={{ height: 24, width: 80, borderRadius: 999 }} />
            <div className="skeleton" style={{ height: 24, width: 90, borderRadius: 999 }} />
            <div className="skeleton" style={{ height: 24, width: 70, borderRadius: 999 }} />
          </div>
          <div className="skeleton" style={{ height: 12, width: '30%' }} />
          <div className="skeleton" style={{ height: 40, width: '100%' }} />
          <div className="skeleton" style={{ height: 12, width: '35%' }} />
          <div className="skeleton" style={{ height: 20, width: '90%' }} />
          <div className="skeleton" style={{ height: 20, width: '85%' }} />
          <div className="skeleton" style={{ height: 12, width: '30%' }} />
          <div className="skeleton" style={{ height: 20, width: '80%' }} />
          <div className="skeleton" style={{ height: 20, width: '75%' }} />
          <div className="skeleton" style={{ height: 12, width: '25%' }} />
          <div className="skeleton" style={{ height: 20, width: '85%' }} />
          <div className="skeleton" style={{ height: 20, width: '80%' }} />
        </div>
      ))}
    </div>
  );
}
