select
    subquery.id_produit,
    subquery.nom_produit,
    subquery.prix_achat_produit,
    SUM(
        subquery.nombre_produits_merite
    ) as prevision_nombre,
    SUM(
        subquery.nombre_produits_merite * subquery.prix_achat_produit
    ) as previson_montant
from (
        SELECT
            produits.id as id_produit, produits.nom as nom_produit, produits.prix_achat as prix_achat_produit, COALESCE(
                details_types.nombre_produit_type * cartes.nombre_types, 0
            ) as nombre_produits_merite, details_types.nombre_produit_type, details_types.id_type, details_types.nom_type, details_types.mise_type, cartes.id AS id_carte, cartes.libelle AS libelle_carte, cartes.nombre_types AS nombre_types_carte, COALESCE(
                bilan_reglements.total_reglements, 0
            ) AS total_reglements, COALESCE(
                cartes.nombre_types * details_types.mise_type * bilan_reglements.total_reglements, 0
            ) AS montant_reglements, comptes_clients.id AS id_compte_client, clients.id AS id_client, CONCAT(
                clients.nom, ' ', clients.prenoms
            ) AS client, charges_compte.id AS id_charge_compte, CONCAT(
                charges_compte.nom, ' ', charges_compte.prenoms
            ) AS charge_compte
        from
            produits
            left join (
                SELECT
                    id as id_type, nom as nom_type, mise as mise_type, unnest (ids_produits) AS id_produit_type, unnest (nombres_produits) AS nombre_produit_type
                FROM types
                GROUP BY
                    id_type
                ORDER BY id_type
            ) as details_types on produits.id = details_types.id_produit_type
            LEFT JOIN cartes ON details_types.id_type = cartes.id_type
            LEFT JOIN comptes_clients ON cartes.id = ANY (comptes_clients.ids_cartes)
            LEFT JOIN clients ON comptes_clients.id_client = clients.id
            LEFT JOIN charges_compte ON comptes_clients.id_charge_compte = charges_compte.id
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
        where
            bilan_reglements.total_reglements >= 10
        ORDER BY produits.nom asc, details_types.id_type, charges_compte.id, comptes_clients.id, clients.id
    ) as subquery
group by
    subquery.id_produit,
    subquery.nom_produit,
    subquery.prix_achat_produit,
    subquery.nombre_produits_merite
order by
    -- subquery.id_produit,
    subquery.nom_produit asc;

/*subquery.prix_achat_produit,
subquery.nombre_produits_merite,
subquery.nombre_produit_type,
subquery.id_type,
subquery.nom_type,
subquery.mise_type,
subquery.id_carte,
subquery.libelle_carte,
subquery.nombre_types_carte,
subquery.total_reglements,
subquery.montant_reglements,
subquery.id_compte_client,
subquery.id_client,
subquery.client,
subquery.id_charge_compte,
subquery.charge_compte*/
/*
order by
-- produits.id,
produits.nom asc;
*/