export function getIconClass(iconCode: string, description: string = ''): string {
  const desc = description.toLowerCase();

  if ((desc.includes('heavy') || desc.includes('сильн')) && (desc.includes('rain') || desc.includes('дощ') || desc.includes('злив'))) {
    return 'bi-cloud-rain-heavy';
  }
  if ((desc.includes('light') || desc.includes('невелик')) && (desc.includes('rain') || desc.includes('дощ') || desc.includes('мряк'))) {
    return 'bi-cloud-drizzle';
  }
  if (desc.includes('moderate') || desc.includes('помірн') || desc.includes('дощ') || desc.includes('rain')) {
    if (desc.includes('rain') || desc.includes('дощ')) return 'bi-cloud-rain';
  }

  if (desc.includes('few') || desc.includes('scattered') || desc.includes('мінлива')) {
    return iconCode?.includes('n') ? 'bi-cloud-moon' : 'bi-cloud-sun';
  }
  if (desc.includes('broken') || desc.includes('overcast') || desc.includes('хмар') || desc.includes('похмуро')) {
    return 'bi-clouds';
  }

  const iconMap: { [key: string]: string } = {
    '01d': 'bi-sun',
    '01n': 'bi-moon',
    '02d': 'bi-cloud-sun',
    '02n': 'bi-cloud-moon',
    '03d': 'bi-cloud',
    '03n': 'bi-cloud',
    '04d': 'bi-clouds',
    '04n': 'bi-clouds',
    '09d': 'bi-cloud-rain',
    '09n': 'bi-cloud-rain',
    '10d': 'bi-cloud-drizzle',
    '10n': 'bi-cloud-drizzle',
    '11d': 'bi-cloud-lightning-rain',
    '11n': 'bi-cloud-lightning-rain',
    '13d': 'bi-cloud-snow',
    '13n': 'bi-cloud-snow',
    '50d': 'bi-cloud-haze',
    '50n': 'bi-cloud-haze'
  };

  if (iconCode && iconMap[iconCode]) {
    return iconMap[iconCode];
  }

  if (desc.includes('sun') || desc.includes('clear') || desc.includes('ясн')) {
    return iconCode?.includes('n') ? 'bi-moon' : 'bi-sun';
  }
  if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('дощ') || desc.includes('мряк')) {
    return 'bi-cloud-rain';
  }
  if (desc.includes('snow') || desc.includes('сніг') || desc.includes('град')) {
    return 'bi-cloud-snow';
  }
  if (desc.includes('storm') || desc.includes('thunder') || desc.includes('гроз')) {
    return 'bi-cloud-lightning-rain';
  }
  if (desc.includes('fog') || desc.includes('туман') || desc.includes('паморозь')) {
    return 'bi-cloud-haze';
  }
  if (desc.includes('cloud') || desc.includes('хмар')) {
    return 'bi-cloud';
  }

  return 'bi-cloud';
}

export function getIconColor(iconCode: string, description: string = ''): string {
  const desc = description.toLowerCase();

  let codeToMatch = iconCode;

  if (!iconCode) {
    if (desc.includes('sun') || desc.includes('clear') || desc.includes('ясн')) codeToMatch = '01d';
    else if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('дощ') || desc.includes('мряк')) codeToMatch = '09d';
    else if (desc.includes('snow') || desc.includes('сніг') || desc.includes('град')) codeToMatch = '13d';
    else if (desc.includes('storm') || desc.includes('thunder') || desc.includes('гроз')) codeToMatch = '11d';
  }

  if (!codeToMatch) return 'text-gray-300';

  if (codeToMatch === '01d' || codeToMatch === '02d') return 'text-yellow-400';
  if (codeToMatch === '13d' || codeToMatch === '13n') return 'text-blue-200';
  if (['09d', '09n', '10d', '10n', '11d', '11n'].includes(codeToMatch)) return 'text-blue-400';

  return 'text-gray-300';
}
