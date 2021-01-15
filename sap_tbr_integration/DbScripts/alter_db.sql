USE [IB_Tarmbakdata]
GO

ALTER TABLE [dbo].[tbl_Isolater_SAP]
ADD Dato_godkendt_toxin [datetime] NULL; 
GO

ALTER TABLE [dbo].[tbl_Isolater_SAP]
ADD Dato_godkendt_cluster [datetime] NULL; 
GO

ALTER TABLE [dbo].[tbl_Isolater_SAP]
ADD RowVer [RowVersion];
GO

ALTER TABLE [dbo].[tbl_GenoRes]
ADD RowVer [RowVersion];
GO

ALTER TABLE [dbo].[tbl_Basis_SAP]
ADD RowVer [RowVersion];
GO

ALTER TABLE [dbo].[tbl_Baktnavn]
ADD RowVer [RowVersion];
GO

ALTER TABLE [dbo].[tbl_Basis_Ekstra_SAP]
ADD RowVer [RowVersion];
GO

ALTER TABLE [dbo].[tbl_KMA]
ADD RowVer [RowVersion];
GO

ALTER TABLE [dbo].[tbl_Region]
ADD RowVer [RowVersion];
GO


ALTER VIEW [FVST_DTU].[vw_Baktnavn_SAP]
AS SELECT   baktid, baktgrup, bakttype, bakutype, baktnavn, kortnavn, serotype, species, RowVer
FROM         dbo.tbl_Baktnavn
GO

ALTER VIEW [FVST_DTU].[vw_Basis_Ekstra_SAP]
AS SELECT   provnr, regdato, kliniskinfo, kmacode, comments, region, analysetype, SenderCode, RowVer
FROM         dbo.tbl_Basis_Ekstra_SAP
GO

ALTER VIEW [FVST_DTU].[vw_Basis_SAP]
AS
SELECT   provnr, lokalnr, cprnr, navn, alder, kon, udland, indskode, provamt, provart, provdato, modtdato, baktid, provnr_old, Rejse, final_infection, [027_marker], tcdA, tcdB, cdtAB, FUDnr, RowVer
FROM         dbo.tbl_Basis_SAP
GO

ALTER VIEW [FVST_DTU].[vw_GenoRes_SAP]
AS SELECT   isolatnr, RunID, ResfinderVersion, Dato_godkendt_resistens, Resistensgener, AMR_profil, AMR_Ami, AMR_Amp, AMR_Azi, AMR_Fep, AMR_Fot, AMR_F_C, AMR_Fox, AMR_Taz, AMR_T_C, 
                         AMR_Chl, AMR_Cip, AMR_Cli, AMR_Col, AMR_Dap, AMR_Etp, AMR_Ery, AMR_Fus, AMR_Gen, AMR_Imi, AMR_Kan, AMR_Lzd, AMR_Mero, AMR_Mup, AMR_Nal, AMR_Pen, AMR_Syn, 
                         AMR_Rif, AMR_Str, AMR_Sul, AMR_Tei, AMR_Trm, AMR_Tet, AMR_Tia, AMR_Tgc, AMR_Tmp, AMR_Van, RowVer
FROM         dbo.tbl_GenoRes
GO

ALTER VIEW [FVST_DTU].[vw_Isolater_SAP]
AS SELECT   Isolatnr, lokalnr, cprnr, navn, provdato, KMAdato, SSIdato, baktid, CaseProvnr, LimsOrdrekode, Provart, Vaekst, PrimaryIsolate, ST, CaseDef, RunID, Serotype, FUDNR, ClusterID, Species, Subspecies, Pathotype, Adheasion, Toxin, Dato_godkendt_serotype, Dato_godkendt_QC, Dato_godkendt_ST, Dato_godkendt_Toxin, Dato_godkendt_Cluster, RowVer
FROM         dbo.tbl_Isolater_SAP
GO

ALTER VIEW [FVST_DTU].[vw_KMA_SAP]
AS SELECT   kmanr, kmanavn, regionsnr, RowVer
FROM         dbo.tbl_KMA
GO

ALTER VIEW [FVST_DTU].[vw_Region_SAP]
AS SELECT   Regionsnr, Regionsnavn, RegionEnr, RowVer
FROM         dbo.tbl_Region
GO