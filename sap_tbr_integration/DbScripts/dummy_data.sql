USE [IB_Tarmbakdata]
GO

INSERT INTO IB_Tarmbakdata.dbo.tbl_KMA (kmanr, kmanavn, regionsnr) VALUES (N'1', N'kma1', N'1');
INSERT INTO IB_Tarmbakdata.dbo.tbl_KMA (kmanr, kmanavn, regionsnr) VALUES (N'2', N'kma2', N'2');

INSERT INTO IB_Tarmbakdata.dbo.tbl_KMA_Lab (SenderCode, Labnavn, Regionsnr) VALUES (N'123', N'Lab1', N'1');
INSERT INTO IB_Tarmbakdata.dbo.tbl_KMA_Lab (SenderCode, Labnavn, Regionsnr) VALUES (N'456', N'Lab2', N'2');

INSERT INTO IB_Tarmbakdata.dbo.tbl_Baktnavn (baktid, baktgrup, bakttype, bakutype, baktnavn, kortnavn, serotype, species) VALUES (N'coli', N'A', N'coli', null, N'E.Coli', N'coli', N'Serotype1', N'coli');
INSERT INTO IB_Tarmbakdata.dbo.tbl_Baktnavn (baktid, baktgrup, bakttype, bakutype, baktnavn, kortnavn, serotype, species) VALUES (N'listeria', N'B', N'list', null, N'Listeria', N'list', N'Serotype2', N'listeria');

INSERT INTO IB_Tarmbakdata.dbo.tbl_Lande (isokode, landnavn, iso2k) VALUES (N'dk', N'Denmark', N'dk');
INSERT INTO IB_Tarmbakdata.dbo.tbl_Lande (isokode, landnavn, iso2k) VALUES (N'us', N'USA', N'us');

INSERT INTO IB_Tarmbakdata.dbo.tbl_Region (Regionsnr, Regionsnavn, RegionEnr) VALUES (N'1', N'Region1', N'1');
INSERT INTO IB_Tarmbakdata.dbo.tbl_Region (Regionsnr, Regionsnavn, RegionEnr) VALUES (N'2', N'Region2', N'2');
INSERT INTO IB_Tarmbakdata.dbo.tbl_Region (Regionsnr, Regionsnavn, RegionEnr) VALUES (N'3', N'Region3', N'3');

INSERT INTO IB_Tarmbakdata.dbo.tbl_Basis_SAP (provnr, lokalnr, cprnr, navn, alder, kon, udland, indskode, provamt, provart, provdato, modtdato, baktid, provnr_old, Rejse, final_infection, [027_marker], tcdA, tcdB, cdtAB, FUDnr) VALUES (N'1', N'1', N'0102030405', N'Alice', 17, N'F', N'dk', null, null, N'A', N'2020-11-20 00:00:00', N'2020-11-21 00:00:00', N'coli', null, N'Y', null, null, null, null, null, N'1');
INSERT INTO IB_Tarmbakdata.dbo.tbl_Basis_SAP (provnr, lokalnr, cprnr, navn, alder, kon, udland, indskode, provamt, provart, provdato, modtdato, baktid, provnr_old, Rejse, final_infection, [027_marker], tcdA, tcdB, cdtAB, FUDnr) VALUES (N'2', N'2', N'0504030201', N'Bob', 18, N'M', N'us', null, null, N'B', N'2020-11-21 00:00:00', N'2020-11-22 00:00:00', N'listeria', null, N'N', null, null, null, null, null, N'2');
INSERT INTO IB_Tarmbakdata.dbo.tbl_Basis_SAP (provnr, lokalnr, cprnr, navn, alder, kon, udland, indskode, provamt, provart, provdato, modtdato, baktid, provnr_old, Rejse, final_infection, [027_marker], tcdA, tcdB, cdtAB, FUDnr) VALUES (N'3', N'3', N'0504030201', N'John', 18, N'M', N'us', null, null, N'C', N'2020-11-21 00:00:00', N'2020-11-22 00:00:00', N'listeria', null, N'N', null, null, null, null, null, N'3');

INSERT INTO IB_Tarmbakdata.dbo.tbl_Basis_Ekstra_SAP (provnr, regdato, kliniskinfo, kmacode, comments, region, analysetype, SenderCode) VALUES (N'1', N'2020-11-23 10:40:00', N'kinfo1', N'1', N'Comment 1', N'1', N'type1', N'123');
INSERT INTO IB_Tarmbakdata.dbo.tbl_Basis_Ekstra_SAP (provnr, regdato, kliniskinfo, kmacode, comments, region, analysetype, SenderCode) VALUES (N'2', N'2020-11-22 11:40:00', N'kinfo2', N'2', N'Comment 2', N'2', N'type2', N'456');

