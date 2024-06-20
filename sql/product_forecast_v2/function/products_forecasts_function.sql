CREATE OR REPLACE FUNCTION get_products_forecasts(
    p_product_id BIGINT DEFAULT NULL,
    p_customer_id BIGINT DEFAULT NULL,
    p_collector_id BIGINT DEFAULT NULL,
    p_card_id BIGINT DEFAULT NULL,
    p_type_id BIGINT DEFAULT NULL,
    p_total_settlement_number INT DEFAULT NULL
)
RETURNS TABLE (
    product_id BIGINT,
    product_name TEXT,
    forecast_number INTEGER,
    forecast_amount NUMERIC,
    customers_ids BIGINT[],
    customers_names TEXT[],
    customers_firstnames TEXT[],
    collectors_ids BIGINT[],
    collectors_names TEXT[],
    collectors_firstnames TEXT[],
    cards_ids BIGINT[],
    cards_labels TEXT[],
    cards_types_numbers INT[],
    types_ids BIGINT[],
    types_names TEXT[],
    totals_settlements_numbers INT[],
    totals_settlements_amounts NUMERIC[],
    forecast_numbers INT[],
    forecast_amounts NUMERIC[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        subquery1.product_id,
        subquery1.product_name,
        subquery1.forecast_number::INT,
        subquery1.forecast_amount,
        COALESCE(ARRAY_AGG(subquery2.customer_id), ARRAY[]::BIGINT[]) AS customers_ids,
        COALESCE(ARRAY_AGG(subquery2.customer_name), ARRAY[]::TEXT[]) AS customers_names,
        COALESCE(ARRAY_AGG(subquery2.customer_firstname), ARRAY[]::TEXT[]) AS customers_firstnames,
        COALESCE(ARRAY_AGG(subquery2.collector_id), ARRAY[]::BIGINT[]) AS collectors_ids,
        COALESCE(ARRAY_AGG(subquery2.collector_name), ARRAY[]::TEXT[]) AS collectors_names,
        COALESCE(ARRAY_AGG(subquery2.collector_firstname), ARRAY[]::TEXT[]) AS collectors_firstnames,
        COALESCE(ARRAY_AGG(subquery2.card_id), ARRAY[]::BIGINT[]) AS cards_ids,
        COALESCE(ARRAY_AGG(subquery2.card_label), ARRAY[]::TEXT[]) AS cards_labels,
        COALESCE(ARRAY_AGG(subquery2.card_type_number), ARRAY[]::INT[]) AS cards_types_numbers,
        COALESCE(ARRAY_AGG(subquery2.type_id), ARRAY[]::BIGINT[]) AS types_ids,
        COALESCE(ARRAY_AGG(subquery2.type_name), ARRAY[]::TEXT[]) AS types_names,
        COALESCE(ARRAY_AGG(subquery2.total_settlement_number), ARRAY[]::INT[])::INT[] AS totals_settlements_numbers,
        COALESCE(ARRAY_AGG(subquery2.total_settlement_amount), ARRAY[]::NUMERIC[])::NUMERIC[] AS totals_settlements_amounts,
        COALESCE(ARRAY_AGG(subquery2.forecast_number), ARRAY[]::INT[])::INT[] AS forecast_numbers,
        COALESCE(ARRAY_AGG(subquery2.forecast_amount), ARRAY[]::NUMERIC[])::NUMERIC[] AS forecast_amounts
    FROM 
        (SELECT
            pdt_tp.pdt_id AS product_id,
            pdt_tp.pdt_nm AS product_name,
            SUM(COALESCE(pdt_tp.pdt_nb * c_cd_stt.cd_tn, 0)) AS forecast_number,
            SUM(COALESCE(pdt_tp.pdt_nb * pdt_tp.pdt_p_p * c_cd_stt.cd_tn, 0)) AS forecast_amount
        FROM
            (SELECT
                p.id AS pdt_id,
                p."name" AS pdt_nm,
                p.purchase_price AS pdt_p_p,
                tp_pdt.product_number AS pdt_nb,
                tp.id AS tp_id,
                tp."name" AS tp_nm,
                tp.stake AS tp_stk
            FROM
                products p,
                "types" tp,
                type_product tp_pdt
            WHERE
                p.id = tp_pdt.product_id
                AND tp_pdt.type_id = tp.id
                AND (p_product_id IS NULL OR p.id = p_product_id)
                AND (p_type_id IS NULL OR tp.id = p_type_id)
            ORDER BY
                p.id,
                tp.id
            ) AS pdt_tp
        LEFT JOIN (
            SELECT
                c.id AS c_id,
                c."name" AS c_nm,
                c.firstnames AS c_fn,
                clt.id AS clt_id,
                clt."name" AS clt_nm,
                clt.firstnames AS clt_fn,
                cd.id AS cd_id,
                cd."label" AS cd_lb,
                cd.types_number AS cd_tn,
                cd.type_id AS tp_id,
                COALESCE(cd_stt.tt_stt_nb, 0) AS tt_stt_nb,
                cd.types_number * COALESCE(cd_stt.tt_stt_nb, 0) * tp.stake AS tt_stt_amt
            FROM
                customers c
                INNER JOIN collectors clt ON c.collector_id = clt.id
                INNER JOIN cards cd ON c.id = cd.customer_id
                LEFT JOIN "types" tp ON cd.type_id = tp.id
                LEFT JOIN (
                    SELECT
                        s.card_id AS cd_id,
                        COALESCE(SUM(CASE WHEN s.is_validated THEN s."number" ELSE 0 END), 0) AS tt_stt_nb
                    FROM
                        settlements s
                    GROUP BY
                        s.card_id
                ) AS cd_stt ON cd.id = cd_stt.cd_id
            WHERE
                (p_customer_id IS NULL OR c.id = p_customer_id)
                AND (p_collector_id IS NULL OR clt.id = p_collector_id)
                AND (p_card_id IS NULL OR cd.id = p_card_id)
                AND (p_type_id IS NULL OR cd.type_id = p_type_id)
                AND (p_total_settlement_number IS NULL OR COALESCE(cd_stt.tt_stt_nb, 0) >= p_total_settlement_number)
            ORDER BY
                c.id
        ) AS c_cd_stt ON pdt_tp.tp_id = c_cd_stt.tp_id
        GROUP BY
            pdt_tp.pdt_id,
            pdt_tp.pdt_nm
        ORDER BY
            pdt_tp.pdt_id
        ) AS subquery1 
    LEFT JOIN 
        (SELECT
            pdt_tp.pdt_id AS product_id,
            pdt_tp.pdt_nm AS product_name,
            c_cd_stt.c_id AS customer_id,
            c_cd_stt.c_nm AS customer_name,
            c_cd_stt.c_fn AS customer_firstname,
            c_cd_stt.clt_id AS collector_id,
            c_cd_stt.clt_nm AS collector_name,
            c_cd_stt.clt_fn AS collector_firstname,
            c_cd_stt.cd_id AS card_id,
            c_cd_stt.cd_lb AS card_label,
            c_cd_stt.cd_tn AS card_type_number,
            pdt_tp.tp_id AS type_id,
            pdt_tp.tp_nm AS type_name,
            c_cd_stt.tt_stt_nb AS total_settlement_number,
            c_cd_stt.tt_stt_amt AS total_settlement_amount,
            COALESCE(pdt_tp.pdt_nb * c_cd_stt.cd_tn, 0)  AS forecast_number,
            COALESCE(pdt_tp.pdt_nb * pdt_tp.pdt_p_p * c_cd_stt.cd_tn, 0) AS forecast_amount  
        FROM
            (SELECT
                p.id AS pdt_id,
                p."name" AS pdt_nm,
                p.purchase_price AS pdt_p_p,
                tp_pdt.product_number AS pdt_nb,
                tp.id AS tp_id,
                tp."name" AS tp_nm,
                tp.stake AS tp_stk
            FROM
                products p,
                "types" tp,
                type_product tp_pdt
            WHERE
                p.id = tp_pdt.product_id
                AND tp_pdt.type_id = tp.id
                AND (p_product_id IS NULL OR p.id = p_product_id)
                AND (p_type_id IS NULL OR tp.id = p_type_id)
            ORDER BY
                p.id,
                tp.id 
        ) AS pdt_tp
        LEFT JOIN
            (SELECT
                c.id AS c_id,
                c."name" AS c_nm,
                c.firstnames AS c_fn,
                clt.id AS clt_id,
                clt."name" AS clt_nm,
                clt.firstnames AS clt_fn,
                cd.id AS cd_id,
                cd."label" AS cd_lb,
                cd.types_number AS cd_tn,
                cd.type_id AS tp_id,
                COALESCE(cd_stt.tt_stt_nb, 0) AS tt_stt_nb,
                cd.types_number * COALESCE(cd_stt.tt_stt_nb, 0) * tp.stake AS tt_stt_amt
            FROM
                customers c
                INNER JOIN collectors clt ON c.collector_id = clt.id
                INNER JOIN cards cd ON c.id = cd.customer_id
                LEFT JOIN "types" tp ON cd.type_id = tp.id
                LEFT JOIN (
                    SELECT
                        s.card_id AS cd_id,
                        COALESCE(SUM(CASE WHEN s.is_validated THEN s."number" ELSE 0 END), 0) AS tt_stt_nb
                    FROM
                        settlements s
                    GROUP BY
                        s.card_id
                ) AS cd_stt ON cd.id = cd_stt.cd_id
            WHERE
                (p_customer_id IS NULL OR c.id = p_customer_id)
                AND (p_collector_id IS NULL OR clt.id = p_collector_id)
                AND (p_card_id IS NULL OR cd.id = p_card_id)
                AND (p_type_id IS NULL OR cd.type_id = p_type_id)
                AND (p_total_settlement_number IS NULL OR COALESCE(cd_stt.tt_stt_nb, 0) >= p_total_settlement_number)
            ORDER BY
                c.id
        ) AS c_cd_stt ON pdt_tp.tp_id = c_cd_stt.tp_id
        ORDER BY
            pdt_tp.pdt_id,
            c_cd_stt.clt_id,
            c_cd_stt.c_id
        ) AS subquery2 ON subquery1.product_id = subquery2.product_id 
    GROUP BY 
        subquery1.product_id,
        subquery1.product_name,
        subquery1.forecast_number,
        subquery1.forecast_amount;
END;
$$ LANGUAGE plpgsql;