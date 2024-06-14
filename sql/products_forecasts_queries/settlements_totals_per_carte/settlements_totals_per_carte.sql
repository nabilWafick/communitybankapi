SELECT
  subquery3.id_produit,
  subquery3.nom_produit,
  subquery3.prix_achat_produit,
  COALESCE(
    ARRAY_AGG(subquery3.nombre_produits_merite),
    ARRAY[]::INT[]
  ) AS nombres_produits_merites,
  COALESCE(
    ARRAY_AGG(subquery3.nombre_produit_type),
    ARRAY[]::INT[]
  ) AS nombres_produits_types,
  COALESCE(ARRAY_AGG(subquery3.id_type), ARRAY[]::BIGINT[]) AS ids_types,
  COALESCE(ARRAY_AGG(subquery3.nom_type), ARRAY[]::TEXT[]) AS noms_types,
  COALESCE(
    ARRAY_AGG(subquery3.mise_type),
    ARRAY[]::NUMERIC[]
  ) AS mises_types,
  COALESCE(ARRAY_AGG(subquery3.nombre_types_carte), ARRAY[]::INT[]) AS nombres_types_cartes,
  COALESCE(ARRAY_AGG(subquery3.id_carte), ARRAY[]::BIGINT[]) AS ids_cartes,
  COALESCE(
    ARRAY_AGG(subquery3.libelle_carte),
    ARRAY[]::TEXT[]
  ) AS libelles_cartes,
  COALESCE(
    ARRAY_AGG(subquery3.total_reglements),
    ARRAY[]::INT[]
  ) AS totaux_reglements_cartes,
  COALESCE(
    ARRAY_AGG(subquery3.montant_reglements),
    ARRAY[]::NUMERIC[]
  ) AS montants_reglements_cartes,
  COALESCE(
    ARRAY_AGG(subquery3.id_charge_compte),
    ARRAY[]::BIGINT[]
  ) AS ids_charges_compte,
  COALESCE(
    ARRAY_AGG(subquery3.charge_compte),
    ARRAY[]::TEXT[]
  ) AS charges_compte,
  COALESCE(
    ARRAY_AGG(subquery3.id_compte_client),
    ARRAY[]::BIGINT[]
  ) AS ids_comptes_clients,
  COALESCE(ARRAY_AGG(subquery3.id_client), ARRAY[]::BIGINT[]) AS ids_clients,
  COALESCE(ARRAY_AGG(subquery3.client), ARRAY[]::TEXT[]) AS clients
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
    ORDER BY
      produits.nom asc,
      details_types.id_type,
      charges_compte.id,
      comptes_clients.id,
      clients.id
  ) as subquery3
group by
  subquery3.id_produit,
  subquery3.nom_produit,
  subquery3.prix_achat_produit
  ORDER BY
     subquery3.nom_produit asc;