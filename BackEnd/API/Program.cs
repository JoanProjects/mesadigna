using System.Text;
using System.Text.Json.Serialization;
using Application.Services;
using Application.Services.Interfaces;
using Core.Domain.Interfaces.Repositories;
using DotNetEnv;
using Infrastructure.Data;
using Infrastructure.ExternalServices.Prediction;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Polly;

var builder = WebApplication.CreateBuilder(args);

Env.Load();

var dbServer = Environment.GetEnvironmentVariable("DB_SERVER");
var dbDatabase = Environment.GetEnvironmentVariable("DB_DATABASE");
var dbUser = Environment.GetEnvironmentVariable("DB_USER");
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");

var connectionString =
    $"Server={dbServer};Database={dbDatabase};User Id={dbUser};Password={dbPassword};TrustServerCertificate=True;";

// ── EF Core ────────────────────────────────────────────────────
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// ── Repositorios ───────────────────────────────────────────────
builder.Services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBeneficiaryRepository, BeneficiaryRepository>();
builder.Services.AddScoped<IHealthProfileRepository, HealthProfileRepository>();
builder.Services.AddScoped<IAttendanceRepository, AttendanceRepository>();
builder.Services.AddScoped<IIngredientRepository, IngredientRepository>();
builder.Services.AddScoped<IMealRepository, MealRepository>();
builder.Services.AddScoped<IDailyKitchenPlanRepository, DailyKitchenPlanRepository>();

// ── Servicios de aplicación ────────────────────────────────────
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBeneficiaryService, BeneficiaryService>();
builder.Services.AddScoped<IHealthProfileService, HealthProfileService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<IKitchenService, KitchenService>();
builder.Services.AddScoped<IIngredientService, IngredientService>();
builder.Services.AddScoped<IMealService, MealService>();
builder.Services.AddScoped<IKitchenPlanService, KitchenPlanService>();
builder.Services.AddHttpClient<IPredictionService, PythonPredictionService>().AddStandardResilienceHandler();

// ── Microservicio Python ───────────────────────────────────────
builder.Services.AddHttpClient<IPredictionService, PythonPredictionService>(client =>
    {
        client.BaseAddress = new Uri(builder.Configuration["PredictionService:BaseUrl"] ?? "http://localhost:8000");
        client.Timeout = TimeSpan.FromSeconds(5);
    })
    .AddResilienceHandler("prediction", resilienceBuilder =>
    {
        resilienceBuilder.AddCircuitBreaker(new()
        {
            SamplingDuration = TimeSpan.FromSeconds(30),
            FailureRatio = 0.5,
            MinimumThroughput = 3,
            BreakDuration = TimeSpan.FromSeconds(15)
        });
        resilienceBuilder.AddRetry(new()
        {
            MaxRetryAttempts = 2,
            Delay = TimeSpan.FromSeconds(1)
        });
    });

// ── JWT ────────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!))
        };
    });

builder.Services.AddAuthorization();

// ── CORS ───────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

// ── Health Checks ──────────────────────────────────────────────
builder.Services.AddHealthChecks()
    .AddUrlGroup(
        new Uri((builder.Configuration["PredictionService:BaseUrl"] ?? "http://localhost:8000") + "/health"),
        name: "prediction-service",
        failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Degraded
    );

// ── Controllers + OpenAPI ──────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

var app = builder.Build();

// ── Middleware Pipeline ────────────────────────────────────────
app.UseMiddleware<API.Middleware.ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseCors("FrontendDev");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");


app.Run();