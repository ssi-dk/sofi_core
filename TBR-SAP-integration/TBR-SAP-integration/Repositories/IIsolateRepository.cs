using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TBR_SAP_integration.Models;

namespace TBR_SAP_integration.Repositories
{
    public interface IIsolateRepository
    {
        bool Approve(Approval isolateAnalysisApproval);
        Isolate GetIsolate(string isolateID);
    }
}
