export function getIconClass(iconCode: string, description: string = ''): string {
  const desc = description.toLowerCase();

  if (desc.includes('heavy') && (desc.includes('rain') || desc.includes('shower'))) {
    return 'bi-cloud-rain-heavy';
  }
  if (desc.includes('light') && (desc.includes('rain') || desc.includes('drizzle'))) {
    return 'bi-cloud-drizzle';
  }
  if (desc.includes('moderate') && desc.includes('rain')) {
    return 'bi-cloud-rain';
  }

  if (desc.includes('few') || desc.includes('scattered') || desc.includes('partly')) {
    return iconCode?.includes('n') ? 'bi-cloud-moon' : 'bi-cloud-sun';
  }
  if (desc.includes('broken') || desc.includes('overcast') || desc.includes('clouds')) {
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

  if (desc.includes('sun') || desc.includes('clear')) {
    return iconCode?.includes('n') ? 'bi-moon' : 'bi-sun';
  }
  if (desc.includes('rain') || desc.includes('drizzle')) {
    return 'bi-cloud-rain';
  }
  if (desc.includes('snow') || desc.includes('hail')) {
    return 'bi-cloud-snow';
  }
  if (desc.includes('storm') || desc.includes('thunder')) {
    return 'bi-cloud-lightning-rain';
  }
  if (desc.includes('fog') || desc.includes('haze') || desc.includes('rime')) {
    return 'bi-cloud-haze';
  }
  if (desc.includes('cloud')) {
    return 'bi-cloud';
  }

  return 'bi-cloud';
}

export function getIconColor(iconCode: string, description: string = ''): string {
  const desc = description.toLowerCase();

  let codeToMatch = iconCode;

  if (!iconCode) {
    if (desc.includes('sun') || desc.includes('clear')) codeToMatch = '01d';
    else if (desc.includes('rain') || desc.includes('drizzle')) codeToMatch = '09d';
    else if (desc.includes('snow') || desc.includes('hail')) codeToMatch = '13d';
    else if (desc.includes('storm') || desc.includes('thunder')) codeToMatch = '11d';
  }

  if (!codeToMatch) return 'text-gray-300';

  if (codeToMatch === '01d' || codeToMatch === '02d') return 'text-yellow-400';
  if (codeToMatch === '13d' || codeToMatch === '13n') return 'text-blue-200';
  if (['09d', '09n', '10d', '10n', '11d', '11n'].includes(codeToMatch)) return 'text-blue-400';

  return 'text-gray-300';
}
