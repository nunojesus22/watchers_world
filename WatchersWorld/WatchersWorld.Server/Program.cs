using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using WatchersWorld.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using WatchersWorld.Server.Models.Authentication;
using Microsoft.AspNetCore.Identity;
using WatchersWorld.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using System;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<JWTService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<IFollowersService, FollowersService>();

builder.Services.AddDbContext<WatchersWorldServerContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("WatchersWorldServerContextConnection"));
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddIdentityCore<User>(options =>
{
    //configurações email
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;

    //para confirmar email
    options.SignIn.RequireConfirmedEmail = true;
})
    .AddRoles<IdentityRole>() //para adicionar roles
    .AddRoleManager<RoleManager<IdentityRole>>() //usar o RoleManager
    .AddEntityFrameworkStores<WatchersWorldServerContext>() //usar o nosso context
    .AddSignInManager<SignInManager<User>>() //usar o SignInManager
    .AddUserManager<UserManager<User>>() //usar o UserManager
    .AddDefaultTokenProviders(); //Usado para criar os tokens de confirmação de email

//Permite fazer a autenticação usando os JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            //validar o token baseado na key dada no development.json JWT:Key
            ValidateIssuerSigningKey = true,
            //o issuer signing key baseada na JWT:Key
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"])),
            //o issuer é o link do projeto api 
            ValidIssuer = builder.Configuration["JWT:Issuer"],
            ValidateIssuer = true,
            ValidateAudience = false,
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = actionContext =>
    {
        var errors = actionContext.ModelState
            .Where(e => e.Value.Errors.Count > 0)
            .SelectMany(kvp => kvp.Value.Errors.Select(error => new
            {
                Message = error.ErrorMessage,
                Field = kvp.Key
            }))
            .ToArray();

        var toReturn = new
        {
            Errors = errors
        };

        return new BadRequestObjectResult(toReturn);
    };

});

var app = builder.Build();


app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("AllowAllOrigins");

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI();

    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var context = services.GetRequiredService<WatchersWorldServerContext>();
        context.Database.EnsureCreated();
    var userManager = services.GetRequiredService<UserManager<User>>();

        DataSeeder.SeedData(context, userManager).Wait();
    }
//}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
