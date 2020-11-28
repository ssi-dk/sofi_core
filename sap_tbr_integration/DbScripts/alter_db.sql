ALTER TABLE [dbo].[tbl_Isolater_SAP]
ADD Dato_godkendt_toxin [datetime] NULL; 

ALTER TABLE [dbo].[tbl_Isolater_SAP]
ADD Dato_godkendt_cluster [datetime] NULL; 

ALTER VIEW [FVST_DTU].[vw_Isolater_SAP]
AS SELECT   Isolatnr, lokalnr, cprnr, navn, provdato, KMAdato, SSIdato, baktid, CaseProvnr, LimsOrdrekode, Provart, Vaekst, PrimaryIsolate, ST, CaseDef, RunID, Serotype, FUDNR, ClusterID, Species, Subspecies, Pathotype, Adheasion, Toxin, Dato_godkendt_serotype, Dato_godkendt_QC, Dato_godkendt_ST, Dato_godkendt_Toxin, Dato_godkendt_Cluster
FROM         dbo.tbl_Isolater_SAP