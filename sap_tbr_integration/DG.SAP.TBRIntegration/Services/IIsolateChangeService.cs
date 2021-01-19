using System.Collections.Generic;
using System.Threading.Tasks;
using DG.SAP.TBRIntegration.Models;

namespace DG.SAP.TBRIntegration.Services
{
    public interface IIsolateChangeService
    {
        Task<IList<Isolate>> GetChangedIsolates(IList<RowVersion> isolates);
    }
}
