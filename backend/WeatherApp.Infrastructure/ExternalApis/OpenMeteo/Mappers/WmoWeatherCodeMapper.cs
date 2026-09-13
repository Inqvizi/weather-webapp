namespace WeatherApp.Infrastructure.ExternalApis.OpenMeteo.Mappers;

public static class WmoWeatherCodeMapper
{
    private sealed record WeatherCodeInfo(string DescriptionEn, string DescriptionUk, string IconBaseCode);

    private static readonly Dictionary<int, WeatherCodeInfo> Codes = new()
    {
        [0] = new("Clear sky", "Ясно", "01"),
        [1] = new("Mainly clear", "Переважно ясно", "01"),
        [2] = new("Partly cloudy", "Хмарно з проясненнями", "02"),
        [3] = new("Overcast", "Суцільна хмарність", "04"),
        [45] = new("Fog", "Туман", "50"),
        [48] = new("Depositing rime fog", "Туман з памороззю", "50"),
        [51] = new("Light drizzle", "Слабка мряка", "10"),
        [53] = new("Moderate drizzle", "Мряка", "10"),
        [55] = new("Dense drizzle", "Сильна мряка", "10"),
        [56] = new("Light freezing drizzle", "Крижана мряка", "10"),
        [57] = new("Dense freezing drizzle", "Сильна крижана мряка", "10"),
        [61] = new("Slight rain", "Слабкий дощ", "10"),
        [63] = new("Moderate rain", "Дощ", "09"),
        [65] = new("Heavy rain", "Сильний дощ", "09"),
        [66] = new("Light freezing rain", "Крижаний дощ", "13"),
        [67] = new("Heavy freezing rain", "Сильний крижаний дощ", "13"),
        [71] = new("Slight snow fall", "Слабкий сніг", "13"),
        [73] = new("Moderate snow fall", "Сніг", "13"),
        [75] = new("Heavy snow fall", "Сильний снігопад", "13"),
        [77] = new("Snow grains", "Крупа", "13"),
        [80] = new("Slight rain showers", "Короткий дощ", "10"),
        [81] = new("Moderate rain showers", "Злива", "09"),
        [82] = new("Violent rain showers", "Сильна злива", "09"),
        [85] = new("Slight snow showers", "Снігопад", "13"),
        [86] = new("Heavy snow showers", "Сильний снігопад", "13"),
        [95] = new("Thunderstorm", "Гроза", "11"),
        [96] = new("Thunderstorm with slight hail", "Гроза з невеликим градом", "11"),
        [99] = new("Thunderstorm with heavy hail", "Гроза з сильним градом", "11"),
    };

    public static string GetDescription(int code, string? language = "en")
    {
        if (Codes.TryGetValue(code, out var info))
        {
            var isUk = language?.ToLowerInvariant() is "uk" or "ua";
            return isUk ? info.DescriptionUk : info.DescriptionEn;
        }

        return language?.ToLowerInvariant() is "uk" or "ua" ? "Невідомо" : "Unknown";
    }

    public static string GetIconCode(int code, bool isDay = true)
    {
        if (Codes.TryGetValue(code, out var info))
        {
            var suffix = isDay ? "d" : "n";
            if (info.IconBaseCode is "01" or "02" or "10")
            {
                return $"{info.IconBaseCode}{suffix}";
            }

            return $"{info.IconBaseCode}d";
        }

        return isDay ? "01d" : "01n";
    }
}
