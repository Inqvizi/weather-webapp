using WeatherApp.Domain.ValueObjects;

namespace WeatherApp.Domain.Entities;

public sealed class City
{
    public Guid Id { get; }
    public string Name { get; }
    public string CountryCode { get; }
    public Coordinates Coordinates { get; }

    private City(Guid id, string name, string countryCode, Coordinates coordinates)
    {
        Id = id;
        Name = name;
        CountryCode = countryCode;
        Coordinates = coordinates;
    }
    public static City Create(string name, string countryCode, Coordinates coordinates)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("City name cannot be empty", nameof(name));
        }

        if (string.IsNullOrWhiteSpace(countryCode))
        {
            throw new ArgumentException("Country code cannot be empty", nameof(countryCode));
        }

        ArgumentNullException.ThrowIfNull(coordinates);

        return new City(Guid.NewGuid(), name.Trim(), countryCode.ToUpperInvariant(), coordinates);
    }

    public override string ToString() => $"{Name}, {CountryCode}";
}