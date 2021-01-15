using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DG.SAP.TBRIntegration.Models
{
    public class Isolate: ISapMasterData
    {
        public string IsolateId { get; set; }
        public string RunId { get; set; }
        public DateTime? TestDate { get; set; }
        public DateTime? SsiDate { get; set; }
        public string CprNr { get; set; }
        public string Name { get; set; }
        public bool? PrimaryIsolate { get; set; }
        public DateTime? KmaDate { get; set; }
        public string KmaName { get; set; }
        public string Gender { get; set; }
        public int? Age { get; set; }
        public string Travel { get; set; }
        public string TravelCountry { get; set; }
        public string Region { get; set; }
        // Values for which SAP is Master
        public string Serotype { get; set; }
        public int? ST { get; set; }
        public string FudNr { get; set; }
        public string ClusterId { get; set; }
        public string Species { get; set; }
        public string Subspecies { get; set; }
        public string Pathotype { get; set; }
        public string Adheasion { get; set; }
        public string Toxin { get; set; }
        public string Resistensgener { get; set; }
        public string AmrProfile { get; set; }
        public string Amikacin { get; set; }
        public string Ampicillin { get; set; }
        public string Azithromycin { get; set; }
        public string Cefepime { get; set; }
        public string Cefotaxime { get; set; }
        public string CefotaximeClavulanat { get; set; }
        public string Cefoxitin { get; set; }
        public string Ceftazidime { get; set; }
        public string CeftazidimeClavulanat { get; set; }
        public string Chloramphenicol { get; set; }
        public string Ciprofloxacin { get; set; }
        public string Clindamycin { get; set; }
        public string Colistin { get; set; }
        public string Daptomycin { get; set; }
        public string Ertapenem { get; set; }
        public string Erythromycin { get; set; }
        public string Fusidinsyre { get; set; }
        public string Gentamicin { get; set; }
        public string Imipenem { get; set; }
        public string Kanamycin { get; set; }
        public string Linezolid { get; set; }
        public string Meropenem { get; set; }
        public string Mupirocin { get; set; }
        public string Nalidixan { get; set; }
        public string Penicillin { get; set; }
        public string CeftazidimeClavulanatn { get; set; }
        public string Rifampin { get; set; }
        public string Streptomycin { get; set; }
        public string Sulfamethoxazole { get; set; }
        public string Teicoplanin { get; set; }
        public string Temocilin { get; set; }
        public string Tetracyklin { get; set; }
        public string Tiamulin { get; set; }
        public string Tigecycline { get; set; }
        public string Trimethoprim { get; set; }
        public string Vancomycin { get; set; }
        public string ResfinderVersion { get; set; }
        public DateTime? DateApprovedResistens { get; set; }
        public DateTime? DateApprovedSerotype { get; set; }
        public DateTime? DateApprovedQC { get; set; }
        public DateTime? DateApprovedST { get; set; }
        public DateTime? DateApprovedToxin { get; set; }
        public DateTime? DateApprovedCluster { get; set; }

        public long RowVer { get; set; }
    }
}
