using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using DG.SAP.TBRIntegration.Models;
using DG.SAP.TBRIntegration.Options;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace DG.SAP.TBRIntegration.Repositories
{
    public class IsolateRepository : IIsolateRepository
    {
        private readonly string _connectionString;
        private readonly ILogger<IsolateRepository> logger;

        public IsolateRepository(string connectionString, ILogger<IsolateRepository> logger)
        {
            _connectionString = connectionString;
            this.logger = logger;
        }

        public IsolateRepository(DatabaseOptions options, ILogger<IsolateRepository> logger) : this(
            new SqlConnectionStringBuilder
            {
                DataSource = options.DataSource,
                UserID = options.UserId,
                Password = options.Password,
                InitialCatalog = options.Database
            }.ConnectionString,
            logger
        )
        {
        }

        public async Task<bool> UpdateIsolate(IsolateUpdate isolateUpdate)
        {
            logger.LogInformation($"Trying to update with data {JsonConvert.SerializeObject(isolateUpdate)}");
            try
            {
                await using var connection = new SqlConnection(_connectionString);
                var res = await connection.ExecuteAsync(
                    "FVST_DTU.UpdateIsolate",
                    isolateUpdate,
                    commandType: CommandType.StoredProcedure
                );
            }
            catch(Exception e)
            {
                logger.LogError(e.ToString());
                return false;
            }
            return true;
        }

        public async Task<Isolate> GetIsolate(string isolateId)
        {
            await using var connection = new SqlConnection(_connectionString);
            var isolate = await connection.QueryAsync<Isolate>(
                "FVST_DTU.Get_Isolate", 
                new {Isolatnr = isolateId},
                commandType: CommandType.StoredProcedure
            );
            return isolate.SingleOrDefault();
        }

        public async Task<IList<RowVersion>> GetChangedIsolateIds(IList<RowVersion> isolates)
        {
            var dt = new DataTable();
            dt.Columns.Add("IsolateId");
            dt.Columns.Add("EntryRowVer");
            
            foreach (var isolate in isolates)
            {
                dt.Rows.Add(isolate.IsolateId, isolate.RowVer);
            }

            await using var connection = new SqlConnection(_connectionString);
            var changes = await connection.QueryAsync<RowVersion>(
                "FVST_DTU.Get_Isolate_RowVersions",
                new { List = dt.AsTableValuedParameter("FVST_DTU.IsolateRowVer_List") },
                commandType: CommandType.StoredProcedure

            );
            return changes.ToList();
        }
        public async Task<IList<Isolate>> GetChangedIsolates(IList<RowVersion> isolates)
        {
            var dt = new DataTable();
            dt.Columns.Add("IsolateId");
            
            foreach (var isolate in isolates)
            {
                dt.Rows.Add(isolate.IsolateId);
            }

            await using var connection = new SqlConnection(_connectionString);
            var changes = await connection.QueryAsync<Isolate>(
                "FVST_DTU.Get_Many_Isolates",
                new { List = dt.AsTableValuedParameter("FVST_DTU.Isolate_List") },
                commandType: CommandType.StoredProcedure

            );
            return changes.ToList();

        }
  }
}