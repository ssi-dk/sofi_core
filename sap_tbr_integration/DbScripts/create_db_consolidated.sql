CREATE DATABASE [IB_Tarmbakdata]
GO
USE [IB_Tarmbakdata]
GO
/****** Object:  User [svb_SOFI_TBR_t]    Script Date: 11-05-2021 10:10:11 ******/
CREATE USER [svb_SOFI_TBR_t] FOR LOGIN [svb_SOFI_TBR_t] WITH DEFAULT_SCHEMA=[FVST_DTU]
GO
/****** Object:  Schema [FVST_DTU]    Script Date: 11-05-2021 10:10:11 ******/
CREATE SCHEMA [FVST_DTU]
GO
/****** Object:  UserDefinedTableType [FVST_DTU].[Isolate_List]    Script Date: 11-05-2021 10:10:11 ******/
CREATE TYPE [FVST_DTU].[Isolate_List] AS TABLE(
	[IsolateId] [nvarchar](14) NULL
)
GO
/****** Object:  UserDefinedTableType [FVST_DTU].[IsolateRowVer_List]    Script Date: 11-05-2021 10:10:11 ******/
CREATE TYPE [FVST_DTU].[IsolateRowVer_List] AS TABLE(
	[IsolateId] [nvarchar](14) NULL,
	[RowVer] [bigint] NULL
)
GO
/****** Object:  Table [dbo].[tbl_Baktnavn]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_Baktnavn](
	[baktid] [nvarchar](10) NOT NULL,
	[baktgrup] [nvarchar](1) NULL,
	[bakttype] [nvarchar](4) NULL,
	[bakutype] [nvarchar](5) NULL,
	[baktnavn] [nvarchar](40) NULL,
	[kortnavn] [nvarchar](50) NULL,
	[serotype] [nvarchar](50) NULL,
	[species] [nvarchar](50) NULL,
	[RowVer] [timestamp] NOT NULL,
 CONSTRAINT [PK_tbl_Baktnavn] PRIMARY KEY CLUSTERED 
(
	[baktid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_Basis_Ekstra_SAP]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_Basis_Ekstra_SAP](
	[provnr] [nvarchar](14) NOT NULL,
	[regdato] [smalldatetime] NULL,
	[kliniskinfo] [nvarchar](2000) NULL,
	[kmacode] [nvarchar](4) NULL,
	[comments] [nvarchar](2000) NULL,
	[region] [nvarchar](10) NULL,
	[analysetype] [nvarchar](10) NULL,
	[SenderCode] [varchar](5) NULL,
	[RowVer] [timestamp] NOT NULL,
 CONSTRAINT [PK_tbl_Basis_Ekstra_SAP] PRIMARY KEY CLUSTERED 
(
	[provnr] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_Basis_SAP]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_Basis_SAP](
	[provnr] [nvarchar](14) NOT NULL,
	[lokalnr] [nvarchar](15) NULL,
	[cprnr] [nvarchar](10) NULL,
	[navn] [nvarchar](50) NULL,
	[alder] [smallint] NULL,
	[kon] [nvarchar](1) NULL,
	[udland] [nvarchar](4) NULL,
	[indskode] [nvarchar](10) NULL,
	[provamt] [nvarchar](2) NULL,
	[provart] [nvarchar](1) NULL,
	[provdato] [smalldatetime] NULL,
	[modtdato] [smalldatetime] NULL,
	[baktid] [nvarchar](10) NULL,
	[provnr_old] [nvarchar](14) NULL,
	[Rejse] [nvarchar](6) NULL,
	[final_infection] [nvarchar](10) NULL,
	[027_marker] [nvarchar](10) NULL,
	[tcdA] [nvarchar](10) NULL,
	[tcdB] [nvarchar](10) NULL,
	[cdtAB] [nvarchar](10) NULL,
	[FUDnr] [nvarchar](5) NULL,
	[RowVer] [timestamp] NOT NULL,
 CONSTRAINT [PK_tbl_Basis_SAP] PRIMARY KEY CLUSTERED 
(
	[provnr] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_GenoRes]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_GenoRes](
	[isolatnr] [nvarchar](14) NOT NULL,
	[RunID] [nvarchar](50) NOT NULL,
	[ResfinderVersion] [nvarchar](10) NULL,
	[Dato_godkendt_resistens] [date] NULL,
	[Resistensgener] [nvarchar](200) NULL,
	[AMR_profil] [nvarchar](50) NULL,
	[AMR_Ami] [nvarchar](10) NULL,
	[AMR_Amp] [nvarchar](10) NULL,
	[AMR_Azi] [nvarchar](10) NULL,
	[AMR_Fep] [nvarchar](10) NULL,
	[AMR_Fot] [nvarchar](10) NULL,
	[AMR_F_C] [nvarchar](10) NULL,
	[AMR_Fox] [nvarchar](10) NULL,
	[AMR_Taz] [nvarchar](10) NULL,
	[AMR_T_C] [nvarchar](10) NULL,
	[AMR_Chl] [nvarchar](10) NULL,
	[AMR_Cip] [nvarchar](10) NULL,
	[AMR_Cli] [nvarchar](10) NULL,
	[AMR_Col] [nvarchar](10) NULL,
	[AMR_Dap] [nvarchar](10) NULL,
	[AMR_Etp] [nvarchar](10) NULL,
	[AMR_Ery] [nvarchar](10) NULL,
	[AMR_Fus] [nvarchar](10) NULL,
	[AMR_Gen] [nvarchar](10) NULL,
	[AMR_Imi] [nvarchar](10) NULL,
	[AMR_Kan] [nvarchar](10) NULL,
	[AMR_Lzd] [nvarchar](10) NULL,
	[AMR_Mero] [nvarchar](10) NULL,
	[AMR_Mup] [nvarchar](10) NULL,
	[AMR_Nal] [nvarchar](10) NULL,
	[AMR_Pen] [nvarchar](10) NULL,
	[AMR_Syn] [nvarchar](10) NULL,
	[AMR_Rif] [nvarchar](10) NULL,
	[AMR_Str] [nvarchar](10) NULL,
	[AMR_Sul] [nvarchar](10) NULL,
	[AMR_Tei] [nvarchar](10) NULL,
	[AMR_Trm] [nvarchar](10) NULL,
	[AMR_Tet] [nvarchar](10) NULL,
	[AMR_Tia] [nvarchar](10) NULL,
	[AMR_Tgc] [nvarchar](10) NULL,
	[AMR_Tmp] [nvarchar](10) NULL,
	[AMR_Van] [nvarchar](10) NULL,
	[RowVer] [timestamp] NOT NULL,
 CONSTRAINT [PK_tbl_GenoRes] PRIMARY KEY CLUSTERED 
(
	[isolatnr] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_Isolater_SAP]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_Isolater_SAP](
	[Isolatnr] [nvarchar](14) NOT NULL,
	[lokalnr] [nvarchar](15) NULL,
	[cprnr] [nvarchar](10) NULL,
	[navn] [nvarchar](50) NULL,
	[provdato] [smalldatetime] NULL,
	[KMAdato] [smalldatetime] NULL,
	[SSIdato] [smalldatetime] NULL,
	[baktid] [nvarchar](10) NULL,
	[CaseProvnr] [nvarchar](14) NULL,
	[LimsOrdrekode] [nvarchar](6) NULL,
	[Provart] [nvarchar](1) NULL,
	[Vaekst] [nvarchar](6) NULL,
	[PrimaryIsolate] [bit] NULL,
	[ST] [smallint] NULL,
	[CaseDef] [nvarchar](10) NULL,
	[RunID] [nvarchar](50) NULL,
	[FUDNR] [nvarchar](10) NULL,
	[ClusterID] [nvarchar](50) NULL,
	[Species] [nvarchar](50) NULL,
	[Subspecies] [nvarchar](50) NULL,
	[Serotype] [nvarchar](50) NULL,
	[pathotype] [nvarchar](10) NULL,
	[Adheasion] [nvarchar](50) NULL,
	[Toxin] [nvarchar](50) NULL,
	[AMR_profil] [nvarchar](50) NULL,
	[Dato_godkendt_serotype] [datetime] NULL,
	[Dato_godkendt_QC] [datetime] NULL,
	[Dato_godkendt_ST] [datetime] NULL,
	[Dato_godkendt_toxin] [datetime] NULL,
	[Dato_godkendt_cluster] [datetime] NULL,
	[Dato_Epi] [datetime] NULL,
	[RowVer] [timestamp] NOT NULL,
 CONSTRAINT [PK_tbl_Isolater_SAP] PRIMARY KEY CLUSTERED 
(
	[Isolatnr] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_KMA]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_KMA](
	[kmanr] [nvarchar](4) NOT NULL,
	[kmanavn] [nvarchar](30) NULL,
	[regionsnr] [nvarchar](2) NULL,
	[RowVer] [timestamp] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[kmanr] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_KMA_Lab]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_KMA_Lab](
	[SenderCode] [varchar](5) NOT NULL,
	[Labnavn] [nvarchar](30) NULL,
	[Regionsnr] [nvarchar](2) NULL,
 CONSTRAINT [PK__tbl_KMA___4BBBCF0A72C4F2D3] PRIMARY KEY CLUSTERED 
(
	[SenderCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_Lande]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_Lande](
	[isokode] [nvarchar](4) NOT NULL,
	[landnavn] [nvarchar](50) NULL,
	[iso2k] [nvarchar](3) NULL,
 CONSTRAINT [PK_tbl_Lande] PRIMARY KEY CLUSTERED 
(
	[isokode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_Region]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_Region](
	[Regionsnr] [nvarchar](5) NOT NULL,
	[Regionsnavn] [nvarchar](50) NULL,
	[RegionEnr] [nvarchar](10) NOT NULL,
	[RowVer] [timestamp] NOT NULL,
 CONSTRAINT [PK_tbl_Region] PRIMARY KEY CLUSTERED 
(
	[Regionsnr] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90) ON [PRIMARY],
 CONSTRAINT [UX_tbl_Region] UNIQUE NONCLUSTERED 
(
	[RegionEnr] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [FVST_DTU].[vw_Baktnavn_SAP]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_Baktnavn_SAP]
AS SELECT   baktid, baktgrup, bakttype, bakutype, baktnavn, kortnavn, serotype, species, RowVer
FROM         dbo.tbl_Baktnavn

GO
/****** Object:  View [FVST_DTU].[vw_Basis_Ekstra_SAP]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_Basis_Ekstra_SAP]
AS SELECT   provnr, regdato, kliniskinfo, kmacode, comments, region, analysetype, SenderCode, RowVer
FROM         dbo.tbl_Basis_Ekstra_SAP

GO
/****** Object:  View [FVST_DTU].[vw_Basis_SAP]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_Basis_SAP]
AS
SELECT   provnr, lokalnr, cprnr, navn, alder, kon, udland, indskode, provamt, provart, provdato, modtdato, baktid, provnr_old, Rejse, final_infection, [027_marker], tcdA, tcdB, cdtAB, FUDnr, RowVer
FROM         dbo.tbl_Basis_SAP

GO
/****** Object:  View [FVST_DTU].[vw_GenoRes_SAP]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_GenoRes_SAP]
AS SELECT   isolatnr, RunID, ResfinderVersion, Dato_godkendt_resistens, Resistensgener, AMR_profil, AMR_Ami, AMR_Amp, AMR_Azi, AMR_Fep, AMR_Fot, AMR_F_C, AMR_Fox, AMR_Taz, AMR_T_C, 
                         AMR_Chl, AMR_Cip, AMR_Cli, AMR_Col, AMR_Dap, AMR_Etp, AMR_Ery, AMR_Fus, AMR_Gen, AMR_Imi, AMR_Kan, AMR_Lzd, AMR_Mero, AMR_Mup, AMR_Nal, AMR_Pen, AMR_Syn, 
                         AMR_Rif, AMR_Str, AMR_Sul, AMR_Tei, AMR_Trm, AMR_Tet, AMR_Tia, AMR_Tgc, AMR_Tmp, AMR_Van, RowVer
FROM         dbo.tbl_GenoRes

GO
/****** Object:  View [FVST_DTU].[vw_Isolater_SAP]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [FVST_DTU].[vw_Isolater_SAP]
AS
SELECT        Isolatnr, lokalnr, cprnr, navn, provdato, KMAdato, SSIdato, baktid, CaseProvnr, LimsOrdrekode, Provart, Vaekst, PrimaryIsolate, ST, CaseDef, RunID, Serotype, FUDNR, ClusterID, Species, Subspecies, pathotype, Adheasion, 
                         Toxin, Dato_godkendt_serotype, Dato_godkendt_QC, Dato_godkendt_ST, Dato_godkendt_toxin, Dato_godkendt_cluster, Dato_Epi, RowVer
FROM            dbo.tbl_Isolater_SAP
GO
/****** Object:  View [FVST_DTU].[vw_KMA_SAP]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_KMA_SAP]
AS SELECT   kmanr, kmanavn, regionsnr, RowVer
FROM         dbo.tbl_KMA

GO
/****** Object:  View [FVST_DTU].[vw_Lande_SAP]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_Lande_SAP]
AS SELECT   isokode, landnavn, iso2k
FROM         dbo.tbl_Lande
GO
/****** Object:  View [FVST_DTU].[vw_Region_SAP]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_Region_SAP]
AS SELECT   Regionsnr, Regionsnavn, RegionEnr, RowVer
FROM         dbo.tbl_Region

GO
/****** Object:  View [FVST_DTU].[iw_Isolates]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE VIEW [FVST_DTU].[iw_Isolates]
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
    isolater.Dato_godkendt_cluster DateApprovedCluster,
	isolater.Dato_Epi, 
    CAST((SELECT MAX(RowVer)
    FROM (VALUES (isolater.RowVer),(genores.RowVer),(base.RowVer),(bakterier.RowVer),(ekstra.RowVer),(kma.RowVer),(regioner.RowVer)) AS Allrowversions(RowVer)) AS BIGINT) RowVer
  FROM FVST_DTU.vw_Isolater_SAP isolater 
  LEFT JOIN FVST_DTU.vw_GenoRes_SAP genores ON isolater.Isolatnr = genores.isolatnr
  LEFT JOIN FVST_DTU.vw_Basis_SAP base
    LEFT JOIN FVST_DTU.vw_Lande_SAP lande ON base.udland = lande.isokode
    LEFT JOIN FVST_DTU.vw_Baktnavn_SAP bakterier ON base.baktid = bakterier.baktid
    LEFT JOIN FVST_DTU.vw_Basis_Ekstra_SAP ekstra
      LEFT JOIN FVST_DTU.vw_KMA_SAP kma ON ekstra.kmacode = kma.kmanr
--      INNER JOIN FVST_DTU.vw_KMA_LAB_SAP kma_lab ON ekstra.SenderCode = kma_lab.SenderCode
        INNER JOIN FVST_DTU.vw_Region_SAP regioner ON ekstra.region = regioner.RegionEnr
      ON base.provnr = ekstra.provnr
    ON isolater.CaseProvnr = base.provnr

GO
/****** Object:  View [FVST_DTU].[iw_Isolate_RowVersions]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[iw_Isolate_RowVersions] AS
SELECT isolater.Isolatnr IsolateId,
  CAST(
    (SELECT MAX(RowVer) FROM (
      VALUES (isolater.RowVer),
        (genores.RowVer),
        (base.RowVer),
        (bakterier.RowVer),
        (ekstra.RowVer),
        (kma.RowVer),
        (regioner.RowVer)
        ) AS Allrowversions(RowVer)
    ) 
  AS BIGINT) RowVer
FROM dbo.tbl_Isolater_SAP isolater
  LEFT JOIN dbo.tbl_GenoRes genores ON isolater.Isolatnr = genores.isolatnr
  LEFT JOIN dbo.tbl_Basis_SAP base
    LEFT JOIN dbo.tbl_Lande lande ON base.udland = lande.isokode
    LEFT JOIN dbo.tbl_Baktnavn bakterier ON base.baktid = bakterier.baktid
    LEFT JOIN dbo.tbl_Basis_Ekstra_SAP ekstra
      LEFT JOIN dbo.tbl_KMA kma ON ekstra.kmacode = kma.kmanr
        INNER JOIN dbo.tbl_Region regioner ON ekstra.region = regioner.RegionEnr 
      ON base.provnr = ekstra.provnr 
    ON isolater.CaseProvnr = base.provnr

GO
/****** Object:  View [FVST_DTU].[vw_KMA_LAB_SAP]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_KMA_LAB_SAP]
AS SELECT   SenderCode, Labnavn, Regionsnr
FROM         dbo.tbl_KMA_Lab
GO
ALTER TABLE [dbo].[tbl_Basis_Ekstra_SAP]  WITH NOCHECK ADD  CONSTRAINT [FK_tbl_Basis_Ekstra_SAP_tbl_Basis_SAP] FOREIGN KEY([provnr])
REFERENCES [dbo].[tbl_Basis_SAP] ([provnr])
GO
ALTER TABLE [dbo].[tbl_Basis_Ekstra_SAP] CHECK CONSTRAINT [FK_tbl_Basis_Ekstra_SAP_tbl_Basis_SAP]
GO
ALTER TABLE [dbo].[tbl_Basis_Ekstra_SAP]  WITH NOCHECK ADD  CONSTRAINT [FK_tbl_Basis_Ekstra_SAP_tbl_KMA] FOREIGN KEY([kmacode])
REFERENCES [dbo].[tbl_KMA] ([kmanr])
GO
ALTER TABLE [dbo].[tbl_Basis_Ekstra_SAP] CHECK CONSTRAINT [FK_tbl_Basis_Ekstra_SAP_tbl_KMA]
GO
ALTER TABLE [dbo].[tbl_Basis_Ekstra_SAP]  WITH NOCHECK ADD  CONSTRAINT [FK_tbl_Basis_Ekstra_SAP_tbl_KMA_Lab] FOREIGN KEY([SenderCode])
REFERENCES [dbo].[tbl_KMA_Lab] ([SenderCode])
GO
ALTER TABLE [dbo].[tbl_Basis_Ekstra_SAP] CHECK CONSTRAINT [FK_tbl_Basis_Ekstra_SAP_tbl_KMA_Lab]
GO
ALTER TABLE [dbo].[tbl_Basis_Ekstra_SAP]  WITH NOCHECK ADD  CONSTRAINT [FK_tbl_Basis_Ekstra_SAP_tbl_Region] FOREIGN KEY([region])
REFERENCES [dbo].[tbl_Region] ([RegionEnr])
GO
ALTER TABLE [dbo].[tbl_Basis_Ekstra_SAP] CHECK CONSTRAINT [FK_tbl_Basis_Ekstra_SAP_tbl_Region]
GO
ALTER TABLE [dbo].[tbl_Basis_SAP]  WITH NOCHECK ADD  CONSTRAINT [FK_tbl_Basis_SAP_tbl_Baktnavn] FOREIGN KEY([baktid])
REFERENCES [dbo].[tbl_Baktnavn] ([baktid])
GO
ALTER TABLE [dbo].[tbl_Basis_SAP] CHECK CONSTRAINT [FK_tbl_Basis_SAP_tbl_Baktnavn]
GO
ALTER TABLE [dbo].[tbl_Basis_SAP]  WITH NOCHECK ADD  CONSTRAINT [FK_tbl_Basis_SAP_tbl_Lande] FOREIGN KEY([udland])
REFERENCES [dbo].[tbl_Lande] ([isokode])
GO
ALTER TABLE [dbo].[tbl_Basis_SAP] CHECK CONSTRAINT [FK_tbl_Basis_SAP_tbl_Lande]
GO
ALTER TABLE [dbo].[tbl_GenoRes]  WITH NOCHECK ADD  CONSTRAINT [FK_tbl_GenoRes_tbl_Isolater_SAP] FOREIGN KEY([isolatnr])
REFERENCES [dbo].[tbl_Isolater_SAP] ([Isolatnr])
GO
ALTER TABLE [dbo].[tbl_GenoRes] CHECK CONSTRAINT [FK_tbl_GenoRes_tbl_Isolater_SAP]
GO
ALTER TABLE [dbo].[tbl_Isolater_SAP]  WITH NOCHECK ADD  CONSTRAINT [FK_tbl_Isolater_SAP_tbl_Basis_SAP] FOREIGN KEY([CaseProvnr])
REFERENCES [dbo].[tbl_Basis_SAP] ([provnr])
GO
ALTER TABLE [dbo].[tbl_Isolater_SAP] CHECK CONSTRAINT [FK_tbl_Isolater_SAP_tbl_Basis_SAP]
GO
/****** Object:  StoredProcedure [FVST_DTU].[Get_Isolate]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [FVST_DTU].[Get_Isolate] @Isolatnr nvarchar(14)
AS
  SELECT * FROM FVST_DTU.iw_Isolates isolates
  WHERE @Isolatnr = isolates.IsolateId

GO
/****** Object:  StoredProcedure [FVST_DTU].[Get_Isolate_RowVersions]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [FVST_DTU].[Get_Isolate_RowVersions] 
  @List AS FVST_DTU.IsolateRowVer_List READONLY AS
SELECT isolate.IsolateId,
  isolate.RowVer
FROM FVST_DTU.iw_Isolate_RowVersions isolate
  INNER JOIN @List ids on ids.IsolateId = isolate.IsolateId
  WHERE ids.RowVer != isolate.RowVer

GO
/****** Object:  StoredProcedure [FVST_DTU].[Get_Many_Isolates]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [FVST_DTU].[Get_Many_Isolates] 
@List AS FVST_DTU.Isolate_List READONLY
AS
  SELECT * FROM FVST_DTU.iw_Isolates isolates
  INNER JOIN @List ids on ids.IsolateId = isolates.IsolateId

GO
/****** Object:  StoredProcedure [FVST_DTU].[UpdateIsolate]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [FVST_DTU].[UpdateIsolate](
        @IsolateId [nvarchar](14),
        @RunID [nvarchar](50),
        @Serotype [nvarchar](50) NULL,
        @ST [smallint] NULL,
        @FudNr [nvarchar](10) NULL,
        @ClusterId [nvarchar](50) NULL,
        @Species [nvarchar](50) NULL,
        @Subspecies [nvarchar](50) NULL,
        @Pathotype [nvarchar](10) NULL,
        @Adheasion [nvarchar](50) NULL,
        @Toxin [nvarchar](50) NULL,
        @Resistensgener [nvarchar](200) NULL,
        @AmrProfile [nvarchar](10) NULL,
        @Amikacin [nvarchar](10) NULL,
        @Ampicillin [nvarchar](10) NULL,
        @Azithromycin [nvarchar](10) NULL,
        @Cefepime [nvarchar](10) NULL,
        @Cefotaxime [nvarchar](10) NULL,
        @CefotaximeClavulanat [nvarchar](10) NULL,
        @Cefoxitin [nvarchar](10) NULL,
        @Ceftazidime [nvarchar](10) NULL,
        @CeftazidimeClavulanat [nvarchar](10) NULL,
        @Chloramphenicol [nvarchar](10) NULL,
        @Ciprofloxacin [nvarchar](10) NULL,
        @Clindamycin [nvarchar](10) NULL,
        @Colistin [nvarchar](10) NULL,
        @Daptomycin [nvarchar](10) NULL,
        @Ertapenem [nvarchar](10) NULL,
        @Erythromycin [nvarchar](10) NULL,
        @Fusidinsyre [nvarchar](10) NULL,
        @Gentamicin [nvarchar](10) NULL,
        @Imipenem [nvarchar](10) NULL,
        @Kanamycin [nvarchar](10) NULL,
        @Linezolid [nvarchar](10) NULL,
        @Meropenem [nvarchar](10) NULL,
        @Mupirocin [nvarchar](10) NULL,
        @Nalidixan [nvarchar](10) NULL,
        @Penicillin [nvarchar](10) NULL,
        @CeftazidimeClavulanatn [nvarchar](10) NULL,
        @Rifampin [nvarchar](10) NULL,
        @Streptomycin [nvarchar](10) NULL,
        @Sulfamethoxazole [nvarchar](10) NULL,
        @Teicoplanin [nvarchar](10) NULL,
        @Temocilin [nvarchar](10) NULL,
        @Tetracyklin [nvarchar](10) NULL,
        @Tiamulin [nvarchar](10) NULL,
        @Tigecycline [nvarchar](10) NULL,
        @Trimethoprim [nvarchar](10) NULL,
        @Vancomycin [nvarchar](10) NULL,
        @ResfinderVersion [nvarchar](10) NULL,
        @DateApprovedResistens [datetime] NULL,
        @DateApprovedSerotype [datetime] NULL,
        @DateApprovedQC [datetime] NULL,
        @DateApprovedST [datetime] NULL,
        @DateApprovedCluster [datetime] NULL,
        @DateApprovedToxin [datetime] NULL,
        @DateEpi [datetime] NULL
)
AS
BEGIN
        UPDATE FVST_DTU.vw_Isolater_SAP
        SET
            Serotype = IsNull(@Serotype, Serotype),
            ST = IsNull(@ST, ST),
            RunID = IsNull(@RunID, RunID),
            FUDNR = IsNull(@FudNr, FUDNR),
            ClusterID = IsNull(@ClusterId, ClusterID),
            Species = IsNull(@Species, Species),
            Subspecies = IsNull(@Subspecies, Subspecies),
            pathotype = IsNull(@Pathotype, pathotype),
            Adheasion = IsNull(@Adheasion, Adheasion),
            Toxin = IsNull(@Toxin, Toxin),
            Dato_godkendt_serotype = IsNull(@DateApprovedSerotype, Dato_godkendt_serotype),
            Dato_godkendt_QC = IsNull(@DateApprovedQC, Dato_godkendt_QC),
            Dato_godkendt_ST = IsNull(@DateApprovedST, Dato_godkendt_ST),
            Dato_godkendt_toxin = IsNull(@DateApprovedToxin, Dato_godkendt_toxin),
            Dato_godkendt_cluster = IsNull(@DateApprovedCluster, Dato_godkendt_cluster)
            Dato_Epi = IsNull(@DateEpi, Dato_Epi)
        WHERE isolatnr = @IsolateId

        UPDATE FVST_DTU.vw_GenoRes_SAP
        SET
            Resistensgener = IsNull(@Resistensgener, Resistensgener),
            AMR_profil = IsNull(@AmrProfile, AMR_profil),
            AMR_Ami = IsNull(@Amikacin, AMR_Ami),
            AMR_Amp = IsNull(@Ampicillin, AMR_Amp),
            AMR_Azi = IsNull(@Azithromycin, AMR_Azi),
            AMR_Fep = IsNull(@Cefepime, AMR_Fep),
            AMR_Fot = IsNull(@Cefotaxime, AMR_Fot),
            AMR_F_C = IsNull(@CefotaximeClavulanat, AMR_F_C),
            AMR_Fox = IsNull(@Cefoxitin, AMR_Fox),
            AMR_Taz = IsNull(@Ceftazidime, AMR_Taz),
            AMR_T_C = IsNull(@CeftazidimeClavulanat, AMR_T_C),
            AMR_Chl = IsNull(@Chloramphenicol, AMR_Chl),
            AMR_Cip = IsNull(@Ciprofloxacin, AMR_Cip),
            AMR_Cli = IsNull(@Clindamycin, AMR_Cli),
            AMR_Col = IsNull(@Colistin, AMR_Col),
            AMR_Dap = IsNull(@Daptomycin, AMR_Dap),
            AMR_Etp = IsNull(@Ertapenem, AMR_Etp),
            AMR_Ery = IsNull(@Erythromycin, AMR_Ery),
            AMR_Fus = IsNull(@Fusidinsyre, AMR_Fus),
            AMR_Gen = IsNull(@Gentamicin, AMR_Gen),
            AMR_Imi = IsNull(@Imipenem, AMR_Imi),
            AMR_Kan = IsNull(@Kanamycin, AMR_Kan),
            AMR_Lzd = IsNull(@Linezolid, AMR_Lzd),
            AMR_Mero = IsNull(@Meropenem, AMR_Mero),
            AMR_Mup = IsNull(@Mupirocin, AMR_Mup),
            AMR_Nal = IsNull(@Nalidixan, AMR_Nal),
            AMR_Pen = IsNull(@Penicillin, AMR_Pen),
            AMR_Syn = IsNull(@CeftazidimeClavulanatn, AMR_Syn),
            AMR_Rif = IsNull(@Rifampin, AMR_Rif),
            AMR_Str = IsNull(@Streptomycin, AMR_Str),
            AMR_Sul = IsNull(@Sulfamethoxazole, AMR_Sul),
            AMR_Tei = IsNull(@Teicoplanin, AMR_Tei),
            AMR_Trm = IsNull(@Temocilin, AMR_Trm),
            AMR_Tet = IsNull(@Tetracyklin, AMR_Tet),
            AMR_Tia = IsNull(@Tiamulin, AMR_Tia),
            AMR_Tgc = IsNull(@Tigecycline, AMR_Tgc),
            AMR_Tmp = IsNull(@Trimethoprim, AMR_Tmp),
            AMR_Van = IsNull(@Vancomycin, AMR_Van),
            ResfinderVersion = IsNull(@ResfinderVersion, ResfinderVersion),
            Dato_godkendt_resistens = IsNull(@DateApprovedResistens, Dato_godkendt_resistens)
        WHERE isolatnr = @IsolateId
END
GO
/****** Object:  StoredProcedure [FVST_DTU].[usp_Select_vw_Basis]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE     PROCEDURE [FVST_DTU].[usp_Select_vw_Basis]
AS	
SET NOCOUNT ON
  SELECT * FROM FVST_DTU.vw_Basis_SAP
RETURN

GO
/****** Object:  StoredProcedure [FVST_DTU].[usp_Select_vw_Basis_Ekstra]    Script Date: 11-05-2021 10:10:11 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




CREATE     PROCEDURE [FVST_DTU].[usp_Select_vw_Basis_Ekstra]
AS	
SET NOCOUNT ON
  SELECT * FROM FVST_DTU.vw_Basis_Ekstra_SAP
RETURN

GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPane1', @value=N'[0E232FF0-B466-11cf-A24F-00AA00A3EFFF, 1.00]
Begin DesignProperties = 
   Begin PaneConfigurations = 
      Begin PaneConfiguration = 0
         NumPanes = 4
         Configuration = "(H (1[40] 4[20] 2[20] 3) )"
      End
      Begin PaneConfiguration = 1
         NumPanes = 3
         Configuration = "(H (1 [50] 4 [25] 3))"
      End
      Begin PaneConfiguration = 2
         NumPanes = 3
         Configuration = "(H (1 [50] 2 [25] 3))"
      End
      Begin PaneConfiguration = 3
         NumPanes = 3
         Configuration = "(H (4 [30] 2 [40] 3))"
      End
      Begin PaneConfiguration = 4
         NumPanes = 2
         Configuration = "(H (1 [56] 3))"
      End
      Begin PaneConfiguration = 5
         NumPanes = 2
         Configuration = "(H (2 [66] 3))"
      End
      Begin PaneConfiguration = 6
         NumPanes = 2
         Configuration = "(H (4 [50] 3))"
      End
      Begin PaneConfiguration = 7
         NumPanes = 1
         Configuration = "(V (3))"
      End
      Begin PaneConfiguration = 8
         NumPanes = 3
         Configuration = "(H (1[56] 4[18] 2) )"
      End
      Begin PaneConfiguration = 9
         NumPanes = 2
         Configuration = "(H (1 [75] 4))"
      End
      Begin PaneConfiguration = 10
         NumPanes = 2
         Configuration = "(H (1[66] 2) )"
      End
      Begin PaneConfiguration = 11
         NumPanes = 2
         Configuration = "(H (4 [60] 2))"
      End
      Begin PaneConfiguration = 12
         NumPanes = 1
         Configuration = "(H (1) )"
      End
      Begin PaneConfiguration = 13
         NumPanes = 1
         Configuration = "(V (4))"
      End
      Begin PaneConfiguration = 14
         NumPanes = 1
         Configuration = "(V (2))"
      End
      ActivePaneConfig = 0
   End
   Begin DiagramPane = 
      Begin Origin = 
         Top = 0
         Left = 0
      End
      Begin Tables = 
         Begin Table = "tbl_Isolater_SAP"
            Begin Extent = 
               Top = 6
               Left = 38
               Bottom = 136
               Right = 258
            End
            DisplayFlags = 280
            TopColumn = 28
         End
      End
   End
   Begin SQLPane = 
   End
   Begin DataPane = 
      Begin ParameterDefaults = ""
      End
   End
   Begin CriteriaPane = 
      Begin ColumnWidths = 11
         Column = 1440
         Alias = 900
         Table = 1170
         Output = 720
         Append = 1400
         NewValue = 1170
         SortType = 1350
         SortOrder = 1410
         GroupBy = 1350
         Filter = 1350
         Or = 1350
         Or = 1350
         Or = 1350
      End
   End
End
' , @level0type=N'SCHEMA',@level0name=N'FVST_DTU', @level1type=N'VIEW',@level1name=N'vw_Isolater_SAP'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_DiagramPaneCount', @value=1 , @level0type=N'SCHEMA',@level0name=N'FVST_DTU', @level1type=N'VIEW',@level1name=N'vw_Isolater_SAP'
GO
