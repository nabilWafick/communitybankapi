select
subquery1.product_id as product_id,
subquery1.product_name as product_name,
subquery1.forecast_number,
subquery1.forecast_amount,
coalesce(array_agg(subquery2.customer_id), array[]::bigint[]) as customers_ids,
coalesce(array_agg(subquery2.customer_name), array[]::text[]) as customers_names,
coalesce(array_agg(subquery2.customer_firstname), array[]::text[]) as customers_firstnames,
coalesce(array_agg(subquery2.collector_id), array[]::bigint[]) as collectors_ids,
coalesce(array_agg(subquery2.collector_name), array[]::text[]) as collectors_names,
coalesce(array_agg(subquery2.collector_firstname), array[]::text[]) as collectors_firstnames,
coalesce(array_agg(subquery2.card_id), array[]::bigint[]) as cards_ids,
coalesce(array_agg(subquery2.card_label), array[]::text[]) as cards_labels,
coalesce(array_agg(subquery2.card_type_number), array[]::int[]) as cards_types_numbers,
coalesce(array_agg(subquery2.type_id), array[]::bigint[]) as types_ids,
coalesce(array_agg(subquery2.type_name), array[]::text[]) as types_names,
coalesce(array_agg(subquery2.total_settlement_number), array[]::int[]) as totals_settlements_numbers,
coalesce(array_agg(subquery2.total_settlement_amount), array[]::int[]) as totals_settlements_amounts,
coalesce(array_agg(subquery2.forecast_number), array[]::int[]) as forecast_numbers,
coalesce(array_agg(subquery2.forecast_amount), array[]::int[]) as forecast_amounts
from 
(select
	pdt_tp.pdt_id as product_id,
	pdt_tp.pdt_nm as product_name,
	sum(coalesce(pdt_tp.pdt_nb * c_cd_stt.cd_tn, 0)) as forecast_number,
	sum(
		coalesce(
			pdt_tp.pdt_nb * pdt_tp.pdt_p_p * c_cd_stt.cd_tn,
			0
		)
	) as forecast_amount
from
	(
		select
			p.id as pdt_id,
			p."name" as pdt_nm,
			p.purchase_price as pdt_p_p,
			tp_pdt.product_number as pdt_nb,
			tp.id as tp_id,
			tp."name" as tp_nm,
			tp.stake as tp_stk
		from
			products p,
			"types" tp,
			type_product tp_pdt
		where
			p.id = tp_pdt.product_id
			and tp_pdt.type_id = tp.id
		order by
			p.id,
			tp.id
	) as pdt_tp
	left join (
		select
			c.id as c_id,
			c."name" as c_nm,
			c.firstnames as c_fn,
			clt.id as clt_id,
			clt."name" as clt_nm,
			clt.firstnames as clt_fn,
			cd.id as cd_id,
			cd."label" as cd_lb,
			cd.types_number as cd_tn,
			cd.type_id as tp_id,
			coalesce(cd_stt.tt_stt_nb, 0) as tt_stt_nb,
			cd.types_number * coalesce(cd_stt.tt_stt_nb, 0) * tp.stake as tt_stt_amt
		from
			customers c
			inner join collectors clt on c.collector_id = clt.id
			inner join cards cd on c.id = cd.customer_id
			left join "types" tp on cd.type_id = tp.id
			left join (
				select
					s.card_id as cd_id,
					coalesce(
						SUM(
							case
								when s.is_validated then s."number"
								else 0
							end
						),
						0
					) as tt_stt_nb
				from
					settlements s
				group by
					s.card_id
			) as cd_stt on cd.id = cd_stt.cd_id
		order by
			c.id
	) as c_cd_stt on pdt_tp.tp_id = c_cd_stt.tp_id
	--	where c_cd_stt.tt_stt_nb >= 10
group by
	pdt_tp.pdt_id,
	pdt_tp.pdt_nm
order by
	pdt_tp.pdt_id
) as subquery1 left join 
(select
	pdt_tp.pdt_id as product_id,
	pdt_tp.pdt_nm as product_name,
	c_cd_stt.c_id as customer_id,
	c_cd_stt.c_nm as customer_name,
	c_cd_stt.c_fn as customer_firstname,
	c_cd_stt.clt_id as collector_id,
	c_cd_stt.clt_nm as collector_name,
	c_cd_stt.clt_fn as collector_firstname,
	c_cd_stt.cd_id as card_id,
	c_cd_stt.cd_lb as card_label,
	c_cd_stt.cd_tn as card_type_number,
	pdt_tp.tp_id as type_id,
	pdt_tp.tp_nm as type_name,
	c_cd_stt.tt_stt_nb as total_settlement_number,
	c_cd_stt.tt_stt_amt as total_settlement_amount,
	coalesce(pdt_tp.pdt_nb*c_cd_stt.cd_tn,0)  as forecast_number ,
	coalesce(pdt_tp.pdt_nb*pdt_tp.pdt_p_p*c_cd_stt.cd_tn,0) as forecast_amount  
from
	(
	select
		p.id as pdt_id,
		p."name" as pdt_nm,
		p.purchase_price as pdt_p_p,
		tp_pdt.product_number as pdt_nb,
		tp.id as tp_id,
		tp."name" as tp_nm,
		tp.stake as tp_stk
	from
		products p ,
		"types" tp ,
		type_product tp_pdt
	where
		p.id = tp_pdt.product_id
		and tp_pdt.type_id = tp.id
	order by
		p.id,
		tp.id 
) as pdt_tp
left join
(
select
		c.id as c_id ,
		c."name" as c_nm,
		c.firstnames as c_fn,
		clt.id as clt_id,
		clt."name" as clt_nm,
		clt.firstnames as clt_fn,
		cd.id as cd_id,
		cd."label" as cd_lb,
		cd.types_number as cd_tn,
		cd.type_id as tp_id ,
		coalesce (cd_stt.tt_stt_nb,
		0) as tt_stt_nb,
		cd.types_number * coalesce (cd_stt.tt_stt_nb,
		0)* tp.stake as tt_stt_amt
	from
		customers c
	inner join collectors clt on
		c.collector_id = clt.id
	inner join 
cards cd on
		c.id = cd.customer_id
	left join "types" tp on
		cd.type_id = tp.id
	left join (
		select
			s.card_id as cd_id,
			coalesce(
            SUM(
              case
                when s.is_validated then s."number"
                else 0
              end
            ),
			0
          ) as tt_stt_nb
		from
			settlements s
		group by
			s.card_id
) as cd_stt on
		cd.id = cd_stt.cd_id
	order by
		c.id) 
as c_cd_stt on
	pdt_tp.tp_id = c_cd_stt.tp_id
--	where c_cd_stt.tt_stt_nb >= 10
order by
	pdt_tp.pdt_id,
	c_cd_stt.clt_id,
	c_cd_stt.c_id
	) as subquery2 on subquery1.product_id = subquery2.product_id 
	group by 
	subquery1.product_id,
subquery1.product_name,
subquery1.forecast_number,
subquery1.forecast_amount

