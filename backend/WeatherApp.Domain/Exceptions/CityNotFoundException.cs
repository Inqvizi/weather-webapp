namespace WeatherApp.Domain.Exceptions;

public sealed class CityNotFoundException : Exception
{
    public string CityName { get; }

    public CityNotFoundException(string cityName)
        : base($"City '{cityName}' was not found")
    {
        CityName = cityName;
    }
}
