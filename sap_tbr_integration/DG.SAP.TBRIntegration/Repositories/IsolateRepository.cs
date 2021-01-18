using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
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

        public async Task<bool> UpdateIsolate(IsolateUpdate isolateUpdate)
        {
            await using var connection = new SqlConnection(_connectionString);
            try
            {
                await connection.ExecuteAsync(
                    "FVST_DTU.UpdateIsolate", 
                    isolateUpdate, 
                    commandType: CommandType.StoredProcedure
                );
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
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
                dt.Rows.Add(isolate.IsolateId, isolate.EntryRowVer);
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
                new { List = dt.AsTableValuedParameter("FVST_DTU.IsolateList") },
                commandType: CommandType.StoredProcedure

            );
            return changes.ToList();

        }
  }
}