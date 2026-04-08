using System.Net;
using System.Text.Json;
using Application.DTOS.Common;
using Core.Domain.Exception;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        if (exception is ConflictException conflictEx)
        {
            _logger.LogWarning("Conflicto: {Message} (campo: {Field})", conflictEx.Message, conflictEx.Field);

            context.Response.StatusCode = (int)HttpStatusCode.Conflict;

            object response;
            if (!string.IsNullOrEmpty(conflictEx.Field))
            {
                response = ApiResponse<object>.ConflictField(
                    conflictEx.Message, conflictEx.Field, conflictEx.Message);
            }
            else
            {
                response = ApiResponse<object>.Fail(conflictEx.Message);
            }

            await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
            return;
        }

        var (statusCode, message) = exception switch
        {
            KeyNotFoundException => (HttpStatusCode.NotFound, exception.Message),
            InvalidOperationException => (HttpStatusCode.BadRequest, exception.Message),
            ArgumentException => (HttpStatusCode.BadRequest, exception.Message),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Acceso no autorizado."),
            _ => (HttpStatusCode.InternalServerError, "Ocurrió un error interno en el servidor.")
        };

        if (statusCode == HttpStatusCode.InternalServerError)
            _logger.LogError(exception, "Error no controlado: {Message}", exception.Message);
        else
            _logger.LogWarning("Excepción de negocio: {Type} - {Message}", exception.GetType().Name, exception.Message);

        context.Response.StatusCode = (int)statusCode;

        var failResponse = ApiResponse<object>.Fail(message);
        var json = JsonSerializer.Serialize(failResponse, jsonOptions);

        await context.Response.WriteAsync(json);
    }
}