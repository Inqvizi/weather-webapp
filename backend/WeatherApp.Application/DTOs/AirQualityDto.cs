namespace WeatherApp.Application.DTOs;

public sealed class AirQualityDto
{
    public int EuropeanAqi { get; init; }
    public int UsAqi { get; init; }
    public string Category { get; init; } = string.Empty;
    public double Pm10 { get; init; }
    public double Pm25 { get; init; }
    public double CarbonMonoxide { get; init; }
    public double NitrogenDioxide { get; init; }
    public double SulphurDioxide { get; init; }
    public double Ozone { get; init; }
}
