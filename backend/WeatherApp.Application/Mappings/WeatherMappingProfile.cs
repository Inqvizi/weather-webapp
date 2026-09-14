using AutoMapper;
using WeatherApp.Application.DTOs;
using WeatherApp.Domain.Entities;

namespace WeatherApp.Application.Mappings;

public sealed class WeatherMappingProfile : Profile
{
    public WeatherMappingProfile()
    {
        CreateMap<WeatherForecast, WeatherResponseDto>()
            .ForMember(dest => dest.CityName,                 opt => opt.MapFrom(src => src.City.Name))
            .ForMember(dest => dest.CountryCode,              opt => opt.MapFrom(src => src.City.CountryCode))
            .ForMember(dest => dest.Latitude,                 opt => opt.MapFrom(src => src.City.Coordinates.Latitude))
            .ForMember(dest => dest.Longitude,                opt => opt.MapFrom(src => src.City.Coordinates.Longitude))
            .ForMember(dest => dest.Temperature,              opt => opt.MapFrom(src => src.Temperature.Value))
            .ForMember(dest => dest.FeelsLike,                opt => opt.MapFrom(src => src.FeelsLike.Value))
            .ForMember(dest => dest.Humidity,                 opt => opt.MapFrom(src => src.Humidity))
            .ForMember(dest => dest.WindSpeed,                opt => opt.MapFrom(src => src.WindSpeed))
            .ForMember(dest => dest.WindDirection,            opt => opt.MapFrom(src => src.WindDirection))
            .ForMember(dest => dest.Pressure,                 opt => opt.MapFrom(src => src.Pressure))
            .ForMember(dest => dest.UvIndex,                  opt => opt.MapFrom(src => src.UvIndex))
            .ForMember(dest => dest.Sunrise,                  opt => opt.MapFrom(src => src.Sunrise))
            .ForMember(dest => dest.Sunset,                   opt => opt.MapFrom(src => src.Sunset))
            .ForMember(dest => dest.IsDay,                    opt => opt.MapFrom(src => src.IsDay))
            .ForMember(dest => dest.WeatherCode,              opt => opt.MapFrom(src => src.WeatherCode))
            .ForMember(dest => dest.Description,              opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.MeasuredAt,               opt => opt.MapFrom(src => src.ForecastDate))
            .ForMember(dest => dest.IconCode,                 opt => opt.MapFrom(src => src.IconCode))
            .ForMember(dest => dest.AirQuality,               opt => opt.MapFrom(src => src.AirQuality));

        CreateMap<WeatherApp.Domain.ValueObjects.AirQuality, AirQualityDto>()
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => GetAirQualityCategory(src.UsAqi)));

        CreateMap<WeatherForecast, ForecastItemDto>()
            .ForMember(dest => dest.DateTime,                 opt => opt.MapFrom(src => src.ForecastDate))
            .ForMember(dest => dest.Temperature,              opt => opt.MapFrom(src => src.Temperature.Value))
            .ForMember(dest => dest.FeelsLike,                opt => opt.MapFrom(src => src.FeelsLike.Value))
            .ForMember(dest => dest.Humidity,                 opt => opt.MapFrom(src => src.Humidity))
            .ForMember(dest => dest.WindSpeed,                opt => opt.MapFrom(src => src.WindSpeed))
            .ForMember(dest => dest.WindDirection,            opt => opt.MapFrom(src => src.WindDirection))
            .ForMember(dest => dest.Pressure,                 opt => opt.MapFrom(src => src.Pressure))
            .ForMember(dest => dest.PrecipitationProbability, opt => opt.MapFrom(src => src.PrecipitationProbability))
            .ForMember(dest => dest.IsDay,                    opt => opt.MapFrom(src => src.IsDay))
            .ForMember(dest => dest.WeatherCode,              opt => opt.MapFrom(src => src.WeatherCode))
            .ForMember(dest => dest.Description,              opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.IconCode,                 opt => opt.MapFrom(src => src.IconCode));

        CreateMap<City, CitySearchResultDto>()
            .ForMember(dest => dest.Name,                     opt => opt.MapFrom(src => src.Name))
            .ForMember(dest => dest.Country,                  opt => opt.MapFrom(src => src.Country))
            .ForMember(dest => dest.CountryCode,              opt => opt.MapFrom(src => src.CountryCode))
            .ForMember(dest => dest.AdminRegion,              opt => opt.MapFrom(src => src.AdminRegion))
            .ForMember(dest => dest.Latitude,                 opt => opt.MapFrom(src => src.Coordinates.Latitude))
            .ForMember(dest => dest.Longitude,                opt => opt.MapFrom(src => src.Coordinates.Longitude));
    }

    private static string GetAirQualityCategory(int aqi) => aqi switch
    {
        <= 50 => "Good",
        <= 100 => "Moderate",
        <= 150 => "UnhealthyForSensitiveGroups",
        <= 200 => "Unhealthy",
        <= 300 => "VeryUnhealthy",
        _ => "Hazardous"
    };
}