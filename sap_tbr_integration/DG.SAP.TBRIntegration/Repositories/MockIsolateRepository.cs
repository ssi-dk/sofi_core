using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DG.SAP.TBRIntegration.Models;
using System.IO;
using Newtonsoft.Json;

namespace DG.SAP.TBRIntegration.Repositories
{
    public class MockIsolateRepository : IIsolateRepository
    {
        private readonly Lazy<List<Isolate>> _isolates = new Lazy<List<Isolate>>(() =>
        {
            var lines = File.ReadAllLines("tbr.generated.jsonl");

            if (lines.Count() == 0)
                throw new Exception("tbr.generated.jsonl empty or not found");

            return lines.Select(l => JsonConvert.DeserializeObject<Isolate>(l.Replace("_", ""))).ToList();
        });
          

        public Task<bool> UpdateIsolate(IsolateUpdate isolateUpdate)
        {
            throw new NotImplementedException();
        }

        public Task<Isolate> GetIsolate(string isolateId)
        {
            return Task.FromResult(_isolates.Value.FirstOrDefault(i => i.IsolateId == isolateId));
        }

        public Task<IList<RowVersion>> GetChangedIsolateIds(IList<RowVersion> isolates)
        {
            throw new NotImplementedException();
        }

        public Task<IList<Isolate>> GetChangedIsolates(IList<RowVersion> isolates)
        {
            throw new NotImplementedException();
        }

  }
}
