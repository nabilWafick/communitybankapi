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
	clt.id,
	c.id;