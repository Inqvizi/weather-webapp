using AutoMapper;
using WeatherApp.Application.DTOs;
using WeatherApp.Domain.Entities;

namespace WeatherApp.Application.Mappings;

public sealed class WeatherMappingProfile : Profile
{
    public WeatherMappingProfile()
    {
        CreateMap<WeatherForecast, WeatherResponseDto>()
            .ForMember(dest => dest.CityName,     opt => opt.MapFrom(src => src.City.Name))
            .ForMember(dest => dest.CountryCode,  opt => opt.MapFrom(src => src.City.CountryCode))
            .ForMember(dest => dest.Latitude,     opt => opt.MapFrom(src => src.City.Coordinates.Latitude))
            .ForMember(dest => dest.Longitude,    opt => opt.MapFrom(src => src.City.Coordinates.Longitude))
            .ForMember(dest => dest.Temperature,  opt => opt.MapFrom(src => src.Temperature.Value))
            .ForMember(dest => dest.FeelsLike,    opt => opt.MapFrom(src => src.FeelsLike.Value))
            .ForMember(dest => dest.Humidity,     opt => opt.MapFrom(src => src.Humidity))
            .ForMember(dest => dest.WindSpeed,    opt => opt.MapFrom(src => src.WindSpeed))
            .ForMember(dest => dest.Description,  opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.MeasuredAt,   opt => opt.MapFrom(src => src.ForecastDate))
            .ForMember(dest => dest.IconCode,     opt => opt.Ignore());

        CreateMap<WeatherForecast, ForecastItemDto>()
            .ForMember(dest => dest.DateTime,    opt => opt.MapFrom(src => src.ForecastDate))
            .ForMember(dest => dest.Temperature, opt => opt.MapFrom(src => src.Temperature.Value))
            .ForMember(dest => dest.FeelsLike,   opt => opt.MapFrom(src => src.FeelsLike.Value))
            .ForMember(dest => dest.Humidity,    opt => opt.MapFrom(src => src.Humidity))
            .ForMember(dest => dest.WindSpeed,   opt => opt.MapFrom(src => src.WindSpeed))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
            .ForMember(dest => dest.IconCode,    opt => opt.Ignore());
    }
}