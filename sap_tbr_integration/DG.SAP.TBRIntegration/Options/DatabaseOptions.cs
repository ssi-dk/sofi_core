using Microsoft.Extensions.Configuration.UserSecrets;

namespace DG.SAP.TBRIntegration.Options
{
    public class DatabaseOptions
    {
        public string UserId { get; set; }
        public string Password { get; set; }
        public string DataSource { get; set; }
        public string Database { get; set; }
    }
}