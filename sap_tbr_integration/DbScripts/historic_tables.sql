
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HIST_tbl_Isolater_SAP](
	[RunID] [nvarchar](50) NULL,
	[FUDNR] [nvarchar](10) NULL,
	[ClusterID] [nvarchar](50) NULL,
	[Species] [nvarchar](50) NULL,
	[Subspecies] [nvarchar](50) NULL,
	[Serotype] [nvarchar](50) NULL,
	[ST] [smallint] NULL,
	[pathotype] [nvarchar](10) NULL,
	[Adheasion] [nvarchar](50) NULL,
	[Toxin] [nvarchar](50) NULL,
	[AMR_profil] [nvarchar](50) NULL,
	[Dato_godkendt_serotype] [datetime] NULL,
	[Dato_godkendt_QC] [datetime] NULL,
	[Dato_godkendt_ST] [datetime] NULL
) ON [PRIMARY]
GO


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HIST_tbl_GenoRes](
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