using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TBR_SAP_integration.Models
{
    public class Isolate
    {
        public string IsolateId { get; set; }
        public DateTime SamplingDate { get; set; }
        public DateTime ReceivedDate { get; set; }
        public string KMA { get; set; }
        public string Agents { get; set; }
        public bool Public { get; set; }
    }
}
