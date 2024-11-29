using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.EventLog;

namespace DG.SAP.TBRIntegration
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                }).ConfigureLogging((hosting, logging)=>
                {
                    logging.ClearProviders();
                    logging.AddConfiguration(hosting.Configuration.GetSection("Logging"));
                    var isMock = hosting.HostingEnvironment.IsDevelopment();
                    Console.WriteLine($"IsMock: {isMock}");
                    if (!isMock) {
                        logging.AddEventLog(new EventLogSettings()
                        {
                            SourceName = "TBR.SAP.Integration",
                        });
                    }                    
                    logging.AddConsole();
                });
    }
}
