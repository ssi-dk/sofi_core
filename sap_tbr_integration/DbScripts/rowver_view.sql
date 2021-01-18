USE [IB_Tarmbakdata]
GO

DROP VIEW IF EXISTS FVST_DTU.iw_Isolate_RowVersions
DROP PROCEDURE IF EXISTS FVST_DTU.Get_Isolate_RowVersions;
GO

CREATE VIEW FVST_DTU.iw_Isolate_RowVersions
AS
  SELECT 
    isolater.Isolatnr IsolateId, 
    CAST((SELECT MAX(RowVer)
    FROM (VALUES (isolater.RowVer),(genores.RowVer),(base.RowVer),(bakterier.RowVer),(ekstra.RowVer),(kma.RowVer),(regioner.RowVer)) AS Allrowversions(RowVer)) AS BIGINT) EntryRowVer
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


CREATE PROCEDURE FVST_DTU.Get_Isolate_RowVersions 
  @List AS FVST_DTU.IsolateRowVer_List READONLY
AS
  SELECT isolate.IsolateId, isolate.EntryRowVer FROM FVST_DTU.iw_Isolate_RowVersions isolate
	INNER JOIN @List ids on ids.IsolateId = isolate.IsolateId
  WHERE ids.EntryRowVer != isolate.EntryRowVer
GO

-- CREATE PROCEDURE FVST_DTU.Get_Isolate_RowVersions 
--   @List AS FVST_DTU.IsolateRowVer_List READONLY
-- AS
--   SELECT 
--     distinct isolater.Isolatnr IsolateId, 
--     CAST((SELECT MAX(RowVer)
--     FROM (VALUES (isolater.RowVer),(genores.RowVer),(base.RowVer),(bakterier.RowVer),(ekstra.RowVer),(kma.RowVer),(regioner.RowVer)) AS Allrowversions(RowVer)) AS BIGINT) EntryRowVer
--   FROM dbo.tbl_Isolater_SAP isolater 
--   INNER JOIN @List ids on IsolateId = ids.IsolateId
--   LEFT JOIN dbo.tbl_GenoRes genores ON isolater.Isolatnr = genores.isolatnr
--   LEFT JOIN dbo.tbl_Basis_SAP base
--     LEFT JOIN dbo.tbl_Lande lande ON base.udland = lande.isokode
--     LEFT JOIN dbo.tbl_Baktnavn bakterier ON base.baktid = bakterier.baktid
--     LEFT JOIN dbo.tbl_Basis_Ekstra_SAP ekstra
--       LEFT JOIN dbo.tbl_KMA kma ON ekstra.kmacode = kma.kmanr
--         INNER JOIN dbo.tbl_Region regioner ON ekstra.region = regioner.RegionEnr
--       ON base.provnr = ekstra.provnr
--     ON isolater.CaseProvnr = base.provnr
--  	WHERE ids.EntryRowVer != EntryRowVer
-- GO

-- IF OBJECT_ID ('FVST_DTU.iw_Isolate_RowVersions', 'view') IS NOT NULL
--   DROP VIEW FVST_DTU.iw_Isolate_RowVersions;
-- GO

-- CREATE VIEW FVST_DTU.iw_Isolate_RowVersions
-- AS
--   SELECT 
--     isolater.Isolatnr IsolateId, 
--     CAST((SELECT MAX(RowVer)
--     FROM (VALUES (isolater.RowVer),(genores.RowVer),(base.RowVer),(bakterier.RowVer),(ekstra.RowVer),(kma.RowVer),(regioner.RowVer)) AS Allrowversions(RowVer)) AS BIGINT) RowVer
--   FROM dbo.tbl_Isolater_SAP isolater 
--   LEFT JOIN dbo.tbl_GenoRes genores ON isolater.Isolatnr = genores.isolatnr
--   LEFT JOIN dbo.tbl_Basis_SAP base
--     LEFT JOIN dbo.tbl_Lande lande ON base.udland = lande.isokode
--     LEFT JOIN dbo.tbl_Baktnavn bakterier ON base.baktid = bakterier.baktid
--     LEFT JOIN dbo.tbl_Basis_Ekstra_SAP ekstra
--       LEFT JOIN dbo.tbl_KMA kma ON ekstra.kmacode = kma.kmanr
--         INNER JOIN dbo.tbl_Region regioner ON ekstra.region = regioner.RegionEnr
--       ON base.provnr = ekstra.provnr
--     ON isolater.CaseProvnr = base.provnr
-- GO

-- CREATE UNIQUE CLUSTERED INDEX IDX_iw_Isolate_RowVersions 
--   ON FVST_DTU.iw_Isolate_RowVersions (IsolateId);
-- GO



--  SELECT 
--     isolater.Isolatnr IsolateId, 
--     CAST((SELECT MAX(RowVer)
--     FROM (VALUES (isolater.RowVer),(genores.RowVer),(base.RowVer),(bakterier.RowVer),(ekstra.RowVer),(kma.RowVer),(regioner.RowVer)) AS Allrowversions(RowVer)) AS BIGINT) RowVer
--   FROM FVST_DTU.vw_Isolater_SAP isolater 
--   LEFT JOIN FVST_DTU.vw_GenoRes_SAP genores ON isolater.Isolatnr = genores.isolatnr
--   LEFT JOIN FVST_DTU.vw_Basis_SAP base
--     LEFT JOIN FVST_DTU.vw_Lande_SAP lande ON base.udland = lande.isokode
--     LEFT JOIN FVST_DTU.vw_Baktnavn_SAP bakterier ON base.baktid = bakterier.baktid
--     LEFT JOIN FVST_DTU.vw_Basis_Ekstra_SAP ekstra
--       LEFT JOIN FVST_DTU.vw_KMA_SAP kma ON ekstra.kmacode = kma.kmanr
--         INNER JOIN FVST_DTU.vw_Region_SAP regioner ON ekstra.region = regioner.RegionEnr
--       ON base.provnr = ekstra.provnr
--     ON isolater.CaseProvnr = base.provnr