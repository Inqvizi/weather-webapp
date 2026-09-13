using WeatherApp.Domain.ValueObjects;

namespace WeatherApp.Domain.Entities;

public sealed class City
{
    public Guid Id { get; }
    public string Name { get; }
    public string CountryCode { get; }
    public Coordinates Coordinates { get; }
    public string Country { get; }
    public string AdminRegion { get; }

    private City(Guid id, string name, string countryCode, Coordinates coordinates, string country, string adminRegion)
    {
        Id = id;
        Name = name;
        CountryCode = countryCode;
        Coordinates = coordinates;
        Country = country;
        AdminRegion = adminRegion;
    }

    public static City Create(string name, string countryCode, Coordinates coordinates, string country = "", string adminRegion = "")
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("City name cannot be empty", nameof(name));
        }

        ArgumentNullException.ThrowIfNull(coordinates);

        var normalizedCountryCode = string.IsNullOrWhiteSpace(countryCode) ? string.Empty : countryCode.Trim().ToUpperInvariant();

        return new City(
            Guid.NewGuid(),
            name.Trim(),
            normalizedCountryCode,
            coordinates,
            country?.Trim() ?? string.Empty,
            adminRegion?.Trim() ?? string.Empty);
    }

    public override string ToString() => string.IsNullOrWhiteSpace(CountryCode)
        ? Name
        : $"{Name}, {CountryCode}";
}