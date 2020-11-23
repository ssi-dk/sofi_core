using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DG.SAP.TBRIntegration.Models
{
    public class Isolate
    {
        public string IsolateId { get; set; }
        public string RunId { get; set; }
        public DateTime TestDate { get; set; }
        public DateTime SsiDate { get; set; }
        public string CprNr { get; set; }
        public string Name { get; set; }
        public bool PrimaryIsolate { get; set; }
        public string Serotype { get; set; }
        public int? ST { get; set; }
        public DateTime KmaDate { get; set; }
        public string KmaName { get; set; }
        public string Gender { get; set; }
        public int? Age { get; set; }
        public string FudNr { get; set; }
        public string Travel { get; set; }
        public string TravelCountry { get; set; }
        public string Region { get; set; }
    }
}
