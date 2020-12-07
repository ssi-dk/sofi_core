/***** Add stored procedure *****/
USE [IB_Tarmbakdata]
GO

CREATE PROCEDURE FVST_DTU.GetIsolate @Isolatnr nvarchar(14)
AS
    SELECT 
    	isolater.RunID RunId,
    	isolater.Isolatnr IsolateId, 
    	isolater.provdato TestDate, 
    	isolater.SSIdato SsiDate,
    	isolater.cprnr CprNr,
    	isolater.navn Name,
    	isolater.PrimaryIsolate PrimaryIsolate,
    	isolater.KMAdato KmaDate,
    	kma.kmanavn KmaName,
    	base.kon Gender,
    	base.alder Age,
    	base.Rejse Travel,
    	lande.landnavn TravelCountry,
        regioner.Regionsnavn Region,
        -- Below are values for which SAP is the MASTER
    	isolater.Serotype Serotype,
    	isolater.ST ST,
    	isolater.FUDNR FudNr,
    	isolater.ClusterID ClusterId,
        isolater.Species Species,
        isolater.Subspecies Subspecies,
        isolater.pathotype Pathotype,
        isolater.Adheasion Adheasion,
        isolater.Toxin Toxin,
        genores.Resistensgener Resistensgener,
        genores.AMR_profil AmrProfile,
        genores.AMR_Ami Amikacin,
        genores.AMR_Amp Ampicillin,
        genores.AMR_Azi Azithromycin,
        genores.AMR_Fep Cefepime,
        genores.AMR_Fot Cefotaxime,
        genores.AMR_F_C CefotaximeClavulanat,
        genores.AMR_Fox Cefoxitin,
        genores.AMR_Taz Ceftazidime,
        genores.AMR_T_C CeftazidimeClavulanat,
        genores.AMR_Chl Chloramphenicol,
        genores.AMR_Cip Ciprofloxacin,
        genores.AMR_Cli Clindamycin,
        genores.AMR_Col Colistin,
        genores.AMR_Dap Daptomycin,
        genores.AMR_Etp Ertapenem,
        genores.AMR_Ery Erythromycin,
        genores.AMR_Fus Fusidinsyre,
        genores.AMR_Gen Gentamicin,
        genores.AMR_Imi Imipenem,
        genores.AMR_Kan Kanamycin,
        genores.AMR_Lzd Linezolid,
        genores.AMR_Mero Meropenem,
        genores.AMR_Mup Mupirocin,
        genores.AMR_Nal Nalidixan,
        genores.AMR_Pen Penicillin,
        genores.AMR_Syn CeftazidimeClavulanatn,
        genores.AMR_Rif Rifampin,
        genores.AMR_Str Streptomycin,
        genores.AMR_Sul Sulfamethoxazole,
        genores.AMR_Tei Teicoplanin,
        genores.AMR_Trm Temocilin,
        genores.AMR_Tet Tetracyklin,
        genores.AMR_Tia Tiamulin,
        genores.AMR_Tgc Tigecycline,
        genores.AMR_Tmp Trimethoprim,
        genores.AMR_Van Vancomycin,
        genores.ResfinderVersion ResfinderVersion,
        genores.Dato_godkendt_resistens DateApprovedResistens,
        isolater.Dato_godkendt_serotype DateApprovedSerotype,
        isolater.Dato_godkendt_QC DateApprovedQC,
        isolater.Dato_godkendt_ST DateApprovedST,
        isolater.Dato_godkendt_toxin DateApprovedToxin,
        isolater.Dato_godkendt_cluster DateApprovedCluster
    FROM FVST_DTU.vw_Isolater_SAP isolater 
    LEFT JOIN FVST_DTU.vw_GenoRes_SAP genores ON isolater.Isolatnr = genores.isolatnr
	LEFT JOIN FVST_DTU.vw_Basis_SAP base
		LEFT JOIN FVST_DTU.vw_Lande_SAP lande ON base.udland = lande.isokode
		LEFT JOIN FVST_DTU.vw_Baktnavn_SAP bakterier ON base.baktid = bakterier.baktid
		LEFT JOIN FVST_DTU.vw_Basis_Ekstra_SAP ekstra
			LEFT JOIN FVST_DTU.vw_KMA_SAP kma ON ekstra.kmacode = kma.kmanr
--              INNER JOIN FVST_DTU.vw_KMA_LAB_SAP kma_lab ON ekstra.SenderCode = kma_lab.SenderCode
                INNER JOIN FVST_DTU.vw_Region_SAP regioner ON ekstra.region = regioner.RegionEnr
			ON base.provnr = ekstra.provnr
		ON isolater.CaseProvnr = base.provnr
    WHERE genores.isolatnr = @Isolatnr
GO