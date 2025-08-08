-- Script pour insérer les données des ports dans la table port
-- Structure de la table port : id, nom, ville, tauxrk, admin_id

INSERT INTO port (nom, ville, tauxrk) VALUES
('ANP-CASA', 'Casablanca', 0.03),
('ANP-AGADIR', 'Agadir', 0.04),
('ANP-TANGER', 'Tanger', 0.04),
('ANP-KENITRA', 'Kenitra', 0.05),
('ANP-MOHAMEDIA', 'Mohammedia', 0.025),
('ANP-JORF', 'Jorf Lasfar', 0.02),
('ANP-NADOR', 'Nador', 0.03),
('ANP-SAFI', 'Safi', 0.04),
('ANP-LAAYOUNE', 'Laayoune', 0.05),
('ANP SMIR', 'Tétouan', 0.025),
('CHMAALA ANP', 'El Hoceima', 0.02),
('ANP-DAKHLA', 'Dakhla', 0.03),
('ALHOCEIMA', 'Al Hoceima', 0.04),
('TANTAN', 'Tantan', 0.05),
('ELJADIDA', 'El Jadida', 0.025),
('TARFAYA', 'Tarfaya', 0.02),
('ASILAH', 'Asilah', 0.03),
('SIDI IFNI', 'Sidi Ifni', 0.04),
('MDIQ', 'Mdiq', 0.05),
('BOUJDOUR', 'Boujdour', 0.025),
('ESSAOUIRA', 'Essaouira', 0.02),
('JEBHA', 'Jebha', 0.03),
('IMESSOUANE', 'Imessouane', 0.04),
('KSAR SGHIR', 'Ksar Sghir', 0.05),
('KABILA', 'Kabila', 0.025),
('SAAIDIA', 'Saadia', 0.02),
('LAMHIRIZ', 'Lamhiriz', 0.03),
('LARACHE ANP', 'Larache', 0.04),
('RAS KEBDANA', 'Ras Kebdana', 0.05),
('SOUIRIA KDIMA', 'Souiria Kdima', 0.025),
('CALA IRIS', 'Cala Iris', 0.02),
('NVP.SAFI', 'Nouveau Port Safi', 0.03);

-- Si vous voulez vérifier les données insérées
-- SELECT * FROM port ORDER BY libelle; 