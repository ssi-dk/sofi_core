/****** Create DB ******/
CREATE DATABASE [IB_Tarmbakdata]
GO
/****** Use DB ******/
USE [IB_Tarmbakdata]
GO
/****** Object:  Schema [FVST_DTU]    Script Date: 13-11-2020 14:48:46 ******/
CREATE SCHEMA [FVST_DTU]
GO
/****** Object:  Table [dbo].[tbl_Baktnavn]    Script Date: 13-11-2020 14:48:46 ******/
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
 CONSTRAINT [PK_tbl_Baktnavn] PRIMARY KEY CLUSTERED 
(
	[baktid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_Basis_Ekstra_SAP]    Script Date: 13-11-2020 14:48:46 ******/
--tbl_Basis_Ekstra_SAP is a testtable with anonymized data and less records than the original table [dbo].[tbl_Basis_Ekstra] on productionserver
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
	[SenderCode] [varchar](5) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_Basis_SAP]    Script Date: 13-11-2020 14:48:46 ******/
--tbl_Basis_SAP is a testtable with anonymized data and less records than the original table [dbo].[tbl_Basis] on productionserver
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
	[FUDnr] [nvarchar](5) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_GenoRes]    Script Date: 13-11-2020 14:48:46 ******/
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
 CONSTRAINT [PK_tbl_GenoRes] PRIMARY KEY CLUSTERED 
(
	[isolatnr] ASC,
	[RunID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_Isolater_SAP]    Script Date: 13-11-2020 14:48:46 ******/
--tbl_Isolater_SAP is a testtable with anonymized data and less records than the original table [dbo].[tbl_Isolater] on productionserver
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
	[Dato_godkendt_ST] [datetime] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_KMA]    Script Date: 13-11-2020 14:48:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_KMA](
	[kmanr] [nvarchar](4) NOT NULL,
	[kmanavn] [nvarchar](30) NULL,
	[regionsnr] [nvarchar](2) NULL,
PRIMARY KEY CLUSTERED 
(
	[kmanr] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tbl_KMA_Lab]    Script Date: 13-11-2020 14:48:46 ******/
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
/****** Object:  Table [dbo].[tbl_Lande]    Script Date: 13-11-2020 14:48:46 ******/
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
/****** Object:  Table [dbo].[tbl_Region]    Script Date: 13-11-2020 14:48:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tbl_Region](
	[Regionsnr] [nvarchar](5) NOT NULL,
	[Regionsnavn] [nvarchar](50) NULL,
	[RegionEnr] [nvarchar](10) NOT NULL,
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
/****** Object:  View [FVST_DTU].[vw_Baktnavn_SAP]    Script Date: 13-11-2020 14:48:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_Baktnavn_SAP]
AS SELECT   baktid, baktgrup, bakttype, bakutype, baktnavn, kortnavn, serotype, species
FROM         dbo.tbl_Baktnavn
GO
/****** Object:  View [FVST_DTU].[vw_Basis_Ekstra_SAP]    Script Date: 13-11-2020 14:48:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_Basis_Ekstra_SAP]
AS SELECT   provnr, regdato, kliniskinfo, kmacode, comments, region, analysetype, SenderCode
FROM         dbo.tbl_Basis_Ekstra_SAP
GO
/****** Object:  View [FVST_DTU].[vw_Basis_SAP]    Script Date: 13-11-2020 14:48:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [FVST_DTU].[vw_Basis_SAP]
AS
SELECT   provnr, lokalnr, cprnr, navn, alder, kon, udland, indskode, provamt, provart, provdato, modtdato, baktid, provnr_old, Rejse, final_infection, [027_marker], tcdA, tcdB, cdtAB, FUDnr
FROM         dbo.tbl_Basis_SAP
GO
/****** Object:  View [FVST_DTU].[vw_GenoRes_SAP]    Script Date: 13-11-2020 14:48:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_GenoRes_SAP]
AS SELECT   isolatnr, RunID, ResfinderVersion, Dato_godkendt_resistens, Resistensgener, AMR_profil, AMR_Ami, AMR_Amp, AMR_Azi, AMR_Fep, AMR_Fot, AMR_F_C, AMR_Fox, AMR_Taz, AMR_T_C, 
                         AMR_Chl, AMR_Cip, AMR_Cli, AMR_Col, AMR_Dap, AMR_Etp, AMR_Ery, AMR_Fus, AMR_Gen, AMR_Imi, AMR_Kan, AMR_Lzd, AMR_Mero, AMR_Mup, AMR_Nal, AMR_Pen, AMR_Syn, 
                         AMR_Rif, AMR_Str, AMR_Sul, AMR_Tei, AMR_Trm, AMR_Tet, AMR_Tia, AMR_Tgc, AMR_Tmp, AMR_Van
FROM         dbo.tbl_GenoRes
GO
/****** Object:  View [FVST_DTU].[vw_Isolater_SAP]    Script Date: 13-11-2020 14:48:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_Isolater_SAP]
AS SELECT   Isolatnr, lokalnr, cprnr, navn, provdato, KMAdato, SSIdato, baktid, CaseProvnr, LimsOrdrekode, Provart, Vaekst, PrimaryIsolate, ST, CaseDef
FROM         dbo.tbl_Isolater_SAP
GO
/****** Object:  View [FVST_DTU].[vw_KMA_LAB_SAP]    Script Date: 13-11-2020 14:48:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_KMA_LAB_SAP]
AS SELECT   SenderCode, Labnavn, Regionsnr
FROM         dbo.tbl_KMA_Lab
GO
/****** Object:  View [FVST_DTU].[vw_KMA_SAP]    Script Date: 13-11-2020 14:48:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_KMA_SAP]
AS SELECT   kmanr, kmanavn, regionsnr
FROM         dbo.tbl_KMA
GO
/****** Object:  View [FVST_DTU].[vw_Lande_SAP]    Script Date: 13-11-2020 14:48:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_Lande_SAP]
AS SELECT   isokode, landnavn, iso2k
FROM         dbo.tbl_Lande
GO
/****** Object:  View [FVST_DTU].[vw_Region_SAP]    Script Date: 13-11-2020 14:48:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [FVST_DTU].[vw_Region_SAP]
AS SELECT   Regionsnr, Regionsnavn, RegionEnr
FROM         dbo.tbl_Region
GO