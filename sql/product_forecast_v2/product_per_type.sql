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