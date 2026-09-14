namespace WeatherApp.Domain.ValueObjects;

public sealed class AirQuality
{
    public int EuropeanAqi { get; }
    public int UsAqi { get; }
    public double Pm10 { get; }
    public double Pm25 { get; }
    public double CarbonMonoxide { get; }
    public double NitrogenDioxide { get; }
    public double SulphurDioxide { get; }
    public double Ozone { get; }

    private AirQuality(
        int europeanAqi,
        int usAqi,
        double pm10,
        double pm25,
        double carbonMonoxide,
        double nitrogenDioxide,
        double sulphurDioxide,
        double ozone)
    {
        EuropeanAqi = europeanAqi;
        UsAqi = usAqi;
        Pm10 = pm10;
        Pm25 = pm25;
        CarbonMonoxide = carbonMonoxide;
        NitrogenDioxide = nitrogenDioxide;
        SulphurDioxide = sulphurDioxide;
        Ozone = ozone;
    }

    public static AirQuality Create(
        int europeanAqi,
        int usAqi,
        double pm10,
        double pm25,
        double carbonMonoxide,
        double nitrogenDioxide,
        double sulphurDioxide,
        double ozone)
    {
        return new AirQuality(
            Math.Max(0, europeanAqi),
            Math.Max(0, usAqi),
            Math.Max(0, pm10),
            Math.Max(0, pm25),
            Math.Max(0, carbonMonoxide),
            Math.Max(0, nitrogenDioxide),
            Math.Max(0, sulphurDioxide),
            Math.Max(0, ozone));
    }
}
