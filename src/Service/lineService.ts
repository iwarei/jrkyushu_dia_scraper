import axios from "axios";
import * as cheerio from "cheerio";
import type { LineInfo } from "./../types";

/**
 * 時刻表TOPから線名情報を取得する
 * @return {Promise<LineInfo[]>} 線名情報の配列
 */
export const getLineCode = async (): Promise<LineInfo[]> => {
  try {
    const { data } = await axios.get(
      "https://www.jrkyushu-timetable.jp/jr-k_time/top.html"
    );
    const $ = cheerio.load(data);

    const lines: LineInfo[] = [];

    $("tr td a").each((_, e) => {
      const lineName = $(e).text().trim();

      // ほかのリンクも取得されるため.*線となるものを対象にする
      if (
        lineName.includes("線") &&
        lineName.length === lineName.indexOf("線") + 1
      ) {
        const lineLink = $(e).attr("href") ?? "";
        const lineCode = lineLink?.split("/").pop()?.replace(".html", "");

        console.log(lineLink);
        lines.push({ lineName, lineCode });
      }
    });

    return lines;
  } catch (e) {
    console.log(e);
    return [];
  }
};
