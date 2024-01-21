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

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<WatchersWorldServerContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<JWTService>();

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

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
