namespace WeatherApp.Infrastructure.ExternalApis.OpenMeteo.Mappers;

public static class WmoWeatherCodeMapper
{
    private sealed record WeatherCodeInfo(string Description, string IconBaseCode);

    private static readonly Dictionary<int, WeatherCodeInfo> Codes = new()
    {
        [0] = new("Clear sky", "01"),
        [1] = new("Mainly clear", "01"),
        [2] = new("Partly cloudy", "02"),
        [3] = new("Overcast", "04"),
        [45] = new("Fog", "50"),
        [48] = new("Depositing rime fog", "50"),
        [51] = new("Light drizzle", "10"),
        [53] = new("Moderate drizzle", "10"),
        [55] = new("Dense drizzle", "10"),
        [56] = new("Light freezing drizzle", "10"),
        [57] = new("Dense freezing drizzle", "10"),
        [61] = new("Slight rain", "10"),
        [63] = new("Moderate rain", "09"),
        [65] = new("Heavy rain", "09"),
        [66] = new("Light freezing rain", "13"),
        [67] = new("Heavy freezing rain", "13"),
        [71] = new("Slight snow fall", "13"),
        [73] = new("Moderate snow fall", "13"),
        [75] = new("Heavy snow fall", "13"),
        [77] = new("Snow grains", "13"),
        [80] = new("Slight rain showers", "10"),
        [81] = new("Moderate rain showers", "09"),
        [82] = new("Violent rain showers", "09"),
        [85] = new("Slight snow showers", "13"),
        [86] = new("Heavy snow showers", "13"),
        [95] = new("Thunderstorm", "11"),
        [96] = new("Thunderstorm with slight hail", "11"),
        [99] = new("Thunderstorm with heavy hail", "11"),
    };

    public static string GetDescription(int code, string? language = "en")
    {
        if (Codes.TryGetValue(code, out var info))
        {
            return info.Description;
        }

        return "Unknown";
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
