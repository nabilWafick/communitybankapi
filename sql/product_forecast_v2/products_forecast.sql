select
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