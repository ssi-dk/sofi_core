USE [IB_Tarmbakdata]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

DROP TRIGGER IF EXISTS [dbo].[HIST_trig_Isolater];
DROP TABLE IF EXISTS [dbo].[HIST_tbl_Isolater_SAP];
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


CREATE TRIGGER [dbo].[HIST_trig_Isolater] ON [dbo].[tbl_Isolater_SAP]
AFTER UPDATE
AS 
BEGIN
  WITH IsolateChanges AS (
      SELECT d.*
      FROM inserted i
        JOIN deleted d ON i.Isolatnr = d.Isolatnr
      WHERE
        d.[RunID]                  IS NOT NULL and d.[RunID]                  != i.[RunID] or
        d.[FUDNR]                  IS NOT NULL and d.[FUDNR]                  != i.[FUDNR] or
        d.[ClusterID]              IS NOT NULL and d.[ClusterID]              != i.[ClusterID] or
        d.[Species]                IS NOT NULL and d.[Species]                != i.[Species] or
        d.[Subspecies]             IS NOT NULL and d.[Subspecies]             != i.[Subspecies] or
        d.[Serotype]               IS NOT NULL and d.[Serotype]               != i.[Serotype] or
        d.[ST]                     IS NOT NULL and d.[ST]                     != i.[ST] or
        d.[pathotype]              IS NOT NULL and d.[pathotype]              != i.[pathotype] or
        d.[Adheasion]              IS NOT NULL and d.[Adheasion]              != i.[Adheasion] or
        d.[Toxin]                  IS NOT NULL and d.[Toxin]                  != i.[Toxin] or
        d.[AMR_profil]             IS NOT NULL and d.[AMR_profil]             != i.[AMR_profil] or
        d.[Dato_godkendt_serotype] IS NOT NULL and d.[Dato_godkendt_serotype] != i.[Dato_godkendt_serotype] or
        d.[Dato_godkendt_QC]       IS NOT NULL and d.[Dato_godkendt_QC]       != i.[Dato_godkendt_QC] or
        d.[Dato_godkendt_ST]       IS NOT NULL and d.[Dato_godkendt_ST]       != i.[Dato_godkendt_ST]
  )
  INSERT INTO [IB_Tarmbakdata].[dbo].[HIST_tbl_Isolater_SAP]
  SELECT 
    [RunID],
    [FUDNR],
    [ClusterID],
    [Species],
    [Subspecies],
    [Serotype],
    [ST],
    [pathotype],
    [Adheasion],
    [Toxin],
    [AMR_profil],
    [Dato_godkendt_serotype],
    [Dato_godkendt_QC],
    [Dato_godkendt_ST]
  FROM IsolateChanges
END
GO


DROP TRIGGER IF EXISTS [dbo].[HIST_trig_GenoRes];
DROP TABLE IF EXISTS [dbo].[HIST_tbl_GenoRes];
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
    [AMR_Van] [nvarchar](10) NULL
  ) ON [PRIMARY]
GO

