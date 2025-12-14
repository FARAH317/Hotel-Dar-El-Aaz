import Card from '@/components/Card';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary',
  trend,
  trendLabel 
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
    info: 'bg-blue-50 text-blue-600',
  };

  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          
          {trend !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${trendColor}`}>
              <span className="font-medium">
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
              </span>
              {trendLabel && (
                <span className="ml-2 text-gray-500">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        
        <div className={`p-4 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;