import axios from 'axios';
import * as cheerio from 'cheerio';
import prisma from './../prisma';
import type { LineInfo } from './../types';

/**
 * 線名情報を取得し登録する
 * @return {Promise<LineInfo[]>} 登録済の線名情報
 */
export const getLineInfo = async (): Promise<LineInfo[]> => {
  return await registLineInfo(await scrapeLineInfo());
};

/**
 * 時刻表TOPから線名情報を取得する
 * @return {Promise<LineInfo[]>} 線名情報の配列
 */
export const scrapeLineInfo = async (): Promise<LineInfo[]> => {
  try {
    const { data } = await axios.get(
      'https://www.jrkyushu-timetable.jp/jr-k_time/top.html',
    );
    const $ = cheerio.load(data);

    const lines: LineInfo[] = [];

    $('tr td a').each((_, e) => {
      const lineName = $(e).text().trim();

      // ほかのリンクも取得されるため.*線となるものを対象にする
      if (
        lineName.includes('線') &&
        lineName.length === lineName.indexOf('線') + 1
      ) {
        const lineLink = $(e).attr('href') ?? '';
        const lineCode = lineLink?.split('/').pop()?.replace('.html', '');

        lines.push({ name: lineName, code: lineCode });
      }
    });

    return lines;
  } catch (e) {
    console.log(e);
    return [];
  }
};

/**
 * 路線情報を登録する
 * @param {LineInfo[]} 線名情報の配列
 */
export const registLineInfo = async (
  lineInfo: LineInfo[],
): Promise<LineInfo[]> => {
  const registered: LineInfo[] = [];

  for (const line of lineInfo) {
    // 既に登録されていないかチェック
    const exist = await prisma.line.findUnique({
      where: {
        code: line.code,
      },
    });

    if (exist) {
      registered.push(exist);
      continue;
    }

    // 登録されていない場合は登録
    const newLine = await prisma.line.create({
      data: {
        name: line.name,
        code: line.code ?? '',
      },
    });
    registered.push(newLine);
  }
  return registered;
};
