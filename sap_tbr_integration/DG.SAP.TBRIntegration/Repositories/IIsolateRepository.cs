using System.Threading.Tasks;
using DG.SAP.TBRIntegration.Models;

namespace DG.SAP.TBRIntegration.Repositories
{
    public interface IIsolateRepository
    {
        Task<bool> UpdateIsolate(IsolateUpdate isolate);
        Task<Isolate> GetIsolate(string isolateId);
    }
}
