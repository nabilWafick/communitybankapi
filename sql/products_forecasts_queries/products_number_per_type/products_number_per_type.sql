SELECT
    produits.id as id_produit,
    produits.nom as nom_produit,
    produits.prix_achat as prix_achat_produit,
    details_types.nombre_produit_type,
    details_types.id_type,
    details_types.nom_type
from
    produits
    left join (
        SELECT
            id as id_type, nom as nom_type, unnest (ids_produits) AS id_produit_type, unnest (nombres_produits) AS nombre_produit_type
        FROM types
        GROUP BY
            id_type
        ORDER BY id_type
    ) as details_types on produits.id = details_types.id_produit_type
    -- group by
    --  produits.id,
    --  details_types.id_type
order by
    -- produits.id,
    produits.nom asc;