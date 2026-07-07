namespace WeatherApp.Domain.ValueObjects;

public sealed class Coordinates
{
    public double Latitude { get; }

    public double Longitude { get; }

    private Coordinates(double latitude, double longitude)
    {
        this.Latitude = latitude;
        this.Longitude = longitude;
    }

    public static Coordinates Create(double latitude, double longitude)
    {
        if (latitude is < -90 or > 90)
        {
            throw new ArgumentOutOfRangeException(nameof(latitude), "Latitude must be between -90 and 90 degrees");
        }

        if (longitude is < -180 or > 180)
        {
            throw new ArgumentOutOfRangeException(nameof(longitude), "Longitude must be between -180 and 180 degrees");
        }

        return new Coordinates(latitude, longitude);
    }

    public override string ToString() => $"({Latitude}, {Longitude})";
}