namespace WeatherApp.Domain.ValueObjects;

public sealed class Temperature
{
    public double Value { get; }

    private Temperature(double value)
    {
        this.Value = value;
    }

    public static Temperature FromCelsius(double value)
    {
        if (value < -273.15)
        {
            throw new ArgumentOutOfRangeException(nameof(value), "Temperature cannot be below absolute zero (-273.15°C)");
        }

        return new Temperature(value);
    }

    public override string ToString() => $"{Value:F1}°C";
}