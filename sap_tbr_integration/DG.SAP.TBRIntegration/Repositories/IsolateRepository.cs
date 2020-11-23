using System;
using System.Data.SqlClient;
using System.Threading.Tasks;
using Dapper;
using DG.SAP.TBRIntegration.Models;
using DG.SAP.TBRIntegration.Options;

namespace DG.SAP.TBRIntegration.Repositories
{
    public class IsolateRepository : IIsolateRepository
    {
        private readonly string _connectionString;

        public IsolateRepository(string connectionString)
        {
            _connectionString = connectionString;
        }

        public IsolateRepository(DatabaseOptions options) : this(
            new SqlConnectionStringBuilder
            {
                DataSource = options.DataSource,
                UserID = options.UserId,
                Password = options.Password,
                InitialCatalog = options.Database
            }.ConnectionString
        )
        {
        }

        public Task<bool> Approve(Approval isolateAnalysisApproval)
        {
            throw new NotImplementedException();
        }

        public async Task<Isolate> GetIsolate(string isolateId)
        {
            const string sql = "EXEC [FVST_DTU].[GetIsolate] @Isolatnr = @IsolateId";
            var parameters = new {IsolateId = isolateId};
            await using var connection = new SqlConnection(_connectionString);
            return await connection.QuerySingleOrDefaultAsync<Isolate>(sql, parameters);
        }
    }
}