namespace WeatherApp.Domain.Exceptions;

public sealed class WeatherApiException : Exception
{
    public int StatusCode { get; }

    public WeatherApiException(string message, int statusCode)
        : base(message)
    {
        StatusCode = statusCode;
    }
}
