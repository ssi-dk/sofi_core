using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TBR_SAP_integration.Models;

namespace TBR_SAP_integration.Repositories
{
    public class MockIsolateRepository : IIsolateRepository
    {
        List<Isolate> isolates = new List<Isolate> {
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

        public bool Approve(Approval isolateAnalysisApproval)
        {
            throw new NotImplementedException();
        }

        public Isolate GetIsolate(string isolateID)
        {
            return isolates.Where(i => i.IsolateId == isolateID).FirstOrDefault();
        }
    }
}
