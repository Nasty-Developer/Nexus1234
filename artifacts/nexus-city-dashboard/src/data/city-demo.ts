const pulseMetrics = {
  trafficFlowPercent: 72,
  weatherTemperatureC: 29,
  energyConsumptionMw: 438,
  greenCoverPercent: 38,
  networkAvailabilityPercent: 84,
  collectionEfficiencyPercent: 76,
};
const cityConditions = {
  temperatureC: pulseMetrics.weatherTemperatureC,
  humidityPercent: 68,
};

export const cityDemo = {
  identity: {
    name: 'NEXUS',
    descriptor: 'THE CITY, CONNECTED.',
    makers: 'BUILT BY TANVI × SHARANYA × YASH',
    event: 'NESCOE HACKATHON 2026',
  },
  pulse: {
    label: 'City health',
    metrics: pulseMetrics,
    liveSensors: 128,
    activeSensors: 123,
    residentsConnected: 284600,
    servicesOnline: 18,
  },
  cityNetwork: {
    nodes: [
      { id: 'civic', label: 'CIVIC CORE', x: 51, y: 47, type: 'Control' },
      { id: 'harbor', label: 'NORTH GATE', x: 31, y: 22, type: 'Transit' },
      { id: 'market', label: 'MARKET EAST', x: 76, y: 34, type: 'Environment' },
      { id: 'park', label: 'GREEN QUARTER', x: 23, y: 65, type: 'Energy' },
      { id: 'station', label: 'CENTRAL STN.', x: 69, y: 72, type: 'Mobility' },
      { id: 'west', label: 'WEST WORKS', x: 39, y: 83, type: 'Waste' },
    ],
    routes: [
      ['harbor', 'civic'], ['civic', 'market'], ['civic', 'park'],
      ['civic', 'station'], ['park', 'west'], ['station', 'market'], ['west', 'civic'],
    ],
    packetsPerMinute: 42806,
    networkAvailabilityPercent: pulseMetrics.networkAvailabilityPercent,
  },
  mobility: {
    metroStatus: 'ONLINE',
    metroPerformancePercent: 94,
    busPerformancePercent: 87,
    bikeShareUtilizationPercent: 62,
    activeRoutes: 34,
    passengerFlowPerHour: 68240,
    networkAvailabilityPercent: pulseMetrics.networkAvailabilityPercent,
    vehiclesPerHour: 18420,
    averageSpeed: 24.8,
    congestionEvents: 12,
    transitOnTime: 94.2,
    hourlyFlow: [42, 37, 33, 30, 35, 49, 69, 84, 79, 72, 76, 87, 81, 74, 70, 82, 91, 77, 65, 59, 53, 47, 43, 39],
    weeklyFlow: [48, 54, 51, 67, 71, 65, 79, 73, 88, 81, 76, 91],
  },
  energy: {
    demandMw: pulseMetrics.energyConsumptionMw,
    renewableShare: 42,
    peakDemandMw: 512,
    dailyConsumptionMwh: 8742.6,
    gridBalance: 96.8,
    carbonAvoidedTonnes: 64.2,
    sources: [
      { label: 'Solar', share: 27, value: '27%' },
      { label: 'Wind', share: 15, value: '15%' },
      { label: 'Grid', share: 58, value: '58%' },
    ],
    demandSeries: [51, 45, 40, 38, 41, 50, 61, 75, 82, 78, 71, 74, 69, 67, 72, 80, 88, 84, 77, 68, 63, 58, 55, 52],
    weeklyDemandSeries: [58, 54, 63, 68, 61, 73, 70, 78, 75, 84, 79, 88],
  },
  environment: {
    aqi: 42,
    airQuality: 'Good',
    status: 'AIR QUALITY GOOD',
    pm25: 8.6,
    temperatureC: cityConditions.temperatureC,
    humidityPercent: cityConditions.humidityPercent,
    greenCover: pulseMetrics.greenCoverPercent,
    airSeries: [31, 29, 35, 43, 38, 42, 36, 32, 39, 47, 43, 41, 38, 35, 33, 42, 45, 40, 36, 32, 30, 34, 39, 42],
  },
  waste: {
    collectedTonnes: 287.4,
    divertedPercent: 72.8,
    collectionEfficiencyPercent: pulseMetrics.collectionEfficiencyPercent,
    recyclingRatePercent: 54,
    activeCollectionVehicles: 46,
    recoveryRatePercent: 68.5,
    materialStreams: [
      { label: 'Organic', share: 38, tonnes: '109.2 t' },
      { label: 'Recyclables', share: 26, tonnes: '74.7 t' },
      { label: 'General', share: 21, tonnes: '60.4 t' },
      { label: 'Construction', share: 15, tonnes: '43.1 t' },
    ],
    activeRoutes: 34,
  },
  weather: {
    temperatureC: cityConditions.temperatureC,
    condition: 'Partly cloudy',
    humidityPercent: cityConditions.humidityPercent,
    windKph: 12.6,
    rainfallMm: 0.4,
    hourlyTrend: [
      { time: '06:00', temperatureC: 22 },
      { time: '09:00', temperatureC: 25 },
      { time: '12:00', temperatureC: 29 },
      { time: '15:00', temperatureC: 31 },
      { time: '18:00', temperatureC: 28 },
      { time: '21:00', temperatureC: 25 },
    ],
    forecast: [
      { day: 'TODAY', condition: 'Cloud breaks', high: '32°', low: '22°' },
      { day: 'FRI', condition: 'Clear intervals', high: '31°', low: '21°' },
      { day: 'SAT', condition: 'Light showers', high: '29°', low: '22°' },
      { day: 'SUN', condition: 'Partly cloudy', high: '30°', low: '22°' },
    ],
  },
  system: {
    demoStatus: 'ONLINE',
    activeIncidents: 3,
    platformsOnline: 18,
    platformCount: 18,
    latencyMs: 42,
    dataPointsPerHour: 42806,
    lastSync: '09:41:26 IST',
    services: [
      { name: 'Traffic', state: 'ONLINE' },
      { name: 'Mobility', state: 'ONLINE' },
      { name: 'Energy', state: 'ONLINE' },
      { name: 'Environment', state: 'ONLINE' },
      { name: 'Waste', state: 'ONLINE' },
      { name: 'Network', state: 'ONLINE' },
    ],
  },
} as const;

export const cityHealthFactors = [
  { label: 'Traffic flow', score: cityDemo.pulse.metrics.trafficFlowPercent, weight: 0.2 },
  { label: 'Network availability', score: cityDemo.pulse.metrics.networkAvailabilityPercent, weight: 0.2 },
  { label: 'Air quality', score: 100 - cityDemo.environment.aqi, weight: 0.15 },
  { label: 'Renewable energy', score: cityDemo.energy.renewableShare, weight: 0.15 },
  { label: 'Waste collection', score: cityDemo.waste.collectionEfficiencyPercent, weight: 0.15 },
  { label: 'Metro performance', score: cityDemo.mobility.metroPerformancePercent, weight: 0.15 },
] as const;

export const cityHealthScore = Math.round(
  cityHealthFactors.reduce((total, factor) => total + factor.score * factor.weight, 0),
);

export const dashboardSections = [
  { id: 'home', label: 'Overview' },
  { id: 'pulse', label: 'City Pulse' },
  { id: 'network', label: 'Network' },
  { id: 'mobility', label: 'Mobility' },
  { id: 'energy', label: 'Energy' },
  { id: 'environment', label: 'Environment' },
  { id: 'waste', label: 'Waste' },
  { id: 'weather', label: 'Weather' },
  { id: 'system', label: 'System Status' },
] as const;