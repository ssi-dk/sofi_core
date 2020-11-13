using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DG.SAP.TBRIntegration.Models
{
    public class Approval
    {
        public string IsolateId { get; set; }
        public IEnumerable<FieldApproval> Fields { get; set; }
    }

    public class FieldApproval
    {
        public string Name { get; set; }
        public string Value { get; set; }    
    }
}
