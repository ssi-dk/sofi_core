using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DG.SAP.TBRIntegration.Models;

namespace DG.SAP.TBRIntegration.Repositories
{
    public interface IIsolateRepository
    {
        bool Approve(Approval isolateAnalysisApproval);
        Isolate GetIsolate(string isolateID);
    }
}
