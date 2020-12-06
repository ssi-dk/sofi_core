using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DG.SAP.TBRIntegration.Options;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using DG.SAP.TBRIntegration.Repositories;

namespace DG.SAP.TBRIntegration
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddSwaggerGen(c =>
            {
                c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Version = "v1",
                    Title = "SAP TBR Integration",
                    Description = "TBR integration for SAP",
                });
            });

            LoadDependencies(services);
        }

        private void LoadDependencies(IServiceCollection services)
        {
            var dbOptions = Configuration.GetSection("database").Get<DatabaseOptions>();
            services.AddSingleton<IIsolateRepository>(provider => new IsolateRepository(dbOptions));
        }
        
        private void LoadMockDependencies(IServiceCollection services)
        {
            services.AddScoped<IIsolateRepository, MockIsolateRepository>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("swagger/v1/swagger.json", "TBR integration for SAP");
                c.RoutePrefix = string.Empty;
            });


            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