INSERT INTO IB_Tarmbakdata.dbo.tbl_Isolater_SAP (Isolatnr, lokalnr, cprnr, navn, provdato, KMAdato, SSIdato, baktid, CaseProvnr, LimsOrdrekode, Provart, Vaekst, PrimaryIsolate, ST, CaseDef, RunID, FUDNR, ClusterID, Species, Subspecies, Serotype, pathotype, Adheasion, Toxin, AMR_profil, Dato_godkendt_serotype, Dato_godkendt_QC, Dato_godkendt_ST) VALUES (N'1', N'1', N'0102030405', N'Alice', N'2020-11-20 00:00:00', N'2020-11-21 00:00:00', N'2020-11-21 00:00:00', N'coli', N'1', N'1', N'A', null, 1, null, null, N'1', null, null, null, null, null, null, null, null, null, null, null, null);
INSERT INTO IB_Tarmbakdata.dbo.tbl_Isolater_SAP (Isolatnr, lokalnr, cprnr, navn, provdato, KMAdato, SSIdato, baktid, CaseProvnr, LimsOrdrekode, Provart, Vaekst, PrimaryIsolate, ST, CaseDef, RunID, FUDNR, ClusterID, Species, Subspecies, Serotype, pathotype, Adheasion, Toxin, AMR_profil, Dato_godkendt_serotype, Dato_godkendt_QC, Dato_godkendt_ST) VALUES (N'2', N'2', N'0504030201', N'Bob', N'2020-11-21 00:00:00', N'2020-11-22 00:00:00', N'2020-11-22 00:00:00', N'listeria', N'2', N'2', N'B', null, 1, null, null, N'2', null, null, null, null, null, null, null, null, null, null, null, null);
INSERT INTO IB_Tarmbakdata.dbo.tbl_Isolater_SAP (Isolatnr, lokalnr, cprnr, navn, provdato, KMAdato, SSIdato, baktid, CaseProvnr, LimsOrdrekode, Provart, Vaekst, PrimaryIsolate, ST, CaseDef, RunID, FUDNR, ClusterID, Species, Subspecies, Serotype, pathotype, Adheasion, Toxin, AMR_profil, Dato_godkendt_serotype, Dato_godkendt_QC, Dato_godkendt_ST) VALUES (N'3', N'3', N'0104030201', N'John', N'2020-11-21 00:00:00', N'2020-11-22 00:00:00', N'2020-11-22 00:00:00', N'listeria', N'3', N'3', N'C', null, 0, null, null, N'3', null, null, null, null, null, null, null, null, null, null, null, null);

INSERT INTO IB_Tarmbakdata.dbo.tbl_GenoRes (isolatnr, RunID, ResfinderVersion, Dato_godkendt_resistens, Resistensgener, AMR_profil, AMR_Ami, AMR_Amp, AMR_Azi, AMR_Fep, AMR_Fot, AMR_F_C, AMR_Fox, AMR_Taz, AMR_T_C, AMR_Chl, AMR_Cip, AMR_Cli, AMR_Col, AMR_Dap, AMR_Etp, AMR_Ery, AMR_Fus, AMR_Gen, AMR_Imi, AMR_Kan, AMR_Lzd, AMR_Mero, AMR_Mup, AMR_Nal, AMR_Pen, AMR_Syn, AMR_Rif, AMR_Str, AMR_Sul, AMR_Tei, AMR_Trm, AMR_Tet, AMR_Tia, AMR_Tgc, AMR_Tmp, AMR_Van) VALUES (N'1', N'1', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
INSERT INTO IB_Tarmbakdata.dbo.tbl_GenoRes (isolatnr, RunID, ResfinderVersion, Dato_godkendt_resistens, Resistensgener, AMR_profil, AMR_Ami, AMR_Amp, AMR_Azi, AMR_Fep, AMR_Fot, AMR_F_C, AMR_Fox, AMR_Taz, AMR_T_C, AMR_Chl, AMR_Cip, AMR_Cli, AMR_Col, AMR_Dap, AMR_Etp, AMR_Ery, AMR_Fus, AMR_Gen, AMR_Imi, AMR_Kan, AMR_Lzd, AMR_Mero, AMR_Mup, AMR_Nal, AMR_Pen, AMR_Syn, AMR_Rif, AMR_Str, AMR_Sul, AMR_Tei, AMR_Trm, AMR_Tet, AMR_Tia, AMR_Tgc, AMR_Tmp, AMR_Van) VALUES (N'2', N'2', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
INSERT INTO IB_Tarmbakdata.dbo.tbl_GenoRes (isolatnr, RunID, ResfinderVersion, Dato_godkendt_resistens, Resistensgener, AMR_profil, AMR_Ami, AMR_Amp, AMR_Azi, AMR_Fep, AMR_Fot, AMR_F_C, AMR_Fox, AMR_Taz, AMR_T_C, AMR_Chl, AMR_Cip, AMR_Cli, AMR_Col, AMR_Dap, AMR_Etp, AMR_Ery, AMR_Fus, AMR_Gen, AMR_Imi, AMR_Kan, AMR_Lzd, AMR_Mero, AMR_Mup, AMR_Nal, AMR_Pen, AMR_Syn, AMR_Rif, AMR_Str, AMR_Sul, AMR_Tei, AMR_Trm, AMR_Tet, AMR_Tia, AMR_Tgc, AMR_Tmp, AMR_Van) VALUES (N'3', N'3', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

GO