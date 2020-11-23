using System.Threading.Tasks;
using DG.SAP.TBRIntegration.Models;

namespace DG.SAP.TBRIntegration.Repositories
{
    public interface IIsolateRepository
    {
        Task<bool> Approve(Approval isolateAnalysisApproval);
        Task<Isolate> GetIsolate(string isolateId);
    }
}
