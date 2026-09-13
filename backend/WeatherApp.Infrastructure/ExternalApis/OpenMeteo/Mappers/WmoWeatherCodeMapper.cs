namespace WeatherApp.Infrastructure.ExternalApis.OpenMeteo.Mappers;

public static class WmoWeatherCodeMapper
{
    private sealed record WeatherCodeInfo(string DescriptionUk, string DescriptionEn, string IconBaseCode);

    private static readonly Dictionary<int, WeatherCodeInfo> Codes = new()
    {
        [0] = new("Ясне небо", "Clear sky", "01"),
        [1] = new("Переважно ясно", "Mainly clear", "01"),
        [2] = new("Мінлива хмарність", "Partly cloudy", "02"),
        [3] = new("Похмуро", "Overcast", "04"),
        [45] = new("Туман", "Fog", "50"),
        [48] = new("Паморозь", "Depositing rime fog", "50"),
        [51] = new("Невелика мряка", "Light drizzle", "10"),
        [53] = new("Помірна мряка", "Moderate drizzle", "10"),
        [55] = new("Густа мряка", "Dense drizzle", "10"),
        [56] = new("Невелика крижана мряка", "Light freezing drizzle", "10"),
        [57] = new("Густа крижана мряка", "Dense freezing drizzle", "10"),
        [61] = new("Невеликий дощ", "Slight rain", "10"),
        [63] = new("Помірний дощ", "Moderate rain", "09"),
        [65] = new("Сильний дощ", "Heavy rain", "09"),
        [66] = new("Невеликий крижаний дощ", "Light freezing rain", "13"),
        [67] = new("Сильний крижаний дощ", "Heavy freezing rain", "13"),
        [71] = new("Невеликий снігопад", "Slight snow fall", "13"),
        [73] = new("Помірний снігопад", "Moderate snow fall", "13"),
        [75] = new("Сильний снігопад", "Heavy snow fall", "13"),
        [77] = new("Снігові зерна", "Snow grains", "13"),
        [80] = new("Невелика злива", "Slight rain showers", "10"),
        [81] = new("Помірна злива", "Moderate rain showers", "09"),
        [82] = new("Сильна злива", "Violent rain showers", "09"),
        [85] = new("Невеликий снігопад із проясненнями", "Slight snow showers", "13"),
        [86] = new("Сильний снігопад", "Heavy snow showers", "13"),
        [95] = new("Гроза", "Thunderstorm", "11"),
        [96] = new("Гроза зі слабким градом", "Thunderstorm with slight hail", "11"),
        [99] = new("Гроза з сильним градом", "Thunderstorm with heavy hail", "11"),
    };

    public static string GetDescription(int code, string? language = "uk")
    {
        var isUk = string.IsNullOrWhiteSpace(language) || language.StartsWith("uk", StringComparison.OrdinalIgnoreCase);
        if (Codes.TryGetValue(code, out var info))
        {
            return isUk ? info.DescriptionUk : info.DescriptionEn;
        }

        return isUk ? "Невідомо" : "Unknown";
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
