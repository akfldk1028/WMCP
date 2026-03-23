export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-white/50 mb-8">Session history and creative analytics</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Sessions', value: '0', color: 'text-amber-400' },
          { label: 'Ideas Generated', value: '0', color: 'text-purple-400' },
          { label: 'Graph Nodes', value: '0', color: 'text-cyan-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-5">
            <div className="text-xs text-white/40 font-mono mb-1">{stat.label}</div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Sessions</h2>
        <div className="text-white/30 text-sm text-center py-12">
          No sessions yet. Start your first creative session.
        </div>
      </div>
    </div>
  );
}
