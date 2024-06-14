select
    produits.id as id_produit,
    produits.nom as nom_produit,
    produits.prix_achat as prix_achat_produit,
    coalesce(subquery1.prevision_nombre, 0) AS prevision_nombre,
    coalesce(
        subquery1.prevision_montant, 0
    ) as previson_montant
from produits
    left join (
        SELECT
            subquery2.id_produit, subquery2.nom_produit, subquery2.prix_achat_produit, SUM(
                subquery2.nombre_produits_merite
            ) AS prevision_nombre, SUM(
                subquery2.nombre_produits_merite * subquery2.prix_achat_produit
            ) AS prevision_montant
        FROM (
                SELECT
                    produits.id AS id_produit, produits.nom AS nom_produit, produits.prix_achat AS prix_achat_produit, COALESCE(
                        details_types.nombre_produit_type * cartes.nombre_types, 0
                    ) AS nombre_produits_merite
                FROM
                    produits
                    LEFT JOIN (
                        SELECT
                            id AS id_type, UNNEST (ids_produits) AS id_produit_type, UNNEST (nombres_produits) AS nombre_produit_type
                        FROM types
                        GROUP BY
                            id_type
                        ORDER BY id_type
                    ) AS details_types ON produits.id = details_types.id_produit_type
                    LEFT JOIN cartes ON details_types.id_type = cartes.id_type
                    LEFT JOIN (
                        SELECT id_carte, COALESCE(
                                SUM(
                                    CASE
                                        WHEN est_valide THEN nombre
                                        ELSE 0
                                    END
                                ), 0
                            ) AS total_reglements
                        FROM reglements
                        GROUP BY
                            id_carte
                    ) AS bilan_reglements ON bilan_reglements.id_carte = cartes.id
                WHERE
                    bilan_reglements.total_reglements >= 10
                ORDER BY produits.nom ASC, details_types.id_type
            ) AS subquery2
        GROUP BY
            subquery2.id_produit, subquery2.nom_produit, subquery2.prix_achat_produit
    ) as subquery1 on produits.id = subquery1.id_produit
ORDER BY produits.nom ASC;