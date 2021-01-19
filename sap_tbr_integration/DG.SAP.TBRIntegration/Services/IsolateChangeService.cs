using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DG.SAP.TBRIntegration.Models;
using DG.SAP.TBRIntegration.Repositories;

namespace DG.SAP.TBRIntegration.Services
{
  public class IsolateChangeService : IIsolateChangeService
  {
        private readonly IIsolateRepository _isolateRepository;

        public IsolateChangeService(IIsolateRepository isolateRepository)
        {
            _isolateRepository = isolateRepository;
        }

    public async Task<IList<Isolate>> GetChangedIsolates(IList<RowVersion> isolates)
    {
        var changedIds = await _isolateRepository.GetChangedIsolateIds(isolates);
        return await _isolateRepository.GetChangedIsolates(changedIds);      
    }
  }
}
