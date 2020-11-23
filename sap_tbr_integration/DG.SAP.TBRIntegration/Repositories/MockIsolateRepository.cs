using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DG.SAP.TBRIntegration.Models;

namespace DG.SAP.TBRIntegration.Repositories
{
    public class MockIsolateRepository : IIsolateRepository
    {
        private readonly List<Isolate> _isolates = new List<Isolate> {
            new Isolate
            {
                IsolateId = "Test1"
            },
            new Isolate
            {
                IsolateId = "Test2"
            },
            new Isolate
            {
                IsolateId = "Test3"
            }
        };

        public Task<bool> Approve(Approval isolateAnalysisApproval)
        {
            throw new NotImplementedException();
        }

        public Task<Isolate> GetIsolate(string isolateId)
        {
            return Task.FromResult(_isolates.FirstOrDefault(i => i.IsolateId == isolateId));
        }
    }
}
