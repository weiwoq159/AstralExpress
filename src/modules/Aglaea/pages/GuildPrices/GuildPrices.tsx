import { useMemo, useState } from "react";

import { Hero } from "@/shared/components";
import { Col, Flex, Row } from "antd";

import AglaeaCover from "@/assets/images/cover/Aglaea.webp";

import { AglaeaNavigation } from "../../navigation";
import { PriceStats, PriceToolbar, ShelfDetail, ShopRanking } from "./components";
import { DEMO_SHOPS } from "./domain/demoShops";
import { listItemNames, rankShops, summarizePrices, type SortOrder } from "./domain/pricing";

export const GuildPrices = () => {
	const [selectedItem, setSelectedItem] = useState<string | null>(null);
	const [order, setOrder] = useState<SortOrder>("asc");
	const [keyword, setKeyword] = useState("");
	const [selectedShopId, setSelectedShopId] = useState<number | null>(null);

	const itemNames = useMemo(() => listItemNames(DEMO_SHOPS), []);
	// 用户没选过道具时默认比第一个，进页面就有排行可看；空字符串（全部店铺）只在用户主动选择时出现。
	const itemName = selectedItem ?? itemNames[0] ?? "";
	const ranked = useMemo(() => rankShops(DEMO_SHOPS, { itemName, order, keyword }), [itemName, order, keyword]);
	const summary = useMemo(() => summarizePrices(DEMO_SHOPS, itemName), [itemName]);
	// 选中的店铺被筛掉后回退到排行第一名，避免右侧停在一个看不见的店铺上。
	const activeShop = ranked.find(({ shop }) => shop.id === selectedShopId)?.shop ?? ranked[0]?.shop ?? null;

	return (
		<Flex vertical gap={16}>
			<Hero
				title={AglaeaNavigation.guildShop.title}
				eyebrow="Aglaea"
				description="记录商会各店铺货架上的道具售价，选定一种道具，按价格给店铺排序，快速找到最便宜的一家。"
				tags={["商会", "货架售价", "比价"]}
				cover={AglaeaCover}
			/>
			<PriceStats summary={summary} itemName={itemName} />
			<PriceToolbar
				itemNames={itemNames}
				itemName={itemName}
				order={order}
				keyword={keyword}
				onItemChange={setSelectedItem}
				onOrderChange={setOrder}
				onKeywordChange={setKeyword}
			/>
			<Row gutter={[16, 16]}>
				<Col xs={24} lg={10}>
					<ShopRanking ranked={ranked} itemName={itemName} activeShopId={activeShop?.id ?? null} onSelect={setSelectedShopId} />
				</Col>
				<Col xs={24} lg={14}>
					<ShelfDetail shop={activeShop} itemName={itemName} />
				</Col>
			</Row>
		</Flex>
	);
};