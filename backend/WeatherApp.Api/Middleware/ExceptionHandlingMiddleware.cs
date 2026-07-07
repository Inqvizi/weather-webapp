using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using WeatherApp.Domain.Exceptions;

namespace WeatherApp.Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate next;
    private readonly ILogger<ExceptionHandlingMiddleware> logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        this.next = next;
        this.logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (CityNotFoundException ex)
        {
            logger.LogWarning("City not found: {CityName}", ex.CityName);
            await WriteErrorResponse(context, StatusCodes.Status404NotFound, ex.Message);
        }
        catch (ValidationException ex)
        {
            await WriteErrorResponse(context, StatusCodes.Status400BadRequest, ex.Message);
        }
        catch (WeatherApiException ex)
        {
            logger.LogError("Weather API error: {Message}", ex.Message);
            await WriteErrorResponse(context, StatusCodes.Status502BadGateway,
                "Failed to retrieve data from the weather service");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error occurred");
            await WriteErrorResponse(context, StatusCodes.Status500InternalServerError,
                "An unexpected error occurred. Please try again later.");
        }
    }

    private static async Task WriteErrorResponse(HttpContext context, int statusCode, string message, IEnumerable<string>? errors = null)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        var body = new
        {
            statusCode,
            message,
            errors = errors?.ToArray() ?? []
        };
        await context.Response.WriteAsync(JsonSerializer.Serialize(body, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}