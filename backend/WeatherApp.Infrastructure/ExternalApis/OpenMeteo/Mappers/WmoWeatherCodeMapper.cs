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
        [51] = new("Light drizzle", "Невеликий моросець", "10"),
        [53] = new("Moderate drizzle", "Помірний моросець", "10"),
        [55] = new("Dense drizzle", "Густий моросець", "10"),
        [56] = new("Light freezing drizzle", "Легка крижана мряка", "10"),
        [57] = new("Dense freezing drizzle", "Густа крижана мряка", "10"),
        [61] = new("Slight rain", "Невеликий дощ", "10"),
        [63] = new("Moderate rain", "Помірний дощ", "09"),
        [65] = new("Heavy rain", "Сильний дощ", "09"),
        [66] = new("Light freezing rain", "Невеликий крижаний дощ", "13"),
        [67] = new("Heavy freezing rain", "Сильний крижаний дощ", "13"),
        [71] = new("Slight snow fall", "Невеликий сніг", "13"),
        [73] = new("Moderate snow fall", "Помірний сніг", "13"),
        [75] = new("Heavy snow fall", "Сильний снігопад", "13"),
        [77] = new("Snow grains", "Снігова крупа", "13"),
        [80] = new("Slight rain showers", "Невелика злива", "10"),
        [81] = new("Moderate rain showers", "Помірна злива", "09"),
        [82] = new("Violent rain showers", "Сильна злива", "09"),
        [85] = new("Slight snow showers", "Невеликий снігопад", "13"),
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
