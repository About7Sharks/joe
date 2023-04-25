import ImageCharts from "image-charts";
import { getLiquidityPosition } from "./index.js";
import fs from "fs";

const LiquidityPosition = await getLiquidityPosition({ onlyActive: true });
const binIds = LiquidityPosition[0].userBinLiquidities.map(
  (item) => item.binId
);
const liquidities = LiquidityPosition[0].userBinLiquidities.map((item) =>
  parseFloat(item.liquidity)
);

const imageCharts = new ImageCharts()
  .cht("bvs") // vertical bar chart
  .chd(`a:${liquidities.join(",")}`) // chart data
  .chxl(`0:|${binIds.join("|")}`) // axis labels
  .chxt("x,y") // axis display
  .chtt("Liquidity by Bin ID") // chart title
  .chco("7f7f7f") // bar color
  .chs("600x600"); // chart size

const imageUrl = imageCharts.toURL();

(async () => {
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  fs.writeFileSync("./LP.png", imageBuffer);
})();
