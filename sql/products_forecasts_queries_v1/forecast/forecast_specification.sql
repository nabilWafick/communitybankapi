select
  produits.id as id_produit,
  produits.nom as nom_produit,
  produits.prix_achat as prix_achat_produit,
  coalesce(subquery1.prevision_nombre, 0) AS prevision_nombre,
  coalesce(subquery1.prevision_montant, 0) as previson_montant,
  subquery3.nombres_produits_merites,
  subquery3.nombres_produits_types,
  subquery3.ids_types,
  subquery3.noms_types,
  subquery3.mises_types,
  subquery3.nombres_types_cartes,
  subquery3.ids_cartes,
  subquery3.libelles_cartes,
  subquery3.totaux_reglements_cartes,
  subquery3.montants_reglements_cartes,
  subquery3.ids_charges_compte,
  subquery3.charges_compte,
  subquery3.ids_comptes_clients,
  subquery3.ids_clients,
  subquery3.clients
from
  produits
  left join (
    SELECT
      subquery2.id_produit,
      subquery2.nom_produit,
      subquery2.prix_achat_produit,
      SUM(subquery2.nombre_produits_merite) AS prevision_nombre,
      SUM(
        subquery2.nombre_produits_merite * subquery2.prix_achat_produit
      ) AS prevision_montant
    FROM
      (
        SELECT
          produits.id AS id_produit,
          produits.nom AS nom_produit,
          produits.prix_achat AS prix_achat_produit,
          COALESCE(
            details_types.nombre_produit_type * cartes.nombre_types,
            0
          ) AS nombre_produits_merite
        FROM
          produits
          LEFT JOIN (
            SELECT
              id AS id_type,
              UNNEST(ids_produits) AS id_produit_type,
              UNNEST(nombres_produits) AS nombre_produit_type
            FROM
              types
            GROUP BY
              id_type
            ORDER BY
              id_type
          ) AS details_types ON produits.id = details_types.id_produit_type
          LEFT JOIN cartes ON details_types.id_type = cartes.id_type
        LEFT JOIN comptes_clients ON cartes.id = ANY (comptes_clients.ids_cartes)
      LEFT JOIN charges_compte ON comptes_clients.id_charge_compte = charges_compte.id
          LEFT JOIN (
            SELECT
              id_carte,
              COALESCE(
                SUM(
                  CASE
                    WHEN est_valide THEN nombre
                    ELSE 0
                  END
                ),
                0
              ) AS total_reglements
            FROM
              reglements
            GROUP BY
              id_carte
          ) AS bilan_reglements ON bilan_reglements.id_carte = cartes.id
        WHERE
          bilan_reglements.total_reglements >= 10
          and charges_compte.id = 9
        	and comptes_clients.id = 55
        ORDER BY
          produits.nom ASC,
          details_types.id_type
      ) AS subquery2
    GROUP BY
      subquery2.id_produit,
      subquery2.nom_produit,
      subquery2.prix_achat_produit
  ) as subquery1 on produits.id = subquery1.id_produit
  left join (
    SELECT
      subquery4.id_produit,
      subquery4.nom_produit,
      subquery4.prix_achat_produit,
      COALESCE(
        ARRAY_AGG(subquery4.nombre_produits_merite),
        ARRAY[]::INT[]
      ) AS nombres_produits_merites,
      COALESCE(
        ARRAY_AGG(subquery4.nombre_produit_type),
        ARRAY[]::INT[]
      ) AS nombres_produits_types,
      COALESCE(ARRAY_AGG(subquery4.id_type), ARRAY[]::BIGINT[]) AS ids_types,
      COALESCE(ARRAY_AGG(subquery4.nom_type), ARRAY[]::TEXT[]) AS noms_types,
      COALESCE(
        ARRAY_AGG(subquery4.mise_type),
        ARRAY[]::NUMERIC[]
      ) AS mises_types,
      COALESCE(
        ARRAY_AGG(subquery4.nombre_types_carte),
        ARRAY[]::INT[]
      ) AS nombres_types_cartes,
      COALESCE(ARRAY_AGG(subquery4.id_carte), ARRAY[]::BIGINT[]) AS ids_cartes,
      COALESCE(
        ARRAY_AGG(subquery4.libelle_carte),
        ARRAY[]::TEXT[]
      ) AS libelles_cartes,
      COALESCE(
        ARRAY_AGG(subquery4.total_reglements),
        ARRAY[]::INT[]
      ) AS totaux_reglements_cartes,
      COALESCE(
        ARRAY_AGG(subquery4.montant_reglements),
        ARRAY[]::NUMERIC[]
      ) AS montants_reglements_cartes,
      COALESCE(
        ARRAY_AGG(subquery4.id_charge_compte),
        ARRAY[]::BIGINT[]
      ) AS ids_charges_compte,
      COALESCE(
        ARRAY_AGG(subquery4.charge_compte),
        ARRAY[]::TEXT[]
      ) AS charges_compte,
      COALESCE(
        ARRAY_AGG(subquery4.id_compte_client),
        ARRAY[]::BIGINT[]
      ) AS ids_comptes_clients,
      COALESCE(ARRAY_AGG(subquery4.id_client), ARRAY[]::BIGINT[]) AS ids_clients,
      COALESCE(ARRAY_AGG(subquery4.client), ARRAY[]::TEXT[]) AS clients
    from
      (
        SELECT
          produits.id as id_produit,
          produits.nom as nom_produit,
          produits.prix_achat as prix_achat_produit,
          COALESCE(
            details_types.nombre_produit_type * cartes.nombre_types,
            0
          ) as nombre_produits_merite,
          details_types.nombre_produit_type,
          details_types.id_type,
          details_types.nom_type,
          details_types.mise_type,
          cartes.id AS id_carte,
          cartes.libelle AS libelle_carte,
          cartes.nombre_types AS nombre_types_carte,
          COALESCE(bilan_reglements.total_reglements, 0) AS total_reglements,
          COALESCE(
            cartes.nombre_types * details_types.mise_type * bilan_reglements.total_reglements,
            0
          ) AS montant_reglements,
          comptes_clients.id AS id_compte_client,
          clients.id AS id_client,
          CONCAT(clients.nom, ' ', clients.prenoms) AS client,
          charges_compte.id AS id_charge_compte,
          CONCAT(charges_compte.nom, ' ', charges_compte.prenoms) AS charge_compte
        from
          produits
          left join (
            SELECT
              id as id_type,
              nom as nom_type,
              mise as mise_type,
              unnest(ids_produits) AS id_produit_type,
              unnest(nombres_produits) AS nombre_produit_type
            FROM
              types
            GROUP BY
              id_type
            ORDER BY
              id_type
          ) as details_types on produits.id = details_types.id_produit_type
          LEFT JOIN cartes ON details_types.id_type = cartes.id_type
          LEFT JOIN comptes_clients ON cartes.id = ANY (comptes_clients.ids_cartes)
          LEFT JOIN clients ON comptes_clients.id_client = clients.id
          LEFT JOIN charges_compte ON comptes_clients.id_charge_compte = charges_compte.id
          LEFT JOIN (
            SELECT
              id_carte,
              COALESCE(
                SUM(
                  CASE
                    WHEN est_valide THEN nombre
                    ELSE 0
                  END
                ),
                0
              ) AS total_reglements
            FROM
              reglements
            GROUP BY
              id_carte
          ) AS bilan_reglements ON bilan_reglements.id_carte = cartes.id
        where
          bilan_reglements.total_reglements >= 10
          and charges_compte.id = 9
        	and comptes_clients.id = 55
        ORDER BY
          produits.nom asc,
          details_types.id_type,
          charges_compte.id,
          comptes_clients.id, 
          clients.id
      ) as subquery4
    group by
      subquery4.id_produit,
      subquery4.nom_produit,
      subquery4.prix_achat_produit
  ) as subquery3 on produits.id = subquery3.id_produit
where
  produits.id = 50
ORDER BY
  produits.nom ASC;