using FluentValidation;

namespace WeatherApp.Application.Validators;

public sealed class CityNameValidator : AbstractValidator<string>
{
    private const int MaxCityNameLength = 100;

    public CityNameValidator()
    {
        RuleFor(cityName => cityName)
            .NotEmpty()
            .WithMessage("City name cannot be empty")
            .MaximumLength(MaxCityNameLength)
            .WithMessage($"City name cannot exceed {MaxCityNameLength} characters")
            .Matches(@"^[a-zA-Zа-яА-ЯіІїЇєЄ\s\-']+$")
            .WithMessage("City name can only contain letters, spaces, hyphens and apostrophes");
    }
}