CREATE TRIGGER [dbo].[HIST_trig_GenoRes] ON [dbo].[tbl_GenoRes]
AFTER UPDATE
AS 
BEGIN
	WITH GeoResChanges AS (
			SELECT d.*
			FROM inserted i
				JOIN deleted d ON i.isolatnr = d.isolatnr
			WHERE
				d.[ResfinderVersion]        IS NOT NULL and d.[ResfinderVersion]        != i.[ResfinderVersion] or
				d.[Dato_godkendt_resistens] IS NOT NULL and d.[Dato_godkendt_resistens] != i.[Dato_godkendt_resistens] or
				d.[Resistensgener]          IS NOT NULL and d.[Resistensgener]          != i.[Resistensgener] or
				d.[AMR_profil]              IS NOT NULL and d.[AMR_profil]              != i.[AMR_profil] or
				d.[AMR_Ami]                 IS NOT NULL and d.[AMR_Ami]                 != i.[AMR_Ami] or
				d.[AMR_Amp]                 IS NOT NULL and d.[AMR_Amp]                 != i.[AMR_Amp] or
				d.[AMR_Azi]                 IS NOT NULL and d.[AMR_Azi]                 != i.[AMR_Azi] or
				d.[AMR_Fep]                 IS NOT NULL and d.[AMR_Fep]                 != i.[AMR_Fep] or
				d.[AMR_Fot]                 IS NOT NULL and d.[AMR_Fot]                 != i.[AMR_Fot] or
				d.[AMR_F_C]                 IS NOT NULL and d.[AMR_F_C]                 != i.[AMR_F_C] or
				d.[AMR_Fox]                 IS NOT NULL and d.[AMR_Fox]                 != i.[AMR_Fox] or
				d.[AMR_Taz]                 IS NOT NULL and d.[AMR_Taz]                 != i.[AMR_Taz] or
				d.[AMR_T_C]                 IS NOT NULL and d.[AMR_T_C]                 != i.[AMR_T_C] or
				d.[AMR_Chl]                 IS NOT NULL and d.[AMR_Chl]                 != i.[AMR_Chl] or
				d.[AMR_Cip]                 IS NOT NULL and d.[AMR_Cip]                 != i.[AMR_Cip] or
				d.[AMR_Cli]                 IS NOT NULL and d.[AMR_Cli]                 != i.[AMR_Cli] or
				d.[AMR_Col]                 IS NOT NULL and d.[AMR_Col]                 != i.[AMR_Col] or
				d.[AMR_Dap]                 IS NOT NULL and d.[AMR_Dap]                 != i.[AMR_Dap] or
				d.[AMR_Etp]                 IS NOT NULL and d.[AMR_Etp]                 != i.[AMR_Etp] or
				d.[AMR_Ery]                 IS NOT NULL and d.[AMR_Ery]                 != i.[AMR_Ery] or
				d.[AMR_Fus]                 IS NOT NULL and d.[AMR_Fus]                 != i.[AMR_Fus] or
				d.[AMR_Gen]                 IS NOT NULL and d.[AMR_Gen]                 != i.[AMR_Gen] or
				d.[AMR_Imi]                 IS NOT NULL and d.[AMR_Imi]                 != i.[AMR_Imi] or
				d.[AMR_Kan]                 IS NOT NULL and d.[AMR_Kan]                 != i.[AMR_Kan] or
				d.[AMR_Lzd]                 IS NOT NULL and d.[AMR_Lzd]                 != i.[AMR_Lzd] or
				d.[AMR_Mero]                IS NOT NULL and d.[AMR_Mero]                != i.[AMR_Mero] or
				d.[AMR_Mup]                 IS NOT NULL and d.[AMR_Mup]                 != i.[AMR_Mup] or
				d.[AMR_Nal]                 IS NOT NULL and d.[AMR_Nal]                 != i.[AMR_Nal] or
				d.[AMR_Pen]                 IS NOT NULL and d.[AMR_Pen]                 != i.[AMR_Pen] or
				d.[AMR_Syn]                 IS NOT NULL and d.[AMR_Syn]                 != i.[AMR_Syn] or
				d.[AMR_Rif]                 IS NOT NULL and d.[AMR_Rif]                 != i.[AMR_Rif] or
				d.[AMR_Str]                 IS NOT NULL and d.[AMR_Str]                 != i.[AMR_Str] or
				d.[AMR_Sul]                 IS NOT NULL and d.[AMR_Sul]                 != i.[AMR_Sul] or
				d.[AMR_Tei]                 IS NOT NULL and d.[AMR_Tei]                 != i.[AMR_Tei] or
				d.[AMR_Trm]                 IS NOT NULL and d.[AMR_Trm]                 != i.[AMR_Trm] or
				d.[AMR_Tet]                 IS NOT NULL and d.[AMR_Tet]                 != i.[AMR_Tet] or
				d.[AMR_Tia]                 IS NOT NULL and d.[AMR_Tia]                 != i.[AMR_Tia] or
				d.[AMR_Tgc]                 IS NOT NULL and d.[AMR_Tgc]                 != i.[AMR_Tgc] or
				d.[AMR_Tmp]                 IS NOT NULL and d.[AMR_Tmp]                 != i.[AMR_Tmp] or
				d.[AMR_Van]                 IS NOT NULL and d.[AMR_Van]                 != i.[AMR_Van]
	)
	INSERT INTO [IB_Tarmbakdata].[dbo].[HIST_tbl_GenoRes]
	SELECT 
		[ResfinderVersion],
		[Dato_godkendt_resistens],
		[Resistensgener],
		[AMR_profil],
		[AMR_Ami],
		[AMR_Amp],
		[AMR_Azi],
		[AMR_Fep],
		[AMR_Fot],
		[AMR_F_C],
		[AMR_Fox],
		[AMR_Taz],
		[AMR_T_C],
		[AMR_Chl],
		[AMR_Cip],
		[AMR_Cli],
		[AMR_Col],
		[AMR_Dap],
		[AMR_Etp],
		[AMR_Ery],
		[AMR_Fus],
		[AMR_Gen],
		[AMR_Imi],
		[AMR_Kan],
		[AMR_Lzd],
		[AMR_Mero],
		[AMR_Mup],
		[AMR_Nal],
		[AMR_Pen],
		[AMR_Syn],
		[AMR_Rif],
		[AMR_Str],
		[AMR_Sul],
		[AMR_Tei],
		[AMR_Trm],
		[AMR_Tet],
		[AMR_Tia],
		[AMR_Tgc],
		[AMR_Tmp],
		[AMR_Van]
	FROM GeoResChanges
END
GO