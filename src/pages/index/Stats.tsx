// components/Stats.js

const Stats = () => {
  const stats = [
    { number: '50', label: 'Hôpitaux Confiants', delay: '100' },
    { number: '1500', label: 'Patients Servis', delay: '200' },
    { number: '99', label: '% Satisfaction', delay: '300' },
    { number: '24', label: 'Support 24/7', delay: '400' }
  ];

  return (
    <section className="stats-section bg-white py-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="stats-grid grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item text-center p-8">
              <div className="stat-number text-5xl font-bold text-emerald-500 mb-2">
                {stat.number}
              </div>
              <div className="stat-label text-lg text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;